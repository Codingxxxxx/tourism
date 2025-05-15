'use client';
import DashboardContainer from "@/components/dashboard/DashboardContainer";
import { Box, Button, Paper } from '@mui/material'
import { AddCircleOutline } from '@mui/icons-material';
import { type GridColDef, type GridPaginationModel } from '@mui/x-data-grid';
import Link from 'next/link';
import DataGrid from '@/components/datagrid/DataGrid';
import { MetaColumns } from '@/components/datagrid/defaultColumns';
import { getCategories } from "@/server/actions/category";
import { startTransition, useActionState, useEffect, useState } from "react";
import { PaginatedCategories } from "@/shared/types/serverActions/category";
import { getPageOffset } from '@/shared/utils/paginationUtils';
import { ServerResponse } from "@/shared/types/serverActions";
import { PaginationParamters } from "@/shared/types/dto";
import { withServerHandler } from "@/shared/utils/apiUtils";
const columns: GridColDef[] = [
  {
    field: 'name',
    headerName: 'Cateogry EN'
  },
  {
    field: 'nameKH',
    headerName: 'Category KH'
  },
  {
    field: 'description',
    headerName: 'Description'
  },
  ...MetaColumns
]

export default function PageCategory() {
  const initialState: ServerResponse<PaginatedCategories> = {
    data: {
      categories: [],
      meta: {
        total: 0
      }
    }
  };

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: 10,
    page: 0
  });

  const [stat, action, isPending] = useActionState(withServerHandler(getCategories), initialState);

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
        <Button variant='contained' size='large' sx={{ marginBottom: 2 }} LinkComponent={Link} href='categories/new'>
          <AddCircleOutline sx={{ marginRight: 1 }} />
          new category
        </Button>
        <DataGrid 
          columns={columns} 
          rows={stat.data?.categories}
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