'use client';
import DashboardContainer from "@/components/dashboard/DashboardContainer";
import { Box, Button, Chip, Link as MuiLink } from '@mui/material'
import { AddCircleOutline, CategoryOutlined } from '@mui/icons-material';
import { type GridColDef, type GridPaginationModel } from '@mui/x-data-grid';
import Link from 'next/link';
import DataGrid from '@/components/datagrid/DataGrid';
import { MetaColumns } from '@/components/datagrid/defaultColumns';
import { deleteCategory, getCategories } from "@/server/actions/category";
import { useActionState, useEffect, useState } from "react";
import { PaginatedCategories } from "@/shared/types/serverActions";
import { getPageOffset } from '@/shared/utils/paginationUtils';
import { ServerResponse } from "@/shared/types/serverActions";
import { Category, PaginationParamters } from "@/shared/types/dto";
import { handleServerAction, withServerHandler } from "@/shared/utils/apiUtils";
import Image from 'next/image';
import { getImagePath } from '@/shared/utils/fileUtils';
import ButtonAction from '@/components/datagrid/ButtonAction';
import { CustomBackdrop } from '@/components/Backdrop';
import { useTransition, } from 'react';
import Toast from '@/components/form/Toast';

export default function PageCategory() {
  const initialState: ServerResponse<PaginatedCategories> = {
    data: {
      categories: [],
      meta: {
        total: 0
      }
    }
  };

  const [isPendingDelete, startTransition] = useTransition();
  const [serverResponse, setServerResponse] = useState<ServerResponse | null>();

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: 15,
    page: 0
  });

  const [stat, action, isPending] = useActionState(withServerHandler(getCategories), initialState);

  useEffect(() => {
    startTransition(() => {
      try {
       const offset = getPageOffset(paginationModel.page, paginationModel.pageSize);
        action({
          limit: paginationModel.pageSize,
          offset
        }); 
      } catch (error) {
        console.error(error);
      }
    })
  }, [paginationModel]);

  const onConfirmedDelete = (id: string) => {
    startTransition(async () => {
      setServerResponse(null);

      const respones = await handleServerAction(() => deleteCategory(id));
      console.log(respones);
      setServerResponse(respones);

      if (respones.success) return setPaginationModel({
        pageSize: 15,
        page: 0
      });

    });
  }

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Category',
      renderCell: ({ value, row }) => {
        if (!value) return;
        const category = row as Category;

        if (category.parentId > 0) return `${value} (Sub)`
        return value;
      }
    },
    {
      align: 'center',
      headerAlign: 'center',
      field: 'type',
      headerName: 'Type',
      renderCell: ({ row }) => {
        if (!row) return 'N/A';
        const category = row as Category;
        if (category.parentId  === 0) return <Chip label='Main Category' variant='outlined' color='secondary' />;
        return <Chip label='Sub Category' variant='outlined' color='success' />
      },
      width: 150
    },
    {
      align: 'center',
      headerAlign: 'center',
      headerName: 'Ordering',
      field: 'ordering',
      renderCell: ({ value }) => {
        if (value) return 0;
        return value;
      }
    },
    {
      align: 'center',
      headerAlign: 'center',
      field: 'photo',
      headerName: 'Cover Photo',
      renderCell: ({ row }) => {
        if (!row) return;
        const cate = row as Category;

        if (cate.parent) return '';

        if (cate.photo) return <Image className='m-auto' src={getImagePath(cate.photo)} style={{ objectFit: 'cover' }} width={60} height={60} alt={cate.name} />;
      },
      width: 150
    },
    { 
      field: 'parent',
      headerName: 'Parent Category',
      renderCell: ({ row }) => {
        if (!row) return;
        const category = row as Category;
        if (!category.parent) return;
        return <Chip label={category.parent.name} variant='outlined' />;  
      }
    },
    ...MetaColumns,
    {
      field: 'id',
      align: 'center',
      headerAlign: 'center',
      headerName: 'Actions',
      renderCell: ({ value }) => {
        return <ButtonAction editFormLink={`/admin/categories/edit/${value}`} onConfirmDelete={() => onConfirmedDelete(value)} />
      },
      width: 200,
      minWidth: 200
    }
  ]

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
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
        />
      </Box>
      <CustomBackdrop open={isPendingDelete} />
      {serverResponse && <Toast open={true} success={serverResponse.success} message={serverResponse.message} />}
    </DashboardContainer>
  )
} 