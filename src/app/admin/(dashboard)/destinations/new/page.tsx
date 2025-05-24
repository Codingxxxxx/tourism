'use client';
import { Breadcrumb } from '@toolpad/core';
import { Box, Button, Grid2 as Grid, Step, StepLabel, Stepper } from '@mui/material';
import { Formik, Form, useFormikContext } from 'formik';
import FormGroup from '@/components/form/FormGroup';
import * as Yub from 'yup';
import CustomErrorMessage from '@/components/form/ErrorMessage';
import CustomTextField from '@/components/form/CustomField';
import DashboardContainer from '@/components/dashboard/DashboardContainer';
import { ServerResponse } from "@/shared/types/serverActions";
import { startTransition, useActionState, useEffect, useState } from 'react';
import Toast from '@/components/form/Toast';
import CustomDropdown from '@/components/form/CustomDropdown';
import CustomGroupDropdown, { type MultiItems }  from '@/components/form/CustomGroupDropdown';
import { getLocationList } from '@/server/actions/location';
import { type Category, type Location } from '@/shared/types/dto';
import { getAllCategories } from '@/server/actions/category';
import { handleServerAction, withServerHandler } from '@/shared/utils/apiUtils';
import GooglePlaceCapture from '@/components/map/GooglePlaceCapture';
import { useGoogleMapCaptureStore } from '@/stores/useGoogleMapCaptureStore';
import { ArrowBack, AddLocation } from '@mui/icons-material';
import { createDestination } from '@/server/actions/destination';

type FormDestination = {
  categories: number[],
  location: number | null,
}

const validationSchema = Yub.object({
  categories: Yub.array().of(Yub.number().required()).min(1, 'At least one category is required').strict().label('Categories'),
  location: Yub.number().required().label('Location')
});

const GOOGLE_MAP_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

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

export default function Page() {
  const [serverResponse, setServerResponse] = useState<ServerResponse | null>();
  const [locations, setLocations] = useState<Location[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const capturedPlaceDetails = useGoogleMapCaptureStore((state) => state.capturedPlaceDetails);
  const [disableMap, setDisableMap] = useState(false);
  const { resetForm } = useFormikContext() ?? {};
  const [resetMap, setResetMap] = useState(false);

  const [initialInputValues, setInitialInputValues] = useState<FormDestination>({
    categories: [],
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

  const onLocationCaptured = async () => {
    setDisableMap(true);
    setServerResponse(null);

    const responseState = await handleServerAction(() => createDestination({
      name: capturedPlaceDetails?.placeName ?? 'N/A',
      categoryIds: initialInputValues.categories,
      locationId: initialInputValues.location ?? 0,
      contactNumber: capturedPlaceDetails?.phoneNumber ?? '',
      description: capturedPlaceDetails?.address ?? '',
      latitude: capturedPlaceDetails?.geometry?.location?.lat() ?? 0,
      longitude: capturedPlaceDetails?.geometry?.location?.lng() ?? 0,
      placeId: capturedPlaceDetails?.placeId ?? '',
      ratingScore: capturedPlaceDetails?.rating || 0,
      cover: Array.isArray(capturedPlaceDetails?.photos) && capturedPlaceDetails.photos.length > 0 ? capturedPlaceDetails?.photos[0].getUrl() : '',
      map: `https://www.google.com/maps/place/?q=place_id:${capturedPlaceDetails?.placeId}`,
      website: capturedPlaceDetails?.website ?? '',
      email: '',
      isPopular: 1,
      status: 1
    }));

    setDisableMap(false);
    setServerResponse(responseState);

    if (responseState.success) {
      setInitialInputValues({
        categories: [],
        location: null
      });
      setActiveStep(0);
      resetForm();
      setResetMap(true);
    }
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
        <Formik initialValues={initialInputValues} onSubmit={onFormSubmit} validationSchema={validationSchema}>
          {({ values }) => (
            <Form>
              <Grid container spacing={2} width={600} maxWidth='100%' marginX='auto' marginTop={4}>
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
                {/* categories */}
                <Grid size={12}>
                  <FormGroup>
                    <CustomGroupDropdown
                      id='categories'
                      label='Categories'
                      name='categories'
                      items={categories.map(category => {
                        const children: MultiItems[] = (category.child ?? []).map(c => ({ text: c.name, value: c.id }));

                        return {
                          text: category.name,
                          value: category.id,
                          children
                        }
                      })}
                      required={true}
                    />
                    <CustomErrorMessage name='categories' />
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
          <Button type="button" variant="contained" color="warning" onClick={() => setActiveStep(0)} disabled={disableMap} startIcon={<ArrowBack />}>
            BACK
          </Button>
          <Button type="button" variant="contained" color="primary" disabled={!capturedPlaceDetails} startIcon={<AddLocation />} onClick={onLocationCaptured} loading={serverResponse === null}>
            Capture {capturedPlaceDetails && ': ' + capturedPlaceDetails.placeName}
          </Button>
        </Box>
        <Box>
          <GooglePlaceCapture key={'create'} apiKey={GOOGLE_MAP_KEY ?? ''} disableInteraction={disableMap} resetState={resetMap} />
        </Box>
      </Box>
      {/* alert */}
      {serverResponse && 
        <Toast success={serverResponse.success || false} message={serverResponse.message} />
      }
    </DashboardContainer>
  )
}