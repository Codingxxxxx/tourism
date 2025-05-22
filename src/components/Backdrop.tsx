import { Backdrop, BackdropProps, CircularProgress } from '@mui/material';

export function CustomBackdrop(props: BackdropProps) {
  return (
    <Backdrop
      sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
      {...props}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  )
}