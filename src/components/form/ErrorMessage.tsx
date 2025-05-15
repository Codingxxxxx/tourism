import { ErrorMessage, type ErrorMessageProps } from 'formik';

export default function CustomErrorMessage(props: ErrorMessageProps) {
  return (
    <ErrorMessage className='text-red-500 text-sm mt-1' {...props} component='div' />
  )
}