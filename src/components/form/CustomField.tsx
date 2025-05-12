import { useField } from 'formik';
import { TextField, type TextFieldProps } from '@mui/material';

export default function CustomTextField ({ label, name, type = 'text', ...props }: TextFieldProps) {
  const [field, meta] = useField(name);
  const error = Boolean(meta.touched && meta.error);

  return (
    <TextField
      label={label}
      type={type}
      fullWidth 
      error={error}
      {...field} // Spreads value, onChange, onBlur
      {...props}
    />
  );
};