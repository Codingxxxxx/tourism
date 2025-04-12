import { ErrorMessage, type ErrorMessageProps } from 'formik';
import { Box } from '@mui/material';

export default function CustomErrorMessage(props: ErrorMessageProps) {
  return (
    <ErrorMessage className='text-red-500 text-sm mt-1' {...props} component='div' />
  )
}