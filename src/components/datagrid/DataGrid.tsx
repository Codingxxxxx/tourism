import { DataGrid as Datatable, type GridColDef } from '@mui/x-data-grid';
import { Paper } from '@mui/material'

type Props = {
  rows: Array<any>,
  columns: GridColDef[]
  loading: boolean
}

export function withDefaultFlex(columns: GridColDef[]): GridColDef[] {
  return columns.map(col => ({ ...col, flex: col.flex ?? 1 }));
}

export default function DataGrid({ columns, rows, loading }: Props) {
  return (
    <Paper sx={{ width: '100%' }}>
      <Datatable
        loading={loading}
        rows={rows}
        columns={withDefaultFlex(columns)}
        pageSizeOptions={[5, 10]}
        sx={{ border: 0 }}
        rowSelection={false}
        disableRowSelectionOnClick={true}
      />
    </Paper>
  )
}