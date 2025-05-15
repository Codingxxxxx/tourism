import { DataGridProps, DataGrid as Datatable, type GridColDef } from '@mui/x-data-grid';
import { Paper } from '@mui/material'

export function withDefaultFlex(columns: readonly GridColDef<any>[]): GridColDef<any>[] {
  return columns.map(col => ({ ...col, flex: col.flex ?? 1 }));
}

export default function DataGrid({ rows, columns, loading, ...props }: DataGridProps) {
  return (
    <Paper sx={{ width: '100%' }}>
      <Datatable
        loading={loading}
        rows={rows}
        columns={withDefaultFlex(columns)}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10
            }
          }
        }}
        sx={{ border: 0 }}
        rowSelection={false}
        disableRowSelectionOnClick={true}
        {...props}
      />
    </Paper>
  )
}