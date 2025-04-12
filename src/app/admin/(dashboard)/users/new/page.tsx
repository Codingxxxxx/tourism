'use client'
import { PageContainer } from '@toolpad/core/PageContainer';
import { Breadcrumb } from '@toolpad/core';
import { Box, Button, Grid2 as Grid, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import FormGroup from '@/components/form/FormGroup';
import * as Yub from 'yup';
import CustomErrorMessage from '@/components/form/ErrorMessage';
import CustomTextField from '@/components/form/CustomField';
import CustomHeader from '@/components/dashboard/CustomHeader';
import DashboardContainer from '@/components/dashboard/DashboardContainer';

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

  const [formStat, setFormStat] = useState({
      username: '',
      password: '',
      fullname: '',
      confirmPassword: ''
    });
  
    const validationSchema = Yub.object({
      username: Yub.string().label('Username').required().max(15),
      password: Yub.string().label('Password').required(),
      fullname: Yub.string().label('Fullname').required().max(50),
      confirmPassword: Yub.string().label('Confirm Password').required().oneOf([Yub.ref('password')], 'Confirm Password doesn\'t match')
    });
  
    const onFormSubmit = () => {
  
    }

  return (
    <DashboardContainer breadcrumbs={breadcrumbs} title='Create New User'>
      <Formik initialValues={formStat} onSubmit={onFormSubmit} validationSchema={validationSchema}>
        {({ values, handleChange, handleBlur, handleSubmit, errors, touched, isSubmitting }) => (
          <Form>
            <Grid container spacing={2} width={870} maxWidth='100%' marginX='auto' marginTop={4}>
              <Grid size={6}>
                {/* Fullname */}
                <FormGroup>
                  <CustomTextField
                    id='fullname'
                    label='Fullname'
                    name='fullname'
                    required
                  />
                  <CustomErrorMessage name='fullname' />
                </FormGroup>
              </Grid>
              <Grid  size={6}>
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
              <Grid width='100%'  size={6}>
                {/* Email Input */}
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
                <Button type="submit" fullWidth variant="contained" color="primary" disabled={isSubmitting} size='large'>
                  {isSubmitting ? "Login..." : "Submit"}
                </Button>
              </Grid>
            </Grid>
            {/* Submit Button */}
          </Form>
        )}
      </Formik>
    </DashboardContainer>
  )
}