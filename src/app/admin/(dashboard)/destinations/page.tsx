'use client';
import DashboardContainer from "@/components/dashboard/DashboardContainer";
import { Box, Button, Chip, Rating } from '@mui/material'
import { AddCircleOutline } from '@mui/icons-material';
import { type GridColDef, type GridPaginationModel } from '@mui/x-data-grid';
import Link from 'next/link';
import DataGrid from '@/components/datagrid/DataGrid';
import { MetaColumns } from '@/components/datagrid/defaultColumns';
import { startTransition, useActionState, useEffect, useState } from "react";
import { getPageOffset } from '@/shared/utils/paginationUtils';
import { PaginateDestination, ServerResponse } from "@/shared/types/serverActions";
import { handleServerAction, withServerHandler } from "@/shared/utils/apiUtils";
import type { Category, Location } from '@/shared/types/dto';
import { deleteDestinationById, getDestinations } from '@/server/actions/destination';
import Image from 'next/image';
import ButtonAction from '@/components/datagrid/ButtonAction';
import { useTransition } from 'react';
import { CustomBackdrop } from '@/components/Backdrop';
import Toast from '@/components/form/Toast';

const NO_IMAGE = '/admin/no_place_image.jpg'

export default function PageCategory() {
  const initialState: ServerResponse<PaginateDestination> = {
    data: {
      destinations: [],
      meta: {
        total: 0
      }
    }
  };

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: 10,
    page: 0
  });

  const [isDeletePending, startTransition] = useTransition();
  const [serverResponse, setServerResponse] = useState<ServerResponse | null>();
  const [stat, action, isPending] = useActionState(withServerHandler(getDestinations), initialState);

  useEffect(() => {
    startTransition(() => {
      const offset = getPageOffset(paginationModel.page, paginationModel.pageSize);
      action({
        limit: paginationModel.pageSize,
        offset
      });
    });
  }, [paginationModel]);

  const onConfirmedDelete = (id: string) => {
    startTransition(async () => {
      setServerResponse(null);
      const response =await handleServerAction(() => deleteDestinationById(id));

      if (response.success) setPaginationModel({
        page: 0,
        pageSize: 10
      })

      setServerResponse(response);
    });
  }

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Place Name',
      width: 200
    },
    {
      field: 'location',
      headerName: 'Location',
      width: 200,
      renderCell: ({ value }) => {
        return (value as Location).name || 'N/A';
      }
    },
    {
      field: 'categories',
      headerName: 'Categories',
      renderCell: ({ value }) => {
        return (value as Category[]).map(category => <Chip size='small' label={category.name} />);
      },
      width: 250
    },
    {
      field: 'cover',
      headerName: 'Image',
      renderCell: ({ value, row }) => {
        return (
          <Image 
            objectFit='cover' 
            className='rounded p-1' 
            src={value ? `/cdn?photoUrl=${encodeURIComponent(value)}` : NO_IMAGE} 
            alt={value ? row.name : 'No Image'} 
            onError={(e) => {
              e.currentTarget.src = NO_IMAGE
            }}
            width={100}
            height={100}
          />
        )
      },
      width: 100 
    },
    {
      field: 'ratingScore',
      headerName: 'Rating Score',
      renderCell: ({ value }) => {
        return <Rating size='small' value={value} />
      },
      width: 150
    },
    {
      field: 'contactNumber',
      headerName: 'Contact',
      renderCell: ({ value }) => {
        return value || 'N/A';
      },
      width: 150
    },
    ...MetaColumns,
    {
      field: 'id',
      headerName: 'Actions',
      align: 'center',
      headerAlign: 'center',
      width: 200,
      renderCell: ({ value }) => {
        return <ButtonAction editFormLink={`destinations/edit/${value}`} onConfirmDelete={() => onConfirmedDelete(value)}  />
      }
    }
  ]

  return (
    <DashboardContainer>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'end' }}>
        <Button variant='contained' size='large' sx={{ marginBottom: 2 }} LinkComponent={Link} href='destinations/new'>
          <AddCircleOutline sx={{ marginRight: 1 }} />
          new destination
        </Button>
        <DataGrid
          autoResize={false}
          columns={columns} 
          rows={stat.data?.destinations}
          paginationMode='server'
          rowCount={stat.data?.meta?.total}  
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
        />
      </Box>
      {serverResponse && <Toast success={serverResponse.success} message={serverResponse.message} />}
      <CustomBackdrop open={isDeletePending} />
    </DashboardContainer>
  )
} 