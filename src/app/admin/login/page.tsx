'use client'
import { Formik, Form } from 'formik';
import { startTransition, useActionState, useEffect, useState, useTransition } from 'react';
import { Box, Button, Typography } from '@mui/material';
import FormGroup from '@/components/form/FormGroup';
import CustomTextField from '@/components/form/CustomField';
import CustomErrorMessage from '@/components/form/ErrorMessage';
import { FormAlert } from '@/components/form/FormAlert';
import { LoginSchema } from '@/shared/schemas';
import { login } from '@/server/actions/auth';
import { AppConfig } from '@/shared/config';
import { ServerResponse } from "@/shared/types/serverActions";
import { useApiHandlerStore } from '@/stores/useApiHandlerStore';
import { useRouter } from 'next/navigation';
import { AdminSession } from '@/shared/adminSession';

type FormProps = {
  email: string,
  password: string
}

export default function Login() { 
  const background = '/admin/login_bg.jpg'
  const [serverResponse, setServerResponse] = useState<ServerResponse<AdminSession> | null>();
  const sessionExpired = useApiHandlerStore((state) => state.isSessionExpired);
  const setSessionExipred = useApiHandlerStore((state) => state.setSessionExipred);
  const router = useRouter();

  // provide default user in development or demo
  const [formStat, _] = useState<FormProps>({
    email: '',
    password: ''
  });

  const onFormSubmit = async (values: FormProps) => {
    setServerResponse(null);
    // reset to not expired
    setSessionExipred(false);

    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      formData.set(key, value)
    })

    const result = await login(formData)

    setServerResponse(result);

    // init session and redirect
    if (result.success) {
      router.push(result.data.redirect);
    }
  }

  return (
    <Box 
      className='h-screen flex flex-col justify-center items-center' 
      sx={{ backgroundImage: `url(${background})`, backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundSize: 'cover'}}>
      <Formik initialValues={formStat} onSubmit={onFormSubmit} validationSchema={LoginSchema}>
        {({ isSubmitting }) => (
          <Form className='flex flex-col gap-2 w-md border border-gray-200 p-10 rounded shadow-sm bg-slate-200 opacity-95'>
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
            {/** session expired */}
            {sessionExpired && !serverResponse && 
              <FormGroup>
                <FormAlert success={false} message='Your session is expired, please login again' />
              </FormGroup>
            }
            {/* Alert */}
            {!isSubmitting && serverResponse && !serverResponse.success  && <FormGroup>
              <FormAlert success={false} message={serverResponse.message} />
            </FormGroup>}
            {/* Submit Button */}
            <Button type="submit" variant="contained" color="primary" loading={isSubmitting || serverResponse?.success} size='large'>
              {isSubmitting ? "Login..." : "Submit"}
            </Button>
          </Form>
        )}
      </Formik>
    </Box>
  )
}