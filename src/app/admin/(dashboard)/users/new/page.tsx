'use client'

import { Breadcrumb } from '@toolpad/core';
import { Box, Button, Grid2 as Grid } from '@mui/material';
import { Formik, Form, FormikHelpers } from 'formik';
import FormGroup from '@/components/form/FormGroup';
import Toast from '@/components/form/Toast';
import * as Yub from 'yup';
import CustomErrorMessage from '@/components/form/ErrorMessage';
import CustomTextField from '@/components/form/CustomField';
import DashboardContainer from '@/components/dashboard/DashboardContainer';
import { createUser } from '@/server/actions/user';
import { useState } from 'react';
import { ServerResponse } from '@/shared/types/serverActions';

type FormProps = {
  username: string,
  firstName: string,
  lastName: string,
  password: string,
  confirmPassword: string,
  email: string
}

export default function Page() {
  const breadcrumbs: Breadcrumb[] = [
    {
      title: 'Dashboard',
      path: '/admin'
    },
    {
      title: 'Users',
      path: '/admin/users'
    },
    {
      title: 'New User',
      path: '/admin/users/new'
    }
  ];

  const [serverResponse, setServerResponse] = useState<ServerResponse | null>(null);

  const initialState: FormProps = {
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    confirmPassword: '',
    email: ''
  }

  const validationSchema = Yub.object({
    username: Yub.string().label('Username').required().max(15).matches(/^[a-zA-Z0-9]+$/, 'User name must contains letters or numbers only'),
    firstName: Yub.string().label('First Name').required().max(25),
    lastName: Yub.string().label('Last Name').required().max(25),
    password: Yub.string().label('Password').required().min(6),
    confirmPassword: Yub.string().label('Confirm Password').required().oneOf([Yub.ref('password')], 'Confirm Password doesn\'t match'),
    email: Yub.string().label('Email').required().email()
  });

  const onFormSubmit = async (value: FormProps, helpers: FormikHelpers<FormProps>) => {
    try {
      setServerResponse(null);

      const serverResponse = await createUser({
        firstName: value.firstName,
        lastName: value.lastName,
        password: value.password,
        username: value.username,
        email: value.email,
        roleIds: [1, 2, 3]
      });

      setServerResponse(serverResponse);

      if (serverResponse.success) {
        helpers.resetForm();
      }
    } catch (error) {
      console.error(error);
      helpers.setSubmitting(false);
    }
  }

  return (
    <DashboardContainer breadcrumbs={breadcrumbs} title='Create New User'>
      <Formik initialValues={initialState} onSubmit={onFormSubmit} validationSchema={validationSchema}>
        {({ isSubmitting }) => (
          <Form>
            <Grid container spacing={2} width={870} maxWidth='100%' marginX='auto' marginTop={4}>
              <Grid size={6}>
                {/* First Name */}
                <FormGroup>
                  <CustomTextField
                    id='firstName'
                    label='First Name'
                    name='firstName'
                    required
                  />
                  <CustomErrorMessage name='firstName' />
                </FormGroup>
              </Grid>
              <Grid size={6}>
                {/* Last Name */}
                <FormGroup>
                  <CustomTextField
                    id='lastName'
                    label='Last Name'
                    name='lastName'
                    required
                  />
                  <CustomErrorMessage name='lastName' />
                </FormGroup>
              </Grid>
              <Grid  size={12}>
                {/* Name Input */}
                <FormGroup>
                  <CustomTextField
                    id='username'
                    label='Username'
                    name='username'
                    required
                  />
                  <CustomErrorMessage name='username' />
                </FormGroup>
              </Grid>
              {/* Email */}
              <Grid  size={12}>
                <FormGroup>
                  <CustomTextField
                    id='email'
                    label='Email'
                    name='email'
                    required
                  />
                  <CustomErrorMessage name='email' />
                </FormGroup>
              </Grid>
              {/* Email Input */}
              <Grid width='100%'  size={6}>
                <FormGroup>
                  <CustomTextField
                    label='Password'
                    name='password'
                    type='password'
                    required
                  />
                  <CustomErrorMessage name='password' />
                </FormGroup>
              </Grid>
              <Grid width='100%'  size={6}>
                {/* Confirm Password */}
                <FormGroup>
                  <CustomTextField
                    label='Confirm Password'
                    name='confirmPassword'
                    type='password'
                    required
                  />
                  <CustomErrorMessage name='confirmPassword' />
                </FormGroup>
              </Grid>
              <Grid  size={12}>
                <Button type="submit" fullWidth variant="contained" color="primary" loading={isSubmitting} size='large'>
                  Submit
                </Button>
              </Grid>
            </Grid>
            {/* Submit Button */}
          </Form>
        )}
      </Formik>
      <Toast open={serverResponse != null} success={serverResponse?.success} message={serverResponse?.message} />
    </DashboardContainer>
  )
}