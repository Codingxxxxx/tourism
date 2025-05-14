import * as Yup from 'yup';
import { convertByteToMB } from '@/shared/utils/fileUtils';

type FileOptions = {
  maxSize?: number,
  formats: string[],
  min?: number,
  max?: number 
}

/**
 * 
 * @param file Brower selected file
 * @param maxSize file size in byte
 */
function validateFileSize(file: File, maxSize: number): boolean {
  return file.size <= maxSize;
}

/**
 * 
 * @param file Brower selected file
 * @param formats list of allowed file extension
 */
function validateFileType(file: File, formats: string[]): boolean {
  return formats.some((format) => format.toLowerCase() === file.type.toLowerCase());

}

export function yupFiles({
  maxSize = 2.5 * 1024 * 1024, // 2MB default
  formats,
  min,
  max,
}: FileOptions) {
  let schema = Yup
    .array()
    .of(
      Yup.mixed()
        .test('fileSize', ({ value }) => `File too large, must be under ${convertByteToMB(maxSize)}MB`, file => validateFileSize(file as File , maxSize))
        .test('fileType', ({ value }) => `Unsupported format, accept ${formats.join(', ')}`, file => validateFileType(file as File, formats))
    );Array<File>

  if (min) {
    schema = schema.min(min, `At least ${min} file(s) required`)
  }

  if (max) {
    schema = schema.max(max, `At most ${max} file(s) allowed`);
  }

  return schema;
}
