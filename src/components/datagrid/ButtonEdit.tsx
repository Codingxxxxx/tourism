import { Button, ButtonProps } from '@mui/material';
import { Edit } from '@mui/icons-material';


type Props = {

} & ButtonProps

export default function ButtonEdit(props: Props) {
  return (
    <Button
      color='warning'
      variant='contained'
      size='small'
      {...props}
      startIcon={<Edit />}
    >
      Edit
    </Button>
  )
}