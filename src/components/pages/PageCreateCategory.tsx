'use client';
import { Breadcrumb } from '@toolpad/core';
import { Box, Button, Grid2 as Grid, Slide, SlideProps, Snackbar } from '@mui/material';
import { styled } from '@mui/material/styles';
import { CloudUpload } from '@mui/icons-material';
import { useActionState, useDebugValue, useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import FormGroup from '@/components/form/FormGroup';
import * as Yub from 'yup';
import CustomErrorMessage from '@/components/form/ErrorMessage';
import CustomTextField from '@/components/form/CustomField';
import DashboardContainer from '@/components/dashboard/DashboardContainer';
import FileInput from '@/components/form/FileInput';
import { yupFiles } from '@/shared/yubAddons';
import { uploadImage } from '@/server/actions/upload';
import { createCategory } from '@/server/actions/category';
import { FormState } from '@/shared/formStates';


type FormCategoryStats = {
  categoryName: string
  categoryNameKH: string
  description?: string,
  image: File[]
}

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction='up' />;
}

export default function PageCreateCategory() {
  const [formStat, setFormStat] = useState<FormState>();

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

  const [formProps] = useState<FormCategoryStats>({
      categoryName: '',
      categoryNameKH: '',
      description: '',
      image: []
    });
  
    const validationSchema = Yub.object({
      categoryName: Yub.string().label('Category Name').required().max(50),
      categoryNameKH: Yub.string().label('Category Name KH').required().max(50),
      description: Yub.string().label('Description').length(50),
      image: yupFiles({
        formats: ['image/png', 'image/jpg', 'image/jpeg'],
        required: true
      })
    });
  
    const onFormSubmit = async (values: FormCategoryStats) => {
      // upload image
      const formData = new FormData();
      const file = values.image[0];
      formData.set('file', file, file.name);
      const result = await uploadImage(formData);
      const url =result?.data.url
      
      // create category
      const formStat = await createCategory({
        name: values.categoryName,
        nameKH: values.categoryNameKH,
        description: values.description,
        image: url
      });
      console.log(formStat);
      setFormStat(formStat);
    }

  return (
    <DashboardContainer breadcrumbs={breadcrumbs} title='Create New Category'>
      <Formik initialValues={formProps} onSubmit={onFormSubmit} validationSchema={validationSchema}>
        {({ values, handleChange, handleBlur, handleSubmit, errors, touched, isSubmitting }) => (
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
              {/* Descriptino */}
              <Grid size={12}>
                <FormGroup>
                  <CustomTextField
                    id='description'
                    label='Description'
                    name='description'
                  />
                  <CustomErrorMessage name='categoryNameKH' />
                </FormGroup>
              </Grid>
              {/* File input */}
              <Grid size={12}>
                <FileInput
                  id='image'
                  name='image'
                  accept='image/*'
                />
                <CustomErrorMessage name='image' />
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