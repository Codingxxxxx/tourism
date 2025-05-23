import { type GridColDef } from '@mui/x-data-grid';
import { formatDate } from 'date-fns';

export const MetaColumns: GridColDef[] = [
  {
    field: 'user',
    headerName: 'Created By',
    renderCell: ({ value }) => {
      return value?.username || 'N/A';
    },
    width: 100
  },
  {
    field: 'createdAt',
    headerName: 'Created At',
    flex: 1,
    renderCell: ({ value }) => {
      if (!value) return 'N/A';
      return formatDate(value, 'yyyy-mm-dd hh:mm a');
    }
  }
]