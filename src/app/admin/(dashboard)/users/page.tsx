'use client'
import { Box, Button, Paper } from '@mui/material';
import { AddCircleOutline } from '@mui/icons-material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import Link from 'next/link';
import DashboardContainer from '@/components/dashboard/DashboardContainer';

const columns: GridColDef[] = [
  { sortable: false, disableColumnMenu: true,  field: 'fullname', headerName: 'Full name' },
  { sortable: false, disableColumnMenu: true,  field: 'username', headerName: 'Username'},
  { sortable: false, disableColumnMenu: true,  field: 'role', headerName: 'Role' },
  { sortable: false, disableColumnMenu: true,  field: 'created_at', headerName: 'Created At', width: 200 },
  { sortable: false, disableColumnMenu: true,  field: 'created_by', headerName: 'Created By' }
];

const rows = [
  { id: 1, fullname: 'Snow', username: 'Jon', role: 'Admin', created_at: '2025-03-12 03:12 PM', created_by: 'John' },
  { id: 2, fullname: 'Lannister', username: 'Cersei', role: 'Admin', created_at: '2025-03-12 03:12 PM', created_by: 'John' },
  { id: 3, fullname: 'Lannister', username: 'Jaime', role: 'Admin', created_at: '2025-03-12 03:12 PM', created_by: 'John' },
  { id: 4, fullname: 'Stark', username: 'Arya', role: 'Admin', created_at: '2025-03-12 03:12 PM', created_by: 'John' },
  { id: 5, fullname: 'Targaryen', username: 'Daenerys', role: 'Admin', created_at: '2025-03-12 03:12 PM', created_by: 'John' },
  { id: 6, fullname: 'Melisandre', username: null, role: 'Admin', created_at: '2025-03-12 03:12 PM', created_by: 'John' },
  { id: 7, fullname: 'Clifford', username: 'Ferrara', role: 'Admin', created_at: '2025-03-12 03:12 PM', created_by: 'John' },
  { id: 8, fullname: 'Frances', username: 'Rossini', role: 'Admin', created_at: '2025-03-12 03:12 PM', created_by: 'John' },
  { id: 9, fullname: 'Roxie', username: 'Harvey', role: 'Admin', created_at: '2025-03-12 03:12 PM', created_by: 'John' } 
];

const paginationModel = { page: 0, pageSize: 5 };

export default function Page() {
  return (
    <DashboardContainer>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'end' }}>
        <Button variant='contained' size='large' sx={{ marginBottom: 2 }} LinkComponent={Link} href='users/new'>
          <AddCircleOutline sx={{ marginRight: 1 }} />
          new user
        </Button>
        <Paper sx={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            initialState={{ pagination: { paginationModel } }}
            pageSizeOptions={[5, 10]}
            sx={{ border: 0 }}
            getRowId={(row) => row.id}
            rowSelection={false}
            disableRowSelectionOnClick={true}
          />
        </Paper>
      </Box>
    </DashboardContainer>
  )
} 