import { type GridColDef } from '@mui/x-data-grid';
import { formatDate } from 'date-fns';

export const MetaColumns: GridColDef[] = [
  {
    field: '',
    headerName: 'Created By',
    renderCell: ({ row }) => {
      if ('createdBy' in row) return row.createdBy;
      if ('user' in row) return row.user.username;
      return 'N/A';
    },
    width: 100
  },
  {
    field: 'createdAt',
    headerName: 'Created At',
    width: 200,
    headerAlign: 'center',
    align: 'center',
    renderCell: ({ value }) => {
      if (!value) return 'N/A';
      return formatDate(value, 'yyyy-mm-dd hh:mm a');
    }
  }
]