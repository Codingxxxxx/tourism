'use client';
import DashboardContainer from "@/components/dashboard/DashboardContainer";
import { Box, Button, Chip, InputAdornment, ListItemText, MenuItem, Rating, Select, TextField } from '@mui/material'
import { AccountCircle, AddCircleOutline, ConstructionOutlined, Search } from '@mui/icons-material';
import { GridSortModel, type GridColDef, type GridPaginationModel } from '@mui/x-data-grid';
import Link from 'next/link';
import DataGrid from '@/components/datagrid/DataGrid';
import { MetaColumns } from '@/components/datagrid/defaultColumns';
import { useActionState, useEffect, useState } from "react";
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
import { getImagePath } from '@/shared/utils/fileUtils';
import { getAllCategories } from "@/server/actions/category";

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

  const [pending, startTransition] = useTransition();
  const [pendingDelete, startDeleteTransition] = useTransition();
  const [serverResponse, setServerResponse] = useState<ServerResponse | null>();
  const [stat, action] = useActionState(withServerHandler(getDestinations), initialState);
  const [sortModel, setSortModel] = useState<GridSortModel>([
    {
      field: 'createdAt',
      sort: 'desc',
    },
  ]);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      startTransition(() => {
        if (!sortModel[0]) return;
        const sortParams = sortModel[0];
        const offset = getPageOffset(paginationModel.page, paginationModel.pageSize);
        action({
          limit: paginationModel.pageSize,
          offset,
          orderBy: sortParams.field,
          order: sortParams.sort === 'desc' ? 'DESC' : 'ASC',
          name: search,
          categoryId: String(categoryId || '')
        });
      });
    }, 500); // 500ms debounce delay

    return () => clearTimeout(timeout); // Cancel timeout if search changes quickly
  }, [search]);

 useEffect(() => {
  let isMounted = true;

  startTransition(() => {
    if (!isMounted || !sortModel[0]) return;

    const sortParams = sortModel[0];
    const offset = getPageOffset(paginationModel.page, paginationModel.pageSize);

    action({
      limit: paginationModel.pageSize,
      offset,
      orderBy: sortParams.field,
      order: sortParams.sort === 'desc' ? 'DESC' : 'ASC',
      name: search,
      categoryId: String(categoryId || '')
    });
  });

  return () => {
    isMounted = false;
  };
  }, [paginationModel, sortModel, categoryId]);

  useEffect(() => {
    startTransition(async () => {
      const { data } = await getAllCategories();
      setCategories(data ?? []);
    })
  }, []);

  const onConfirmedDelete = (id: string) => {
    startDeleteTransition(async () => {
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
      width: 200,
      sortable: true
    },
    {
      field: 'location',
      headerName: 'Location',
      width: 200,
      sortable: true,
      renderCell: ({ value }) => {
        if (!value) return value;
        return (value as Location).name;
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
            src={value ? getImagePath(value) : NO_IMAGE} 
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Box>
            {/* Search box */}
            <TextField
              sx={{
                marginRight: 2
              }}
              placeholder='Search a destination...'
              size='small'
              onChange={(evt) => setSearch(evt.currentTarget.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Search />
                    </InputAdornment>
                  ),
                },
              }}
            />
            {/* Category */}
            <Select
              size='small'
              sx={{
                width: 300
              }}
              defaultValue={0}
              onChange={(evt) => setCategoryId(Number(evt.target.value))}
            >
              <MenuItem value={0} autoFocus>Select a category</MenuItem>
              {categories.map((category) => [
                <MenuItem
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </MenuItem>,
      
                ...(category.child?.map((child) => (
                  <MenuItem
                    key={child.id}
                    value={child.id}
                    sx={{
                      paddingLeft: 6
                    }}
                  >
                    {child.name}
                  </MenuItem>
                )) ?? []),
              ])}
            </Select>
          </Box>
          <Button variant='contained' size='large' sx={{ marginBottom: 2 }} LinkComponent={Link} href='destinations/new'>
            <AddCircleOutline sx={{ marginRight: 1 }} />
            new destination
          </Button>
        </Box>
        <DataGrid
          columns={columns} 
          rows={stat.data?.destinations}
          paginationMode='server'
          sortingMode='server'
          loading={pending}
          rowCount={stat.data?.meta?.total}  
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          sortingOrder={['asc', 'desc']}
        />
      </Box>
      {serverResponse && <Toast success={serverResponse.success} message={serverResponse.message} />}
      <CustomBackdrop open={pendingDelete} />
    </DashboardContainer>
  )
} 