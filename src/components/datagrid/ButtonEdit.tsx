import { Button, ButtonProps } from '@mui/material';
import { Edit } from '@mui/icons-material';
import Link from 'next/link';


type Props = {

} & ButtonProps

export default function ButtonEdit(props: Props) {
  return (
    <Button
      color='primary'
      variant='outlined'
      size='small'
      {...props}
      LinkComponent={Link}
      startIcon={<Edit />}
    >
      Edit
    </Button>
  )
}