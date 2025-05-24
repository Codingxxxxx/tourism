import { DataGridProps, DataGrid as Datatable, type GridColDef } from '@mui/x-data-grid';
import { Paper } from '@mui/material'

export function withDefaultFlex(columns: readonly GridColDef<any>[]): GridColDef<any>[] {
  return columns.map(col => ({ 
    ...col, 
    flex: col.flex ?? 1, 
    hideable: false, 
    sortable: false, 
    filterable: false ,
    disableColumnMenu: true
  }));
}

type Props = {
  autoResize?: boolean
} & DataGridProps

export default function DataGrid({ autoResize = true, rows, columns, loading, ...props }: Props) {
  return (
    <Paper sx={{ width: '100%' }}>
      <Datatable
        loading={loading}
        rows={rows}
        columns={autoResize ? withDefaultFlex(columns) : columns}
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