'use client';
import DashboardContainer from "@/components/dashboard/DashboardContainer";
import { Box, Button, Chip } from '@mui/material'
import { AddCircleOutline } from '@mui/icons-material';
import { type GridColDef, type GridPaginationModel } from '@mui/x-data-grid';
import Link from 'next/link';
import DataGrid from '@/components/datagrid/DataGrid';
import { MetaColumns } from '@/components/datagrid/defaultColumns';
import { startTransition, useActionState, useEffect, useState, useTransition } from "react";
import { PaginatedUsers } from "@/shared/types/serverActions";
import { getPageOffset } from '@/shared/utils/paginationUtils';
import { ServerResponse } from "@/shared/types/serverActions";
import { handleServerAction, withServerHandler } from "@/shared/utils/apiUtils";
import { deleteUser, getUsers } from '@/server/actions/user';
import { Role } from '@/shared/types/dto';
import ButtonAction from '@/components/datagrid/ButtonAction';
import { CustomBackdrop } from '@/components/Backdrop';
import Toast from '@/components/form/Toast';

export default function Page() {
  const initialState: ServerResponse<PaginatedUsers> = {
    data: {
      users: [],
      meta: {
        total: 0
      }
    }
  };

  const [serverResponse, setServerResponse] = useState<ServerResponse | null>();
  const [isPendingDelete, startTransition] = useTransition();
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: 10,
    page: 0
  });

  const [stat, action, isPending] = useActionState(withServerHandler(getUsers), initialState);

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
      const res = await handleServerAction(() => deleteUser(id))

      if (res.success) setPaginationModel({
        pageSize: 10,
        page: 0
      })

      setServerResponse(res);
    });
  }

  const columns: GridColDef[] = [
    {
      field: 'username',
      headerName: 'Username'
    },
    {
      field: 'firstName',
      headerName: 'First Name'
    },
    {
      field: 'lastName',
      headerName: 'Last Name'
    },
    {
      field: 'email',
      headerName: 'Email'
    },
    {
      field: 'roles',
      headerName: 'Role',
      renderCell: ({ value }) => {
        if (!value) return;
        return (value as Role[] || []).map(role => <Chip label={role.name} variant='filled' />);
      }
    },
    ...MetaColumns,
    {
      field: 'id',
      headerName: 'Actions',
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ value }) => {
        return <ButtonAction editFormLink={`users/edit/${value}`} onConfirmDelete={() => onConfirmedDelete(value)} />
      },
      width: 250
    }
  ]

  return (
    <DashboardContainer>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'end' }}>
        <Button variant='contained' size='large' sx={{ marginBottom: 2 }} LinkComponent={Link} href='users/new'>
          <AddCircleOutline sx={{ marginRight: 1 }} />
          new user
        </Button>
        <DataGrid 
          columns={columns} 
          rows={stat.data?.users}
          paginationMode='server'
          rowCount={stat.data?.meta?.total} 
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
        />
      </Box>
      {serverResponse && <Toast success={serverResponse.success} message={serverResponse.message} />}
      <CustomBackdrop open={isPendingDelete} />
    </DashboardContainer>
  )
} 