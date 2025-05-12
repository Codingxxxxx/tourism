import { type GridColDef } from '@mui/x-data-grid';
import { formatDate } from 'date-fns';

export const MetaColumns: GridColDef[] = [
  {
    field: 'createdBy',
    headerName: 'Created By',
    flex: 1
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