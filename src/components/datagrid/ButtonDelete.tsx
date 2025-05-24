import { Button, ButtonProps } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { useDialogs } from '@toolpad/core/useDialogs';

type Props = {
  confirmMessage?: string,
  onConfirmed?: () => void,
  onCancelled?: () => void
} & ButtonProps

export default function ButtonDelete({ confirmMessage = 'Are you sure to delete this record?', onConfirmed, onCancelled, ...props }: Props) {
  const dialogs = useDialogs();

  const onButtonClicked = async () => {
    const confirmed = await dialogs.confirm(confirmMessage, {
      okText: 'Yes',
      cancelText: 'No',
      severity: 'error',
      title: 'Delete confirmation'
    });

    if (confirmed && onConfirmed) return onConfirmed();

    if (!confirmed && onCancelled) onCancelled();
  }

  return (
    <Button
      size='small'
      color='error'
      variant='contained'
      {...props}
      startIcon={<Delete />}
      onClick={() => onButtonClicked()}
    > 
      Delete
    </Button>
  )
}