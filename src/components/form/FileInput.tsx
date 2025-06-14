import { Box, Typography, ImageList, ImageListItem } from '@mui/material';
import { FieldProps } from 'formik';
import { ChangeEvent, InputHTMLAttributes, useEffect } from 'react';
import { CloudUpload } from '@mui/icons-material';
import { useField, useFormikContext } from 'formik';
import { convertByteToMB } from '@/shared/utils/fileUtils';

export type FileObject = {
  filename: string,
  size: number,
  mimetype: string,
  url: string, // can be local URL or remote URL
  file?: File // actual file object for upload to server
}

type Props = {
  label?: string,
  maxsize: number,
  accept: string,
  defaultFiles?: FileObject[]
} & InputHTMLAttributes<HTMLInputElement> & Partial<FieldProps>;

type FileDisplayProps = {
  fileObject: FileObject
}

const ERROR_BORDER_CLASS = 'border-[var(--mui-palette-error-main)] hover:border-[var(--mui-palette-error-dark)]';
const NORMAL_BORDER_CLASSS = 'border-[var(--mui-palette-StepConnector-border)] hover:border-[var(--mui-palette-text-primary)]'

function FileDisplay({ fileObject }: FileDisplayProps) {
  return (
    <Box sx={{ width: '100%' }}>
      <ImageListItem className='relative'>
        <img
          className='rounded border'
          src={fileObject.url}
          alt={fileObject.filename}
          loading='eager'
        />
        <span className='bg-black text-slate-100 rounded absolute z-1 text-xs p-1 right-0'>{convertByteToMB(fileObject.size) + ' MB'}</span>
      </ImageListItem>
      {fileObject.filename && <Typography fontSize='small'>{}</Typography>}
    </Box>
  )
}

export default function FileInput({ label, maxsize = 2.5, defaultFiles = [], ...props }: Props) {
  const { setFieldValue, setTouched, validateField } = useFormikContext();
  const [field, meta] = useField(props);
  const isInvalidAndTouched = meta.touched && meta.error;

  useEffect(() => {
    if (!defaultFiles || defaultFiles.length == 0) return;
    setFieldValue(field.name, defaultFiles);
  }, []);
  
  async function onFileInput(event: ChangeEvent<HTMLInputElement>) {
    if (!event.target.files) return;

    const inputFiles: FileObject[] = Array
      .from(event.target.files ?? [])
      .map(file => ({
        filename: file.name,
        mimetype: file.type,
        size: file.size,
        url: URL.createObjectURL(file),
        file: file
      }));

    // manually set custom value to Formik
    await setFieldValue(field.name, inputFiles)
    await setTouched({ [field.name]: true });
    await validateField(field.name);
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
          <Typography sx={{ marginTop: 1 }} color='inherit'>{label || 'Select file to upload'}</Typography>
          <Typography sx={{ fontSize: '.9rem' }}>(Max size {maxsize} MB)</Typography>
        </Box>
        {field.value?.length > 0 && 
          <ImageList cols={1}>
            {(field.value as FileObject[]).map(file => <FileDisplay key={file.size} fileObject={file} />)}
          </ImageList>
        }
      </label>
    </Box>
  )
}