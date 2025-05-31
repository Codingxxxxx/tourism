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
import { updateUser, getUserDetails, getRoles } from '@/server/actions/user';
import { useEffect, useState, useTransition } from 'react';
import { ServerResponse } from '@/shared/types/serverActions';
import { Role, User } from '@/shared/types/dto';
import { handleServerAction } from '@/shared/utils/apiUtils';
import { useParams, useRouter } from 'next/navigation';
import { CustomBackdrop } from '@/components/Backdrop';
import CustomDropdown from '@/components/form/CustomDropdown';

type FormProps = {
  username: string,
  firstName: string,
  lastName: string,
  email: string,
  role: number
}

const validationSchema = Yub.object({
  username: Yub.string().label('Username').required().max(15).matches(/^[a-zA-Z0-9]+$/, 'User name must contains letters or numbers only'),
  firstName: Yub.string().label('First Name').required().max(25),
  lastName: Yub.string().label('Last Name').required().max(25),
  email: Yub.string().label('Email').required().email()
});

type PageParams = {
  id: string
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
      title: 'Update User'
    }
  ];

  const params = useParams<PageParams>();
  const [serverResponse, setServerResponse] = useState<ServerResponse | null>(null);
  const [user, setUser] = useState<User>();
  const [roles, setRoles] = useState<Role[]>([]);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [initialState, setInitialState] = useState<FormProps>({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    role: 0
  });

  const onFormSubmit = async (value: FormProps, helpers: FormikHelpers<FormProps>) => {
    startTransition(async () => {
      try {
        setServerResponse(null);
  
        const serverResponse = await handleServerAction(() => updateUser({
          firstName: value.firstName,
          lastName: value.lastName,
          username: value.username,
          email: value.email,
          roleIds: [value.role]
        }, String(user?.id)));

        setServerResponse(serverResponse);
  
        if (serverResponse.success) router.push('/admin/users')
      } catch (error) {
        console.error(error);
        helpers.setSubmitting(false);
      }
    });
  }

  useEffect(() => {
    startTransition(async () => {
      const [resUser, resRole] = await Promise.all([
        handleServerAction<User>(() => getUserDetails(params.id)),
        handleServerAction<Role[]>(getRoles)
      ])

      const user = resUser.data as User;

      setUser(user);
      setRoles(resRole.data ?? [])
      setInitialState({
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.roles.length > 0 ? user.roles[0].id : 0
      })
    });
  }, []);

  return (
    <DashboardContainer breadcrumbs={breadcrumbs} title='Update User'>
      <Formik initialValues={initialState} onSubmit={onFormSubmit} validationSchema={validationSchema} enableReinitialize>
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
              {/* roles */}
              <Grid  size={12}>
                <FormGroup>
                  <CustomDropdown 
                    label='Role'
                    name='role'
                    items={roles.map(role => ({ value: role.id, text: role.name }))}
                    required={true}
                  />
                  <CustomErrorMessage name='role' />
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
      {serverResponse && <Toast success={serverResponse.success} message={serverResponse.message} />}
      <CustomBackdrop open={isPending} />
    </DashboardContainer>
  )
}