import { useField } from 'formik';
import { FormControl, InputLabel, MenuItem, Select, SelectProps } from '@mui/material';
import { useState } from 'react';

type Item = {
  value: string | number,
  text: string
}

type DropDownProps = SelectProps & {
  items: Item[],
  defaultSelectValue?: string | number | null,
  required?: boolean
}

export default function CustomDropdown ({ required = false, items, name, label, defaultSelectValue, ...props }: DropDownProps) {
  const [field, meta] = useField(name);
  const error = Boolean(meta.touched && meta.error);

  return (
    <FormControl>
      <InputLabel required={required} htmlFor={props.id}>{label}</InputLabel>
      <Select 
        displayEmpty
        label={label}
        {...props}
        {...field}
        error={error}
        fullWidth
        
        >
          <MenuItem value={0}>Please Select</MenuItem>
          {items.map(item => <MenuItem key={item.value} value={item.value}>{item.text}</MenuItem>)}
        </Select>
    </FormControl>
  );
};