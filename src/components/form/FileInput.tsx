import { Box, Typography, ImageList, ImageListItem } from '@mui/material';
import { FieldProps } from 'formik';
import { ChangeEvent, InputHTMLAttributes } from 'react';
import { CloudUpload } from '@mui/icons-material';
import { useField, useFormikContext } from 'formik';
import { convertByteToMB } from '@/shared/utils/fileUtils';

type Props = {
  label?: string,
  maxsize?: number,
  accept: string
} & InputHTMLAttributes<HTMLInputElement> & Partial<FieldProps>;

type FileDisplayProps = {
  file: File
}

const ERROR_BORDER_CLASS = 'border-[var(--mui-palette-error-main)] hover:border-[var(--mui-palette-error-dark)]';
const NORMAL_BORDER_CLASSS = 'border-[var(--mui-palette-StepConnector-border)] hover:border-[var(--mui-palette-text-primary)]'

function FileDisplay({ file }: FileDisplayProps) {
  const objectUrl = URL.createObjectURL(file);
  return (
    <Box>
      <ImageListItem className='relative'>
        <img
          className='rounded border'
          src={objectUrl}
          alt={file.name}
          loading='eager'
        />
        <span className='bg-black text-slate-100 rounded absolute z-1 text-xs p-1 right-0'>{convertByteToMB(file.size) + ' MB'}</span>
      </ImageListItem>
      <Typography fontSize='small'>{file.name}</Typography>
    </Box>
  )
}

export default function FileInput({ label, ...props }: Props) {
  const { setFieldValue } = useFormikContext();
  const [field, meta] = useField(props);
  const isInvalidAndTouched = meta.touched && meta.error;
  
  async function onFileInput(event: ChangeEvent<HTMLInputElement>) {
    if (!event.target.files) return;
    const inputFiles = Array.from(event.target.files);
    // manually set custom value to Formik
    await setFieldValue(field.name, inputFiles, true);
  }

  return (
    <Box className={`border-2 border-dashed rounded-[var(--mui-shape-borderRadius)] transition-[border-color] duration-[50] ${isInvalidAndTouched ? ERROR_BORDER_CLASS : NORMAL_BORDER_CLASSS}`}>
      <input
          className='hidden'
          id={props.name}
          name={field.name}
          onBlur={field.onBlur}
          type='file'
          onChange={onFileInput}
          accept={props.accept}
        />
      <label htmlFor={props.name} className='block cursor-pointer p-4'>
        <Box sx={{ textAlign: 'center', color: 'var(--mui-palette-primary-dark)', marginBottom: 4 }}>
          <CloudUpload fontSize='large' color='inherit' />
          <Typography sx={{ fontSize: '.975rem', marginTop: 1 }} color='inherit'>{label || 'Select file upload'} (Max size {props.maxsize} MB)</Typography>
        </Box>
        {meta.value?.length > 0 && 
          <ImageList >
            {(meta.value as File[]).map(file => <FileDisplay file={file} key={file.name}  />)}
        </ImageList>
        }
      </label>
    </Box>
  )
}