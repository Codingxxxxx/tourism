import { useField } from 'formik';
import { Checkbox, FormControlLabel, type CheckboxProps } from '@mui/material';

type Props = {
  label: string
} & CheckboxProps

export default function CustomCheckBox ({ label, name, ...props }: Props) {
  const [field] = useField(name);

  return (
    <FormControlLabel 
      control={<Checkbox
        {...field}
        {...props}
      />} 
      label={label}
    />
  );
};