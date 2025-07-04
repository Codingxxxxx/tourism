'use client';
import { Breadcrumb } from '@toolpad/core';
import { Backdrop, Box, Button, Grid2 as Grid } from '@mui/material';
import { Formik, Form, FormikHelpers } from 'formik';
import FormGroup from '@/components/form/FormGroup';
import * as Yub from 'yup';
import CustomErrorMessage from '@/components/form/ErrorMessage';
import CustomTextField from '@/components/form/CustomField';
import CustomCheckBox from '@/components/form/CustomCheckBox';
import DashboardContainer from '@/components/dashboard/DashboardContainer';
import FileInput, { type FileObject } from '@/components/form/FileInput';
import { yupFiles } from '@/shared/yubAddons';
import { uploadImage } from '@/server/actions/upload';
import { updateCategoryById, getAllCategories, getCategoryById } from '@/server/actions/category';
import { ServerResponse } from "@/shared/types/serverActions";
import { useEffect, useState, useTransition } from 'react';
import { Category } from '@/shared/types/dto';
import CustomDropdown from '@/components/form/CustomDropdown';
import Toast from '@/components/form/Toast';
import { handleServerAction } from '@/shared/utils/apiUtils';
import { useParams } from 'next/navigation';
import { CustomBackdrop } from '@/components/Backdrop';
import { getImagePath } from '@/shared/utils/fileUtils';
import { useRouter } from 'next/navigation';

type FormCategoryStats = {
  categoryName: string
  image: FileObject[],
  video: string,
  parent: number | null,
  isFront: boolean,
  ordering: number
}

type PageParams = {
  id: string
}

const validationSchema = Yub.object({
  categoryName: Yub.string().label('Category Name').required().max(50),
  parent: Yub.number(),
  ordering: Yub.number().required().label('Ordering').typeError('${label} must be a number').max(99999),
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
  const router = useRouter();
  const params = useParams<PageParams>();
  const [serverResponse, setServerResponse] = useState<ServerResponse | null>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState<Category>();
  const [isPending, startTransition] = useTransition();

  const breadcrumbs: Breadcrumb[] = [
    {
      title: 'Dashboard',
      path: '/admin'
    },
    {
      title: 'Categories',
      path: '/admin/categories'
    },
    {
      title: 'Update Category'
    }
  ];

  const [initialInputValues, setInitialInputValuess] = useState<FormCategoryStats>({
    categoryName: '',
    image: [],
    video: '',
    parent: 0,
    isFront: false,
    ordering: 1
  });

  useEffect(() => {
    startTransition(async () => {
      const [responseCategory, responseCategoryDetails] = await Promise.all([
        handleServerAction<Category[]>(() => getAllCategories()),
        handleServerAction<Category>(() =>getCategoryById(params.id))
      ]);

      if (!responseCategory.success) return setServerResponse(responseCategory);
      if (!responseCategoryDetails.success) return setServerResponse(responseCategoryDetails);

      const categories = responseCategory.data ?? [];
      const category = responseCategoryDetails.data as Category;

      setCategories(categories)
      setCategory(category);

      const image: FileObject = {
        filename: '',
        size: 0,
        mimetype: 'image/jpg',
        url: getImagePath(category.photo)
      }

      setInitialInputValuess({
        categoryName: category.name,
        image: category.photo ? [image] : [],
        parent: category.parentId ?? 0,
        video: category.video ?? '',
        isFront: Boolean(category.isFront),
        ordering: category.ordering
      });
    });
  }, []);
  
  const onFormSubmit = async (values: FormCategoryStats, helper: FormikHelpers<FormCategoryStats>): Promise<void> => {
    try {
      setServerResponse(null);
      let sourceUrl = ''; // can be image url or video url

      if (values.image.length > 0 && getImagePath(category?.photo ?? '') === values.image[0].url) {
        sourceUrl = category?.photo as string
      } else if (values.image && values.image.length > 0) {
        // upload image
        const formData = new FormData();
        const file = values.image[0].file as File;
        formData.set('file', file, file.name);
        const result = await uploadImage(formData);
        sourceUrl = result?.data?.url
      }

      // update category
      const serverResponse = await handleServerAction(() => 
        updateCategoryById({
          name: values.categoryName,
          nameKH: values.categoryName,
          photo: sourceUrl,
          video: values.video,
          parentId: values.parent ?? 0,
          isFront: Number(values.isFront),
          ordering: Number(values.ordering)
        }, String(category?.id))
      );

      if (serverResponse.success) return router.push('/admin/categories');

      setServerResponse(serverResponse);

      if (serverResponse.success) {
        helper.resetForm();
      }

    } catch (error) {
      helper.setSubmitting(false);
      console.log(error);
    }
  }

  return (
    <DashboardContainer breadcrumbs={breadcrumbs} title='Update Category'>
      <Formik initialValues={initialInputValues} onSubmit={onFormSubmit} validationSchema={validationSchema} enableReinitialize>
        {({ isSubmitting, values }) => (
          <Form>
            <Grid container spacing={2} width={600} maxWidth='100%' marginX='auto' marginTop={4}>
              {/* Category name */}
              <Grid size={12}>
                <FormGroup>
                  <CustomTextField
                    id='categoryName'
                    label='Category Name'
                    name='categoryName'
                    required
                  />
                  <CustomErrorMessage name='categoryName' />
                </FormGroup>
              </Grid>
              {/* Category list */}
              <Grid size={12}>
                <FormGroup>
                  <CustomDropdown
                    id='parent'
                    label='Parent Category'
                    name='parent'
                    items={categories.map(category => ({ text: category.name, value: category.id }))}
                    defaultSelectValue={category?.parentId ?? 0}
                    datatype='number'
                  />
                  <CustomErrorMessage name='parent' />
                </FormGroup>
              </Grid>
              {/* ordering */}
              <Grid size={12}>
                <FormGroup>
                  <CustomTextField label="Ordering" name="ordering" required />
                  <CustomErrorMessage name="ordering" />
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
      {serverResponse && <Toast success={serverResponse.success || false} message={serverResponse.message} />}
      <CustomBackdrop open={isPending} />
    </DashboardContainer>
  )
}