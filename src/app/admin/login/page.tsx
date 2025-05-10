'use client'
import { Formik, Form } from 'formik';
import { startTransition, useActionState, useEffect, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import FormGroup from '@/components/form/FormGroup';
import CustomTextField from '@/components/form/CustomField';
import CustomErrorMessage from '@/components/form/ErrorMessage';
import { FormAlert } from '@/components/form/FormAlert';
import { LoginSchema } from '@/shared/schemas';
import { login } from '@/server/actions/auth';
import { AppConfig } from '@/shared/config';

type FormProps = {
  email: string,
  password: string
}

export default function Login() { 
  const background = '/admin/login_bg.jpg'
  const [stat, formAction, pending] = useActionState(login, undefined)

  // provide default user in development or demo
  const [formStat, _] = useState<FormProps>({
    email: AppConfig.ENABLE_DEMO_ACCOUNT ? 'admin@example.com' : '',
    password: AppConfig.ENABLE_DEMO_ACCOUNT ? 'password123' : ''
  });

  const onFormSubmit = (values: FormProps) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      formData.set(key, value)
    })

    startTransition(() => {
      formAction(formData);
    });
  }

  useEffect(() => {
    if (!stat) return;
  }, [stat])

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
                id='email'
                name='email'
                type='text'
                label='Email'
              />
              <CustomErrorMessage name='email' />
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
            {/* Alert */}
            {stat && !stat.success && !pending && <FormGroup>
              <FormAlert success={false} message={stat.message} />
            </FormGroup>}
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