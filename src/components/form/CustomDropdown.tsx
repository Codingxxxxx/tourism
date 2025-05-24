import { useField } from 'formik';
import { FormControl, InputLabel, MenuItem, Select, SelectProps } from '@mui/material';

type Item = {
  value: string | number,
  text: string
}

type DropDownProps = SelectProps & {
  items: Item[],
  defaultSelectValue?: string | number | null,
  required?: boolean,
  datatype: 'array' | 'number' | 'string'
}

export default function CustomDropdown ({ required = false, items, name, label, defaultSelectValue, datatype = 'string', ...props }: DropDownProps) {
  const [field, meta] = useField(name);
  const error = Boolean(meta.touched && meta.error);
  console.log(defaultSelectValue)
  let defaultValueOption: any;

  if (datatype == 'array') {
    defaultValueOption = []
  } else if (datatype == 'number') {
    defaultValueOption = 0
  } else {
    defaultValueOption = '';
  }

  return (
    <FormControl>
      <InputLabel required={required} htmlFor={props.id}>{label}</InputLabel>
      <Select 
        label={label}
        {...field}
        {...props}
        error={error}
        fullWidth
        value={defaultSelectValue}
        >
          <MenuItem key={defaultValueOption} selected={defaultValueOption  === defaultSelectValue} value={defaultValueOption} defaultValue={defaultValueOption}>Please Select</MenuItem>
          {items.map(item => <MenuItem key={item.value} selected={item.value === defaultSelectValue} value={item.value} defaultValue={item.value}>{item.text}</MenuItem>)}
        </Select>
    </FormControl>
  );
};