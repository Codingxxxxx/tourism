'use client';
import { Breadcrumb } from '@toolpad/core';
import { Box, Button, Grid2 as Grid, Step, StepLabel, Stepper } from '@mui/material';
import { Formik, Form } from 'formik';
import FormGroup from '@/components/form/FormGroup';
import * as Yub from 'yup';
import CustomErrorMessage from '@/components/form/ErrorMessage';
import CustomTextField from '@/components/form/CustomField';
import DashboardContainer from '@/components/dashboard/DashboardContainer';
import { ServerResponse } from "@/shared/types/serverActions";
import { useEffect, useState } from 'react';
import Toast from '@/components/form/Toast';
import CustomDropdown from '@/components/form/CustomDropdown';
import { getLocationList } from '@/server/actions/location';
import { type Category, type Location } from '@/shared/types/dto';
import { getAllCategories } from '@/server/actions/category';
import { handleServerAction } from '@/shared/utils/apiUtils';
import GooglePlaceCapture from '@/components/map/GooglePlaceCapture';
import { useGoogleMapCaptureStore } from '@/stores/useGoogleMapCaptureStore';

type FormDestination = {
  destinationName: string,
  categories: number[],
  location: number | null,
}

const validationSchema = Yub.object({
  destinationName: Yub.string().required().max(50).label('Destination Name'),
  categories: Yub.array().of(Yub.number()).strict().label('Categories'),
  location: Yub.number().required().label('Location')
});

const GOOGLE_MAP_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export default function Page() {
  const [serverResponse, setServerResponse] = useState<ServerResponse | null>();
  const [locations, setLocations] = useState<Location[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const capturedPlaceDetails = useGoogleMapCaptureStore((state) => state.capturedPlaceDetails);

  const breadcrumbs: Breadcrumb[] = [
    {
      title: 'Dashboard',
      path: '/admin'
    },
    {
      title: 'Destinations',
      path: '/admin/destinations'
    },
    {
      title: 'New Destination',
      path: '/admin/destination/new'
    }
  ];

  const [initialInputValues, setInitialInputValues] = useState<FormDestination>({
    categories: [],
    destinationName: '',
    location: null
  });

  useEffect(() => {
    (async () => {
      const [locationResult, categoryResult] = await Promise.all([
        handleServerAction(getLocationList),
        handleServerAction(getAllCategories)
      ]);
      
      setLocations(locationResult.data ?? []);
      setCategories(categoryResult.data ?? []);
    })();
  }, []);
  
  const onFormSubmit = async (values: FormDestination): Promise<void> => {
    setInitialInputValues(values);
    setActiveStep(activeStep + 1);
  }

  return (
    <DashboardContainer breadcrumbs={breadcrumbs} title='Create New Destination'>
      <Stepper sx={{ paddingBottom: 5 }} activeStep={activeStep}>
        <Step>
          <StepLabel>Setup Destination information</StepLabel>
        </Step>
        <Step>
          <StepLabel>Capture Destination on Map</StepLabel>
        </Step>
      </Stepper>
      {activeStep === 0 && 
        <Formik initialValues={initialInputValues} onSubmit={onFormSubmit} validationSchema={validationSchema} enableReinitialize>
          {() => (
            <Form>
              <Grid container spacing={2} width={600} maxWidth='100%' marginX='auto' marginTop={4}>
                {/* Destination Name */}
                <Grid size={12}>
                  <FormGroup>
                    <CustomTextField
                      id='destinationName'
                      label='Destination Name'
                      name='destinationName'
                      required
                    />
                    <CustomErrorMessage name='destinationName' />
                  </FormGroup>
                </Grid>
                {/* categories */}
                <Grid size={12}>
                  <FormGroup>
                    <CustomDropdown
                      id='categories'
                      label='Categories'
                      name='categories'
                      items={categories.map(category => ({ text: category.name, value: category.id }))}
                      required={true}
                    />
                    <CustomErrorMessage name='categories' />
                  </FormGroup>
                </Grid>
                {/* locations */}
                <Grid size={12}>
                  <FormGroup>
                    <CustomDropdown
                      id='location'
                      label='Location'
                      name='location'
                      items={locations.map(location => ({ text: location.name, value: location.id ?? 0 }))}
                      required={true}
                    />
                    <CustomErrorMessage name='location' />
                  </FormGroup>
                </Grid>
                {/* submit btn */}
                <Grid  size={12}>
                  <Button type="submit" fullWidth variant="contained" color="primary" size='large'>
                    Next
                  </Button>
                </Grid>
              </Grid>
              {/* Submit Button */}
            </Form>
          )}
        </Formik>
      }
      <Box hidden={activeStep !== 1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
          <Button type="button" variant="contained" color="warning" onClick={() => setActiveStep(0)}>
            BACK
          </Button>
          <Button type="button" variant="contained" color="primary" disabled={!capturedPlaceDetails}>
            Capture: {capturedPlaceDetails && capturedPlaceDetails.placeName}
          </Button>
        </Box>
        <Box>
          <GooglePlaceCapture apiKey={GOOGLE_MAP_KEY ?? ''} />
        </Box>
      </Box>
      {/* alert */}
      {serverResponse && 
        <Toast success={serverResponse.success || false} message={serverResponse.message} />
      }
    </DashboardContainer>
  )
}