import { FormControl, FormControlProps } from '@mui/material';

export default function FormGroup(props: FormControlProps) {
  return (
    <FormControl sx={{ marginBottom: 2 }}>
      {props.children}
    </FormControl>
  );
}