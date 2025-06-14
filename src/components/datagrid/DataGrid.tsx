import { DataGridProps, DataGrid as DataTable, type GridColDef } from '@mui/x-data-grid';
import { Paper, styled } from '@mui/material'

const CustomGrid = styled(DataTable)({
  '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
    outline: 'none',
  },
});

export function withDefaultFlex(columns: readonly GridColDef<any>[]): GridColDef<any>[] {
  return columns.map(col => ({ 
    ...col, 
    flex: col.width ? undefined : 1,
    width: col.width ? col.width : undefined,
    hideable: false, 
    sortable: col.sortable === undefined ? false : col.sortable, 
    filterable: false ,
    disableColumnMenu: true
  }));
}

type Props = {
} & DataGridProps

export default function DataGrid({ rows, columns, loading, ...props }: Props) {
  return (
    <Paper sx={{ width: '100%' }}>
      <CustomGrid
        style={{ minHeight: 360 }}
        isRowSelectable={() => false}
        isCellEditable={() => false}
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