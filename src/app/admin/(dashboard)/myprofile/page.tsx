'use client';
import DashboardContainer from "@/components/dashboard/DashboardContainer";
import { Box, Button,  Dialog,  DialogContent,  type DialogProps,  DialogTitle,  FormGroup, Grid2 as Grid } from '@mui/material'
import { ReactNode, useEffect, useState, useTransition } from "react";
import { ServerResponse } from "@/shared/types/serverActions";
import { handleServerAction } from "@/shared/utils/apiUtils";
import { changePassword, myProfile } from '@/server/actions/user';
import { User } from '@/shared/types/dto';
import { CustomBackdrop } from '@/components/Backdrop';
import Toast from '@/components/form/Toast';
import CustomTextField from '@/components/form/CustomField';
import { Form, Formik, FormikHelpers } from 'formik';
import { Breadcrumb, useDialogs } from '@toolpad/core';
import CustomErrorMessage from '@/components/form/ErrorMessage';
import * as Yub from 'yup';

type FormProps = {
  firstName: string,
  lastName: string,
  username: string,
  email: string,
  role: string
}

type FormChangePasswordProps = {
  currentPassword: string,
  newPassword: string,
  confirmNewPassword: string
}

const changePasswordSchema = Yub.object({
  currentPassword: Yub.string().required().label('Current Password').min(8),
  newPassword: Yub.string().required().label('New Password').min(8),
  confirmNewPassword: Yub.string().required().label('Confirm New Password').oneOf([Yub.ref('newPassword')], 'Confirm New Password doesn\'t match').min(8),
});

function ChangePasswordDialog({ open, onClose }: DialogProps) {
  const [serverResponse, setServerResponse] = useState<ServerResponse | null>();
  const initialValues: FormChangePasswordProps =  {
    currentPassword: '',
    confirmNewPassword: '',
    newPassword: ''
  };

  const onSubmit = async (values: FormChangePasswordProps, helpers: FormikHelpers<FormChangePasswordProps>) => {
    try {
      setServerResponse(null);
      const result = await handleServerAction(() => changePassword(values.currentPassword, values.newPassword));
      setServerResponse(result);

      if (result.success) {
        helpers.resetForm()
      }
    } catch (err) {
      console.error(err);
      helpers.setSubmitting(false);
    }
  }

  return (
    <Dialog fullWidth open={open} onClose={onClose}>
      <DialogTitle>Change Password</DialogTitle>
      <DialogContent>
          <Formik initialValues={initialValues} validationSchema={changePasswordSchema} onSubmit={onSubmit}>
            {({ isSubmitting }) => (
              <Form>
                <Grid container spacing={2} maxWidth='100%' marginX='auto' marginTop={4}>
                  <Grid size={12}>
                    {/* current password */}
                    <FormGroup>
                      <CustomTextField
                        id='currentPassword'
                        label='Current Password'
                        name='currentPassword'
                        type='password'
                        required
                      />
                      <CustomErrorMessage name='currentPassword' />
                    </FormGroup>
                  </Grid>
                  <Grid size={12}>
                    {/* new password */}
                    <FormGroup>
                      <CustomTextField
                        id='newPassword'
                        label='New password'
                        name='newPassword'
                        type='password'
                        required
                      />
                      <CustomErrorMessage name='newPassword' />
                    </FormGroup>
                  </Grid>
                    {/* confirm new password */}
                  <Grid  size={12}>
                    <FormGroup>
                      <CustomTextField
                        id='confirmNewPassword'
                        label='Confirm New Password'
                        name='confirmNewPassword'
                        type='password'
                        required  
                      />
                      <CustomErrorMessage name='confirmNewPassword' />
                    </FormGroup>
                  </Grid>
                  <Grid size={12}>
                    <Button type="submit" fullWidth variant="contained" color="primary" loading={isSubmitting} size='large'>
                      sumit
                    </Button>
                  </Grid>
                </Grid>
              </Form>
            )}
        </Formik>
      </DialogContent>
      {serverResponse && <Toast success={serverResponse.success} message={serverResponse.message} />}
    </Dialog>
  )
}

export default function Page() {
  const [serverResponse, setServerResponse] = useState<ServerResponse | null>();
  const [pending, startTransition] = useTransition();
  const [user, setUser] = useState<User>();
  const [initialValues, setInitialValues] = useState<FormProps>({
    email: '',
    firstName: '',
    lastName: '',
    role: '',
    username: ''
  });
  const dialog = useDialogs();

  const breadcrumbs: Breadcrumb[] = [
    {
      title: 'Dashboard',
      path: '/admin'
    },
    {
      title: 'Profile information'
    }
  ];

  useEffect(() => {
    startTransition(async () => {
      const response = await handleServerAction<User>(myProfile);

      if (!response.success) return setServerResponse(response);

      const user = response.data as User;
      setUser(response.data as User);
      setInitialValues({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.roles.length > 0 ? user.roles[0].name : '',
        username: user.username
      });
    });
  }, []);

  const onChangePassword = async () => {
    await dialog.open(ChangePasswordDialog, { 
      onClose: () => {}
    });
  };
 
  return (
    <DashboardContainer breadcrumbs={breadcrumbs}>
      <Box display='flex' flexDirection='column'>
        <Button variant='contained' size='large' sx={{ marginBottom: 2, alignSelf: 'end' }} onClick={onChangePassword}>
          Change Password
        </Button>
        <Formik initialValues={initialValues} onSubmit={() => {}} enableReinitialize>
          {() => (
            <Form>
              <Grid container spacing={2} width={870} maxWidth='100%' marginX='auto' marginTop={4}>
                <Grid size={6}>
                  {/* First Name */}
                  <FormGroup>
                    <CustomTextField
                      id='firstName'
                      label='First Name'
                      name='firstName'
                      slotProps={{
                        input: {
                          readOnly: true,
                        }
                      }}
                    />
                  </FormGroup>
                </Grid>
                <Grid size={6}>
                  {/* Last Name */}
                  <FormGroup>
                    <CustomTextField
                      id='lastName'
                      label='Last Name'
                      name='lastName'
                      slotProps={{
                        input: {
                          readOnly: true,
                        }
                      }}
                    />
                  </FormGroup>
                </Grid>
                <Grid  size={12}>
                  {/* Name Input */}
                  <FormGroup>
                    <CustomTextField
                      id='username'
                      label='Username'
                      name='username'
                      slotProps={{
                        input: {
                          readOnly: true,
                        }
                      }}
                    />
                  </FormGroup>
                </Grid>
                {/* Email */}
                <Grid  size={12}>
                  <FormGroup>
                    <CustomTextField
                      id='email'
                      label='Email'
                      name='email'
                      slotProps={{
                        input: {
                          readOnly: true,
                        }
                      }}
                    />
                  </FormGroup>
                </Grid>
                {/* roles */}
                <Grid  size={12}>
                  <FormGroup>
                    <CustomTextField
                      id='role'
                      label='Role'
                      name='role'
                      slotProps={{
                        input: {
                          readOnly: true,
                        }
                      }}
                    />
                  </FormGroup>
                </Grid>
              </Grid>
              {/* Submit Button */}
            </Form>
          )}
        </Formik>
      </Box>
      {serverResponse && <Toast success={serverResponse.success} message={serverResponse.message} />}
      <CustomBackdrop open={pending} />
    </DashboardContainer>
  )
} 