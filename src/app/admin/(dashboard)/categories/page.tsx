'use client';
import DashboardContainer from "@/components/dashboard/DashboardContainer";
import { Box, Button, Paper } from '@mui/material'
import { AddCircleOutline } from '@mui/icons-material';
import { type GridColDef } from '@mui/x-data-grid';
import Link from 'next/link';
import DataGrid from '@/components/datagrid/DataGrid';
import { MetaColumns } from '@/components/datagrid/defaultColumns';
import { getCategories } from "@/server/actions/category";
import { startTransition, useActionState, useEffect, useState } from "react";
import { PaginatedCategories } from "@/shared/types/serverActions/category";

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
  const initialState: PaginatedCategories = {
    categories: [],
    meta: null
  };

  const [stat, action, isPending] = useActionState(getCategories, initialState);

  useEffect(() => {
    startTransition(() => {
      action({
        limit: 10,
        offset: 0
      })
    })
  }, []);

  return (
    <DashboardContainer>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'end' }}>
        <Button variant='contained' size='large' sx={{ marginBottom: 2 }} LinkComponent={Link} href='categories/new'>
          <AddCircleOutline sx={{ marginRight: 1 }} />
          new category
        </Button>
        <DataGrid columns={columns} rows={stat.categories} loading={isPending} />
      </Box>
    </DashboardContainer>
  )
} 