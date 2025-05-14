'use client';
import { Breadcrumb } from '@toolpad/core';
import { Button, Checkbox, FormControlLabel, FormControlState, Grid2 as Grid, Slide, SlideProps, Snackbar } from '@mui/material';
import { Formik, Form, FormikHelpers } from 'formik';
import FormGroup from '@/components/form/FormGroup';
import * as Yub from 'yup';
import CustomErrorMessage from '@/components/form/ErrorMessage';
import CustomTextField from '@/components/form/CustomField';
import CustomCheckBox from '@/components/form/CustomCheckBox';
import DashboardContainer from '@/components/dashboard/DashboardContainer';
import FileInput from '@/components/form/FileInput';
import { yupFiles } from '@/shared/yubAddons';
import { uploadImage } from '@/server/actions/upload';
import { createCategory, getAllCategories } from '@/server/actions/category';
import { FormState } from '@/shared/formStates';
import { useEffect, useState } from 'react';
import { Category } from '@/shared/types/dto';
import CustomDropdown from '@/components/form/CustomDropdown';

type FormCategoryStats = {
  categoryName: string
  categoryNameKH: string
  image: File[],
  isEmbedVideo: boolean,
  video: string,
  parentId: number
}

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction='up' />;
}

const validationSchema = Yub.object({
  categoryName: Yub.string().label('Category Name').required().max(50),
  categoryNameKH: Yub.string().label('Category Name KH').required().max(50),
  isEmbedVideo: Yub.bool(),
  video: Yub
    .string()
    .label('Video URL')
    .url()
    .when('isEmbedVideo', {
      is: true,
      then: (schema) => schema.required(),
      otherwise: (schema) => schema.notRequired()
    })
    ,
  image: yupFiles({
      formats: ['image/png', 'image/jpg', 'image/jpeg']
    })
    .when('isEmbedVideo', {
      is: false,
      then: (schema) => schema.min(1),
      otherwise: (schema) => schema.notRequired()
    })
});

export default function Page() {
  const [formStat, setFormStat] = useState<FormState>();
  const [categories, setCategories] = useState<Category[]>([]);

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
      title: 'New Category',
      path: '/admin/categories/new'
    }
  ];

  const initialInputValues: FormCategoryStats = {
      categoryName: '',
      categoryNameKH: '',
      image: [],
      isEmbedVideo: false,
      video: '',
      parentId: 0
    };

  useEffect(() => {
    (async () => {
      const { data, success, message } = await getAllCategories();
      setCategories(data)
    })();
  }, []);
  
  const onFormSubmit = async (values: FormCategoryStats, helper: FormikHelpers<FormControlState>) => {
    let sourceUrl = ''; // can be image url or video url

    if (!values.isEmbedVideo) {
      // upload image
      const formData = new FormData();
      const file = values.image[0];
      formData.set('file', file, file.name);
      const result = await uploadImage(formData);
      sourceUrl = result?.data.url
    } else {
      sourceUrl = values.video
    }
    
    // create category
    const formStat = await createCategory({
      name: values.categoryName,
      nameKH: values.categoryNameKH,
      photo: values.isEmbedVideo ? undefined : sourceUrl,
      video: values.isEmbedVideo ? sourceUrl : undefined,
      parentId: values.parentId
    });

    setFormStat(formStat);

    if (formStat.success) {
      helper.resetForm();
    }
  }

  return (
    <DashboardContainer breadcrumbs={breadcrumbs} title='Create New Category'>
      <Formik initialValues={initialInputValues} onSubmit={onFormSubmit} validationSchema={validationSchema}>
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
              {/* Category name kh */}
              <Grid size={12}>
                <FormGroup>
                  <CustomTextField
                    id='categoryNameKH'
                    label='Category Name KH'
                    name='categoryNameKH'
                    required
                  />
                  <CustomErrorMessage name='categoryNameKH' />
                </FormGroup>
              </Grid>
              {/* Category list */}
              <Grid size={12}>
                <FormGroup>
                  <CustomDropdown
                    id='parent'
                    label='Parent Cateogry'
                    name='parent'
                    required
                    items={categories.map(category => ({ text: category.name, value: category.id }))}
                  />
                  <CustomErrorMessage name='parent' />
                </FormGroup>
              </Grid>
              {/* File input */}
              {!values.isEmbedVideo && 
                <Grid size={12}>
                  <FileInput
                    id='image'
                    name='image'
                    accept='image/*'
                  />
                  <CustomErrorMessage name='image' />
                </Grid>
              }
              {/* Embed video */}
              {values.isEmbedVideo && 
                <Grid size={12}>
                  <FormGroup sx={{ marginLeft: 'auto' }}>
                    <CustomTextField
                      id='video'
                      label='Video URL'
                      name='video'
                    />
                    <CustomErrorMessage name='video' />
                  </FormGroup>
                </Grid>
              }
              {/* check if embed video */}
              <Grid size={12}>
                <CustomCheckBox id='isEmbedVideo' label='Enable embed video' name='isEmbedVideo'  />
              </Grid>
              {/* submit btn */}
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
      {formStat && 
        <Snackbar
          open={true}
          slots={{ transition: SlideTransition }}
          message={formStat.message}
          key={SlideTransition.name}
          autoHideDuration={1200}
        />
      }
    </DashboardContainer>
  )
}