import { Box } from '@mui/material';
import ButtonEdit from './ButtonEdit';
import ButtonDelete from './ButtonDelete';
import Link from 'next/link';

type Props = {
  editFormLink: string,
  onConfirmDelete?: () => void,
  onCancelledDelete?: () => void
}

export function ButtonAction({ editFormLink, onConfirmDelete, onCancelledDelete }: Props) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 1  }}>
      <ButtonEdit href={editFormLink} LinkComponent={Link} />
      <ButtonDelete onConfirmed={onConfirmDelete} onCancelled={onCancelledDelete}  />
    </Box>
  )
}