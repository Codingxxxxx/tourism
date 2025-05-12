'use client';
import DashboardContainer from "@/components/dashboard/DashboardContainer";
import { Box, Button, Paper } from '@mui/material'
import { AddCircleOutline } from '@mui/icons-material';
import { type GridColDef } from '@mui/x-data-grid';
import Link from 'next/link';
import { Category, PaginationMeta } from '@/shared/types/dto';
import DataGrid from '@/components/datagrid/DataGrid';
import { MetaColumns } from '@/components/datagrid/defaultColumns';

type Props = {
  categories: Category[],
  paginationMeta?: PaginationMeta
}

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
];

export default function PageCategory({ categories, paginationMeta }: Props) {
  return (
    <DashboardContainer>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'end' }}>
        <Button variant='contained' size='large' sx={{ marginBottom: 2 }} LinkComponent={Link} href='categories/new'>
          <AddCircleOutline sx={{ marginRight: 1 }} />
          new category
        </Button>
        <Paper sx={{ height: 400, width: '100%' }}>
          <DataGrid columns={columns} rows={categories} />
        </Paper>
      </Box>
    </DashboardContainer>
  )
} 