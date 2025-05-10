import { Error } from '@mui/icons-material';
import { Alert } from '@mui/material';
import { useState } from 'react';

export type AlertProps = {
  message?: string,
  success: boolean
}

export function FormAlert({ message, success }: AlertProps) {
  return (
    <Alert
      onClick={() => {}}
      severity={success ? 'success' : 'error'}
      icon={<Error fontSize='inherit' />}
    >
      {message || ''}
    </Alert>
  )
}