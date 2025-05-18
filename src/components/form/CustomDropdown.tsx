import { useField } from 'formik';
import { FormControl, InputLabel, MenuItem, Select, SelectProps } from '@mui/material';

type Item = {
  value: string | number,
  text: string
}

type DropDownProps = SelectProps & {
  items: Item[],
  defaultSelectValue?: string | number,
  required?: boolean
}

export default function CustomDropdown ({ required = false, items, name, label, defaultSelectValue, ...props }: DropDownProps) {
  const [field, meta] = useField(name);
  const error = Boolean(meta.touched && meta.error);

  return (
    <FormControl>
      <InputLabel required htmlFor={props.id}>{label}</InputLabel>
      <Select 
        label={label}
        {...field}
        {...props}
        error={error}
        fullWidth
        >
          {defaultSelectValue && <MenuItem value={defaultSelectValue} defaultValue={defaultSelectValue}>Please Select</MenuItem>}
          {items.map(item => <MenuItem value={item.value}>{item.text}</MenuItem>)}
        </Select>
    </FormControl>
  );
};