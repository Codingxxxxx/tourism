'use client';
import DashboardContainer from "@/components/dashboard/DashboardContainer";
import { Box, Button, responsiveFontSizes } from '@mui/material'
import { AddCircleOutline } from '@mui/icons-material';
import { type GridColDef, type GridPaginationModel } from '@mui/x-data-grid';
import Link from 'next/link';
import DataGrid from '@/components/datagrid/DataGrid';
import { MetaColumns } from '@/components/datagrid/defaultColumns';
import { deleteLocation, getLocations } from "@/server/actions/location";
import { useActionState, useEffect, useState, useTransition } from "react";
import { PaginatedLocations } from "@/shared/types/serverActions";
import { getPageOffset } from '@/shared/utils/paginationUtils';
import { ServerResponse } from "@/shared/types/serverActions";
import { handleServerAction, withServerHandler } from "@/shared/utils/apiUtils";
import EditButton from '@/components/datagrid/ButtonEdit';
import DeleteButton from '@/components/datagrid/ButtonDelete';
import { CustomBackdrop } from '@/components/Backdrop';
import Toast from '@/components/form/Toast';
import { Location } from '@/shared/types/dto';

export default function Page() {
  const initialState: ServerResponse<PaginatedLocations> = {
    data: {
      locations: [],
      meta: {
        total: 0
      }
    }
  };

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: 10,
    page: 0
  });

  const [stat, action, isPending] = useActionState(withServerHandler(getLocations), initialState);
  const [isPendingDelete, startTransition] = useTransition();
  const [serverResponse, setServerResponse] = useState<ServerResponse | null>(null);

  useEffect(() => {
    startTransition(() => {
      const offset = getPageOffset(paginationModel.page, paginationModel.pageSize);
      action({
        limit: paginationModel.pageSize,
        offset
      });
    });
  }, [paginationModel]);

  const onConfirmedDelete = (id: number) => {
    startTransition(async () => {
      setServerResponse(null);
      const response = await handleServerAction(() => deleteLocation(id));
      setServerResponse(response);

      // refresh datatable
      if (response.success) {
        setPaginationModel({
          pageSize: 10,
          page: 0
        })
      }
    })
  }

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Location Name'
    },
    {
      field: 'remark',
      headerName: 'Description'
    },
    {
      field: 'latitude',
      headerName: 'Lat & Long',
      renderCell: ({ row }) => {
        if (!row) return 'N/A';
        const location = row as Location;
        return (location.latitude ?? 'N/A') + ', ' + (location.longitude ?? 'N/A');
      }
    },
    ...MetaColumns,
    {
      field: 'id',
      headerName: 'Action',
      headerAlign: 'center',
      align: 'center',
      renderCell: ({ value }) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 0.5  }}>
            <EditButton href={`locations/edit/${value}`} LinkComponent={Link} />
            <DeleteButton onConfirmed={() => onConfirmedDelete(value)}  />
          </Box>
        )
    }
  }];

  return (
    <DashboardContainer>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'end' }}>
        <Button variant='contained' size='large' sx={{ marginBottom: 2 }} LinkComponent={Link} href='locations/new'>
          <AddCircleOutline sx={{ marginRight: 1 }} />
          new location
        </Button>
        <DataGrid 
          columns={columns} 
          rows={stat.data?.locations}
          paginationMode='server'
          rowCount={stat.data?.meta?.total} 
          loading={false} 
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
        />
      </Box>
      <CustomBackdrop open={isPendingDelete} />
      <Toast open={serverResponse != null} success={serverResponse?.success} message={serverResponse?.message} />
    </DashboardContainer>
  )
} 