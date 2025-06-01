import { useField } from 'formik';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectProps,
  ListItemText,
  Chip,
  Box,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

export type MultiItems = {
  value: string | number;
  text: string;
  children?: MultiItems[];
};

type DropDownProps = SelectProps & {
  items: MultiItems[];
  required?: boolean;
};

export default function CustomGroupDropdown({
  required = false,
  items,
  name,
  label,
  ...props
}: DropDownProps) {
  const [field, meta] = useField(name);
  const error = Boolean(meta.touched && meta.error);
  const selectedValues = field.value || [];

  const isSelected = (val: string | number) => selectedValues.includes(val);

  return (
    <FormControl fullWidth error={error}>
      <InputLabel required={required} htmlFor={props.id}>
        {label}
      </InputLabel>
      <Select
        multiple
        label={label}
        {...field}
        {...props}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {(selected as (string | number)[])
              .map((val) => {
                // flatten items and children and find text for current val
                const option = items
                  .flatMap((item) => [item, ...(item.children ?? [])])
                  .find((opt) => opt.value === val);
                return option?.text || val;
              })
              .map((label, index) => (
                <Chip key={index} label={label} />
              ))}
          </Box>
        )}
      >
        {items.map((item) => [
          <MenuItem
            key={item.value}
            value={item.value}
          >
            <ListItemText primary={item.text} />
            {isSelected(item.value) && <CheckIcon color="success" fontSize="small" />}
          </MenuItem>,

          ...(item.children?.map((child) => (
            <MenuItem
              key={item.value}
              value={item.value}
            >
              <ListItemText primary={item.text} />
              {isSelected(item.value) && <CheckIcon color="success" fontSize="small" />}
            </MenuItem>
          )) ?? []),
        ])}
      </Select>
    </FormControl>
  );
}
