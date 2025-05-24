import { useField } from 'formik';
import { FormControl, InputLabel, ListSubheader, MenuItem, Select, SelectProps } from '@mui/material';

export type MultiItems = {
  value: string | number,
  text: string,
  children?: MultiItems[]
}

type DropDownProps = SelectProps & {
  items: MultiItems[],
  required?: boolean
}

export default function CustomGroupDropdown ({ required = false, items, name, label, ...props }: DropDownProps) {
  const [field, meta] = useField(name);
  const error = Boolean(meta.touched && meta.error);

  return (
    <FormControl>
      <InputLabel required htmlFor={props.id}>{label}</InputLabel>
      <Select 
        multiple={true}
        label={label}
        {...field}
        {...props}
        error={error}
        fullWidth
        >
          {items.map((item) => [
            <MenuItem 
              key={item.value} 
              value={item.value}
            >{item.text}</MenuItem>,
            ...(item.children?.map((child) => (
              <MenuItem key={child.value} value={child.value} sx={{ pl: 6 }}>
                {child.text}
              </MenuItem>
            )) ?? [])
          ])}
        </Select>
    </FormControl>
  );
};