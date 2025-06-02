'use client';
import { Breadcrumb } from '@toolpad/core';
import { Box, Button, Divider, Grid2 as Grid, ImageList, ImageListItem, InputLabel, Step, StepLabel, Stepper, Typography } from '@mui/material';
import { Formik, Form, useFormikContext, FormikHelpers } from 'formik';
import FormGroup from '@/components/form/FormGroup';
import * as Yub from 'yup';
import CustomErrorMessage from '@/components/form/ErrorMessage';
import CustomTextField from '@/components/form/CustomField';
import DashboardContainer from '@/components/dashboard/DashboardContainer';
import { ServerResponse } from "@/shared/types/serverActions";
import { useActionState, useEffect, useState, useTransition } from 'react';
import Toast from '@/components/form/Toast';
import CustomDropdown from '@/components/form/CustomDropdown';
import CustomGroupDropdown, { type MultiItems }  from '@/components/form/CustomGroupDropdown';
import { getLocationList } from '@/server/actions/location';
import { Destination, type Category, type Location } from '@/shared/types/dto';
import { getAllCategories } from '@/server/actions/category';
import { handleServerAction, withServerHandler } from '@/shared/utils/apiUtils';
import GooglePlaceCapture, { SelectedCoordinate } from '@/components/map/GooglePlaceCapture';
import { useGoogleMapCaptureStore } from '@/stores/useGoogleMapCaptureStore';
import { ArrowBack, AddLocation, ErrorRounded } from '@mui/icons-material';
import { createDestination, getDestinationDetails, updateDestination } from '@/server/actions/destination';
import { useParams, useRouter } from 'next/navigation';
import { CustomBackdrop } from '@/components/Backdrop';
import FileInput, { FileObject } from '@/components/form/FileInput';
import { getGoogleImageLiink, getImagePath, isGoogleImage } from '@/shared/utils/fileUtils';
import { uploadImage } from '@/server/actions/upload';

type FormDestination = {
  categories: number[],
  location: number | null,
}

type FormConfirm  = {
  placeName: string,
  description: string,
  phoneNumber: string,
  rating: string,
  address: string,
  cover: FileObject[]
}

const validationSchema = Yub.object({
  categories: Yub.array().of(Yub.number().required()).min(1, 'At least one category is required').strict().label('Categories'),
  location: Yub.number().required().label('Location').test('not-zero', '${label} is required', value => value !== 0 && value !== null)
});

const validateConfirmation = Yub.object({
  placeName: Yub.string().required().label('Place Name').max(255),
  description: Yub.string().label('Description').max(255)
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
    title: 'Update Destination'
  }
];

type PageParams = {
  id: string
}

