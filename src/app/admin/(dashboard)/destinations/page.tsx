'use client';
import DashboardContainer from "@/components/dashboard/DashboardContainer";
import { Box, Button, Chip, Rating } from '@mui/material'
import { AddCircleOutline } from '@mui/icons-material';
import { GridRenderCellParams, type GridColDef, type GridPaginationModel } from '@mui/x-data-grid';
import Link from 'next/link';
import DataGrid from '@/components/datagrid/DataGrid';
import { MetaColumns } from '@/components/datagrid/defaultColumns';
import { getLocations } from "@/server/actions/location";
import { startTransition, useActionState, useEffect, useState } from "react";
import { PaginatedLocations } from "@/shared/types/serverActions/category";
import { getPageOffset } from '@/shared/utils/paginationUtils';
import { PaginateDestination, ServerResponse } from "@/shared/types/serverActions";
import { withServerHandler } from "@/shared/utils/apiUtils";
import { Category } from '@/shared/types/dto';
import { getDestinations } from '@/server/actions/destination';
import Image from 'next/image';

const NO_IMAGE = '/admin/no_place_image.jpg'

const columns: GridColDef[] = [
  {
    field: 'name',
    headerName: 'Place Name',
    width: 200
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
          className='rounded p-2' 
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
    width: 200
  },
  ...MetaColumns
]

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
          loading={isPending} 
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
        />
      </Box>
    </DashboardContainer>
  )
} 