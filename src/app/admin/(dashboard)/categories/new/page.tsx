'use client';
import { Breadcrumb } from '@toolpad/core';
import { Alert, Box, Button, Grid2 as Grid } from '@mui/material';
import { Formik, Form, FormikHelpers } from 'formik';
import FormGroup from '@/components/form/FormGroup';
import * as Yub from 'yup';
import CustomErrorMessage from '@/components/form/ErrorMessage';
import CustomTextField from '@/components/form/CustomField';
import CustomCheckBox from '@/components/form/CustomCheckBox';
import DashboardContainer from '@/components/dashboard/DashboardContainer';
import FileInput, { FileObject } from '@/components/form/FileInput';
import { yupFiles } from '@/shared/yubAddons';
import { uploadImage } from '@/server/actions/upload';
import { createCategory, getAllCategories } from '@/server/actions/category';
import { ServerResponse } from '@/shared/types/serverActions';
import { useEffect, useState } from 'react';
import { Category } from '@/shared/types/dto';
import CustomDropdown from '@/components/form/CustomDropdown';
import Toast from '@/components/form/Toast';
import { handleServerAction } from '@/shared/utils/apiUtils';
import { useRouter } from 'next/navigation';

type FormCategoryStats = {
  categoryName: string;
  image: FileObject[];
  video: string;
  parent?: number;
  isFront: boolean;
};

const validationSchema = Yub.object({
  categoryName: Yub.string().label('Category Name').required().max(50),
  parent: Yub.number(),
  isFront: Yub.bool(),
  video: Yub.string().label('Video URL or Embed Code').when('parent', {
    is: 0,
    then: (schema) => schema.test(
      'at-least-one',
      'At least video or image is required',
      function (value, context) {
        const { image } = context.parent;
        const hasVideo = !!value;
        const hasImage = !!image && image.length > 0;
        return hasVideo || hasImage;
      }
    ),
    otherwise: (schema) => schema.notRequired(),
  }),
  image: yupFiles({
    formats: ['image/png', 'image/jpg', 'image/jpeg']
  }).when('parent', {
    is: 0,
    then: (schema) => schema.test(
      'at-least-one',
      'At least video or image is required',
      function (value, context) {
        const { video } = context.parent;
        const hasVideo = !!video;
        const hasImage = !!value && value.length > 0;
        return hasVideo || hasImage;
      }
    ),
    otherwise: (schema) => schema.notRequired(),
  }),
});

export default function Page() {
  const [serverResponse, setServerResponse] = useState<ServerResponse | null>();
  const [categories, setCategories] = useState<Category[]>([]);
  const router = useRouter();

  const breadcrumbs: Breadcrumb[] = [
    { title: 'Dashboard', path: '/admin' },
    { title: 'Categories', path: '/admin/categories' },
    { title: 'New Category', path: '/admin/categories/new' },
  ];

  const initialInputValues: FormCategoryStats = {
    categoryName: '',
    image: [],
    video: '',
    parent: 0,
    isFront: false,
  };

  useEffect(() => {
    (async () => {
      const { data } = await handleServerAction(() => getAllCategories());
      setCategories(data || []);
    })();
  }, []);

  const onFormSubmit = async (values: FormCategoryStats, helper: FormikHelpers<FormCategoryStats>): Promise<void> => {
    try {
      setServerResponse(null);
      let sourceUrl = '';

      if (values.parent === 0 && values.image.length > 0) {
        const formData = new FormData();
        const file = values.image[0].file as File;
        formData.set('file', file, file.name);
        const result = await uploadImage(formData);
        sourceUrl = result?.data?.url;
      }

      const serverResponse = await handleServerAction(() =>
        createCategory({
          name: values.categoryName,
          nameKH: values.categoryName,
          photo: sourceUrl,
          video: values.video,
          parentId: Number(values.parent ?? 0),
          isFront: Number(values.isFront ?? 0),
        })
      );

      setServerResponse(serverResponse);

      if (serverResponse.success) {
        router.push('/admin/categories');
      }
    } catch (error) {
      helper.setSubmitting(false);
      console.log(error);
    }
  };

  return (
    <DashboardContainer breadcrumbs={breadcrumbs} title="Create New Category">
      <Formik initialValues={initialInputValues} onSubmit={onFormSubmit} validationSchema={validationSchema}>
        {({ isSubmitting, values, errors }) => (
          <Form>
            <Grid container spacing={2} width={600} maxWidth="100%" marginX="auto" marginTop={4}>
              <Grid size={12}>
                <FormGroup>
                  <CustomTextField id="categoryName" label="Category Name" name="categoryName" required />
                  <CustomErrorMessage name="categoryName" />
                </FormGroup>
              </Grid>
              <Grid size={12}>
                <FormGroup>
                  <CustomDropdown
                    id="parent"
                    label="Parent Category"
                    name="parent"
                    items={categories.map((category) => ({ text: category.name, value: category.id }))}
                  />
                  <CustomErrorMessage name="parent" />
                </FormGroup>
              </Grid>
              {values.parent === 0 && (
                <Grid size={12}>
                  <FileInput id="image" name="image" accept="image/*" maxsize={2.5} />
                  <CustomErrorMessage name='image' />
                </Grid>
              )}
              {values.parent === 0 && (
                <Grid size={12}>
                  <FormGroup sx={{ marginLeft: 'auto' }}>
                    <CustomTextField id="video" label="Video URL or Embed Code" name="video" multiline rows={10} />
                    <CustomErrorMessage name='video' />
                  </FormGroup>
                </Grid>
              )}
              {values.parent === 0 && (
                <Grid size={12}>
                  <CustomCheckBox id="isFront" label="Show video in home page" name="isFront" checked={values.isFront} />
                </Grid>
              )}
              <Grid size={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  loading={isSubmitting}
                >
                  Save
                </Button>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
      {serverResponse && <Toast success={serverResponse.success || false} message={serverResponse.message} />}
    </DashboardContainer>
  );
}