export default function Page() {
  const params = useParams<PageParams>();
  const [serverResponse, setServerResponse] = useState<ServerResponse | null>();
  const [locations, setLocations] = useState<Location[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const capturedPlaceDetails = useGoogleMapCaptureStore((state) => state.capturedPlaceDetails);
  const [disableMap, setDisableMap] = useState(false);
  const router = useRouter();
  const [resetMap, setResetMap] = useState(false);
  const [destination, setDestination] = useState<Destination | null>();
  const [isPending, startTransition] = useTransition();
  const [selectedCoordinate, setSelectedCoordinate] = useState<SelectedCoordinate | null>(null);

  const [initialInputValues, setInitialInputValues] = useState<FormDestination>({
    categories: [],
    location: 0
  });

  const [formConfirmInitial, setFormConfirmInitial] = useState<FormConfirm>({
    address: '',
    description: '',
    phoneNumber: '',
    placeName: '',
    rating: 'N/A',
    cover: []
  });

  useEffect(() => {
    startTransition(async () => {
      const [locationResult, categoryResult, destinationResult] = await Promise.all([
        handleServerAction(getLocationList),
        handleServerAction(getAllCategories),
        handleServerAction<Destination>(() => getDestinationDetails(params.id))
      ]);

      const destination = destinationResult.data as Destination;

      setLocations(locationResult.data ?? []);
      setCategories(categoryResult.data ?? []);
      setDestination(destination)
      
      setInitialInputValues({
        categories: destination.categories.map(cate => cate.id),
        location: destination.location.id as number
      });

      setSelectedCoordinate({
        lat: destination.latitude,
        lng: destination.longitude,
        placeId: destination.placeId
      })
    });
  }, []);
  
  const onFormSubmit = async (values: FormDestination): Promise<void> => {
    setInitialInputValues(values);
    setActiveStep(activeStep + 1);
  }

  
  const onLocationCaptured = () => {
    const googleImage = Array.isArray(capturedPlaceDetails?.photos) && capturedPlaceDetails.photos.length > 0 ? capturedPlaceDetails?.photos[0].getUrl({ maxWidth: 600, maxHeight: 600 }) : '';

    let cover: FileObject[] = [{
      filename: '',
      mimetype: 'image/jpg',
      url: getImagePath(destination?.cover ?? googleImage),
      size: 0
    }];

    setActiveStep(activeStep + 1)
    setFormConfirmInitial({
      address: capturedPlaceDetails?.formattedAddress ?? 'N/A',
      phoneNumber: capturedPlaceDetails?.phoneNumber ?? 'N/A',
      placeName: destination?.name ?? capturedPlaceDetails?.placeName ?? 'N/A',
      description: destination?.description ?? '',
      rating: String(capturedPlaceDetails?.rating ?? 'N/A'),
      cover
    })
  }

  const onSubmitDestination = async (values: FormConfirm, helpers: FormikHelpers<FormConfirm>) => {
    startTransition(async () => {
      try {
        setDisableMap(true);
        setServerResponse(null);

        let sourceUrl = '';

        // get source from google if sourceUrl is empty
        if (values.cover.length > 0 && isGoogleImage(values.cover[0].url)) {
          sourceUrl = getGoogleImageLiink(values.cover[0].url);
        } else if (values.cover.length > 0 && !values.cover[0].url.includes(destination?.cover ?? '')) {
          const formData = new FormData();
          const file = values.cover[0].file as File;
          formData.set('file', file, file.name);
          const result = await uploadImage(formData);
          sourceUrl = result?.data?.url;
        } else if (values.cover.length > 0) {
          sourceUrl = destination?.cover ?? '';
        } else if (capturedPlaceDetails && capturedPlaceDetails?.photos?.length > 0) {
          sourceUrl = capturedPlaceDetails?.photos[0].getUrl({ maxWidth: 600, maxHeight: 600 });
        }


        const responseState = await handleServerAction(() => updateDestination({
          name: values.placeName ?? capturedPlaceDetails?.placeName,
          categoryIds: initialInputValues.categories,
          locationId: initialInputValues.location ?? 0,
          contactNumber: capturedPlaceDetails?.phoneNumber ?? '',
          description: values.description,
          latitude: capturedPlaceDetails?.geometry?.location?.lat() ?? 0,
          longitude: capturedPlaceDetails?.geometry?.location?.lng() ?? 0,
          placeId: capturedPlaceDetails?.placeId ?? '',
          ratingScore: capturedPlaceDetails?.rating || 0,
          cover: sourceUrl,
          map: `https://www.google.com/maps/place/?q=place_id:${capturedPlaceDetails?.placeId}`,
          website: capturedPlaceDetails?.website ?? '',
          email: '',
          isPopular: 1,
          status: 1
        }, String(destination?.id)));

        setDisableMap(false);
        setServerResponse(responseState);

        if (!responseState.success) return;
        router.push('/admin/destinations');
      } catch (error) {
        helpers.setSubmitting(false);
        console.error(error);
      }
    });
  }

  return (
    <DashboardContainer breadcrumbs={breadcrumbs} title='Update Destination'>
      <Stepper sx={{ paddingBottom: 5 }} activeStep={activeStep}>
        <Step>
          <StepLabel>Setup Destination information</StepLabel>
        </Step>
        <Step>
          <StepLabel>Capture Destination on Map</StepLabel>
        </Step>
        <Step>
          <StepLabel>Confirmation</StepLabel>
        </Step>
      </Stepper>
      {activeStep === 0 && 
        <Formik initialValues={initialInputValues} onSubmit={onFormSubmit} validationSchema={validationSchema} enableReinitialize>
          {() => (
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
          <GooglePlaceCapture
            key={'edit'} 
            apiKey={GOOGLE_MAP_KEY ?? ''} 
            disableInteraction={disableMap} 
            resetState={resetMap} 
            initialMarkers={selectedCoordinate}
          />
        </Box>
      </Box>
      {/* step confirmation */}
      <Box hidden={activeStep !== 2}>
        <Formik initialValues={formConfirmInitial} validationSchema={validateConfirmation} onSubmit={onSubmitDestination} enableReinitialize>
          {({ isSubmitting }) => (
            <Form>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <Button type="button" variant="contained" color="warning" onClick={() => setActiveStep(activeStep - 1)} disabled={isSubmitting} startIcon={<ArrowBack />}>
                  Back
                </Button>
                <Button type="submit" variant="contained" color="primary" loading={isSubmitting}>
                  Save
                </Button>
              </Box>
              <Grid container spacing={2} width={600} maxWidth='100%' marginX='auto' marginTop={6}>
                <Grid size={12}>
                  <CustomTextField 
                    name='placeName'
                    label='Place Name'
                  />
                  <CustomErrorMessage name='placeName' />
                </Grid>
                <Grid size={12}>
                  <CustomTextField 
                    name='description'
                    label='Description'
                    multiline
                    rows={6}
                    placeholder='Place description'
                  />
                  <CustomErrorMessage name='description' />
                </Grid>
                {/* photo */}
                <Grid size={12}>
                  <FileInput
                    name="cover" 
                    accept="image/*" 
                    maxsize={1} 
                    label='Upload destination cover photo'
                  />
                  <CustomErrorMessage name='cover' />
                </Grid>
                <Divider sx={{ width: '100%'}} />
                <Grid size={12}>
                  <CustomTextField 
                    name='phoneNumber'
                    label='Phone Number'
                    disabled
                  />
                  <CustomErrorMessage name='phoneNumber' />
                </Grid>
                <Grid size={12}>
                  <CustomTextField 
                    name='rating'
                    label='Rating'
                    disabled
                  />
                  <CustomErrorMessage name='rating' />
                </Grid>
                <Grid size={12}>
                  <CustomTextField 
                    name='address'
                    label='address'
                    multiline
                    rows={2}
                    disabled
                  />
                  <CustomErrorMessage name='address' />
                </Grid>
                <Grid size={12}>
                  <InputLabel sx={{ marginBottom: 1 }}>Galleries</InputLabel>
                  <ImageList cols={3} rowHeight={300}>
                    {(capturedPlaceDetails?.photos ?? []).map((item) => (
                      <ImageListItem key={item.getUrl({ maxWidth: 200 })}>
                        <img
                          srcSet={`/cdn?photoUrl=${encodeURIComponent(item.getUrl({ maxWidth: 200 }))}`}
                          src={`/cdn?photoUrl=${encodeURIComponent(item.getUrl({ maxWidth: 200 }))}`}
                          alt={capturedPlaceDetails?.placeName ?? ''}
                        />
                      </ImageListItem>
                    ))}
                  </ImageList>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Box>
      {/* alert */}
      {serverResponse && <Toast success={serverResponse.success} message={serverResponse.message} />}
      <CustomBackdrop open={isPending} />
    </DashboardContainer>
  )
}