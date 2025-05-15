import { Alert, Slide, SlideProps, Snackbar, SnackbarProps } from '@mui/material';
import { AlertProps } from './FormAlert';
import { useState } from 'react';

type Props = SnackbarProps & {
  success: boolean,
  message?: string
}

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction='down' />;
}

export default function Toast({ success, message,  ...props }: Props) {
  const [open, setOpen] = useState(true);

  return (
    <Snackbar
      open={open}
      slots={{ transition: SlideTransition }}
      key={SlideTransition.name}
      autoHideDuration={10000}
      onClose={() => setOpen(false)}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right'
      }}
      { ...props }
    >
      <Alert
        severity={success ? 'success' : 'error'}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  )
}