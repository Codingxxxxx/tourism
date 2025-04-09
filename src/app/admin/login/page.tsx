'use client'
import { Formik, Form, Field, FormikHelpers } from 'formik';
import { startTransition, useActionState, useState } from 'react';
import * as Yub from 'yup';
import { Box, Button, TextField, Typography } from '@mui/material';
import FormGroup from '@/components/form/FormGroup';
import CustomTextField from '@/components/form/CustomField';
import CustomErrorMessage from '@/components/form/ErrorMessage';
import { LoginSchema } from '@/shared/schemas';
import { login } from '@/server/actions/auth';

type FormState = {
  username: string,
  password: string
}

export default function Login() { 
  const background = '/admin/login_bg.jpg'
  const [state, formAction, pending] = useActionState(login, undefined)
  const [formStat, setFormStat] = useState<FormState>({
    username: '',
    password: ''
  });

  const onFormSubmit = (values: FormState) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      formData.set(key, value)
    })

    startTransition(() => {
      formAction(formData)  
    });
  }


  return (
    <Box 
      className='h-screen flex flex-col justify-center items-center' 
      sx={{ backgroundImage: `url(${background})`, backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundSize: 'cover'}}>
      <Formik initialValues={formStat} onSubmit={onFormSubmit} validationSchema={LoginSchema}>
        {() => (
          <Form action={formAction} className='flex flex-col gap-2 w-md border border-gray-200 p-10 rounded shadow-sm bg-slate-200 opacity-95'>
            <Typography textAlign='center' variant='h5' sx={{ marginBottom: 5, fontWeight: 'bold' }}>Login</Typography>
            {/* Name Input */}
            <FormGroup>
              <CustomTextField
                id='username'
                name='username'
                type='text'
                label='Username'
              />
              <CustomErrorMessage name='username' />
            </FormGroup>
            {/* Password Input */}
            <FormGroup>
              <CustomTextField
                  id='password'
                  label='Password'
                  name='password'
                  type='password'
                />
                <CustomErrorMessage name='password' />
            </FormGroup>
            {/* Submit Button */}
            <Button type="submit" variant="contained" color="primary" disabled={pending} size='large'>
              {pending ? "Login..." : "Submit"}
            </Button>
          </Form>
        )}
      </Formik>
    </Box>
  )
}