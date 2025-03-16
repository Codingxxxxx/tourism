import { FormHelperText } from '@mui/material';

interface FormErrorProps {
  message?: string; // Optional prop for error message
  visible?: boolean | string; // Optional prop to control visibility
}

export default function FormError(props: FormErrorProps) {
  if (!props.visible) return null;
  return (
    <FormHelperText sx={{ marginX: 0, marginTop: .5 }}>
      <span className='text-red-600 text-sm'>{props.message}</span>
    </FormHelperText>
  );
}