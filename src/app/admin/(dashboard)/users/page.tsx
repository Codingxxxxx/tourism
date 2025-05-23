'use client';
import DashboardContainer from "@/components/dashboard/DashboardContainer";
import { Box, Button } from '@mui/material'
import { AddCircleOutline } from '@mui/icons-material';
import { type GridColDef, type GridPaginationModel } from '@mui/x-data-grid';
import Link from 'next/link';
import DataGrid from '@/components/datagrid/DataGrid';
import { MetaColumns } from '@/components/datagrid/defaultColumns';
import { startTransition, useActionState, useEffect, useState } from "react";
import { PaginatedUsers } from "@/shared/types/serverActions";
import { getPageOffset } from '@/shared/utils/paginationUtils';
import { ServerResponse } from "@/shared/types/serverActions";
import { withServerHandler } from "@/shared/utils/apiUtils";
import { getUsers } from '@/server/actions/user';
import { Role } from '@/shared/types/dto';

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
    headerName: 'Roles',
    renderCell: ({ value }) => {
      return (value as Role[] || []).map(role => role.name).join(', ');
    }
  },
  ...MetaColumns
]

export default function Page() {
  const initialState: ServerResponse<PaginatedUsers> = {
    data: {
      users: [],
      meta: {
        total: 0
      }
    }
  };

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
          loading={isPending} 
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
        />
      </Box>
    </DashboardContainer>
  )
} 