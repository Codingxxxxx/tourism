'use client';
import { Breadcrumb } from '@toolpad/core';
import { Button, Grid2 as Grid } from '@mui/material';
import { Formik, Form, FormikHelpers } from 'formik';
import FormGroup from '@/components/form/FormGroup';
import * as Yub from 'yup';
import CustomErrorMessage from '@/components/form/ErrorMessage';
import CustomTextField from '@/components/form/CustomField';
import DashboardContainer from '@/components/dashboard/DashboardContainer';
import { ServerResponse } from "@/shared/types/serverActions";
import { useState } from 'react';
import Toast from '@/components/form/Toast';
import { createLocation } from '@/server/actions/location';
import { useRouter } from 'next/navigation';

type FormLocation = {
  name: string,
  remark: string,
  lat: string,
  long: string
}

const validationSchema = Yub.object({
  name: Yub.string().required().max(25).label('Location Name'),
  remark: Yub.string().max(50).required().label('Description'),
  lat: Yub.number().max(85).typeError('${label} must be a number').required().label('Latitude'),
  long: Yub.number().max(180).typeError('${label} must be a number').required().label('Longitude')
});

export default function Page() {
  const [serverResponse, setServerResponse] = useState<ServerResponse | null>();
  const router = useRouter();

  const breadcrumbs: Breadcrumb[] = [
    {
      title: 'Dashboard',
      path: '/admin'
    },
    {
      title: 'Locations',
      path: '/admin/locations'
    },
    {
      title: 'New Location',
      path: '/admin/locations/new'
    }
  ];

  const initialInputValues: FormLocation = {
    name: '',
    remark: '',
    lat: '',
    long: ''
  };
  
  const onFormSubmit = async (values: FormLocation, helper: FormikHelpers<FormLocation>): Promise<void> => {
    try {
      setServerResponse(null);

      const serverResponse = await createLocation({
        name: values.name,
        remark: values.remark,
        latitude: Number(values.lat),
        longitude: Number(values.long)
      })

      setServerResponse(serverResponse);

      if (serverResponse.success) {
        router.push('/admin/locations');
      }

    } catch (error) {
      helper.setSubmitting(false);
    }
  }

  return (
    <DashboardContainer breadcrumbs={breadcrumbs} title='Create New Location'>
      <Formik initialValues={initialInputValues} onSubmit={onFormSubmit} validationSchema={validationSchema}>
        {({ isSubmitting, values }) => (
          <Form>
            <Grid container spacing={2} width={600} maxWidth='100%' marginX='auto' marginTop={4}>
              {/*  name */}
              <Grid size={12}>
                <FormGroup>
                  <CustomTextField
                    id='name'
                    label='Location Name'
                    name='name'
                    required
                  />
                  <CustomErrorMessage name='name' />
                </FormGroup>
              </Grid>
              {/* Category name kh */}
              <Grid size={12}>
                <FormGroup>
                  <CustomTextField
                    id='remark'
                    label='Description'
                    name='remark'
                    required
                  />
                  <CustomErrorMessage name='remark' />
                </FormGroup>
              </Grid>
              {/* lat */}
              <Grid size={6}>
                <FormGroup>
                  <CustomTextField
                    id='lat'
                    label='Latitude'
                    name='lat'
                    required
                  />
                  <CustomErrorMessage name='lat' />
                </FormGroup>
              </Grid>
              {/* lng */}
              <Grid size={6}>
                <FormGroup>
                  <CustomTextField
                    id='long'
                    label='Longitude'
                    name='long'
                    required
                  />
                  <CustomErrorMessage name='long' />
                </FormGroup>
              </Grid>
              {/* submit btn */}
              <Grid  size={12}>
                <Button type="submit" fullWidth variant="contained" color="primary" disabled={isSubmitting} size='large' loading={isSubmitting}>
                  Save
                </Button>
              </Grid>
            </Grid>
            {/* Submit Button */}
          </Form>
        )}
      </Formik>
      {/* alert */}
      {serverResponse && 
        <Toast success={serverResponse.success || false} message={serverResponse.message} />
      }
    </DashboardContainer>
  )
}