import { DataGridProps, DataGrid as Datatable, type GridColDef } from '@mui/x-data-grid';
import { Paper } from '@mui/material'

export function withDefaultFlex(columns: readonly GridColDef<any>[]): GridColDef<any>[] {
  return columns.map(col => ({ 
    ...col, 
    flex: col.width ? undefined : 1,
    width: col.width ? col.width : undefined,
    hideable: false, 
    sortable: false, 
    filterable: false ,
    disableColumnMenu: true
  }));
}

type Props = {
} & DataGridProps

export default function DataGrid({ rows, columns, loading, ...props }: Props) {
  return (
    <Paper sx={{ width: '100%' }}>
      <Datatable
        style={{ minHeight: 360 }}
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