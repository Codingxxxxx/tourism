'use client'
import { Formik, Form, Field } from 'formik';
import { useState } from 'react';
import * as Yub from 'yup';
import { Box, Button, TextField, Typography } from '@mui/material';
import FormGroup from '@/components/form/FormGroup';
import CustomTextField from '@/components/form/CustomField';
import CustomErrorMessage from '@/components/form/ErrorMessage';

export default function Login() { 
  const [background] = useState('/admin/login_bg.jpg');
  const [formStat, setFormStat] = useState({
    username: '',
    password: ''
  });

  const validationSchema = Yub.object({
    username: Yub.string().label('Username').required(),
    password: Yub.string().label('Password').required()
  });

  const onFormSubmit = () => {

  }

  return (
    <Box 
      className='h-screen flex flex-col justify-center items-center' 
      sx={{ backgroundImage: `url(${background})`, backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundSize: 'cover'}}>
      <Formik initialValues={formStat} onSubmit={onFormSubmit} validationSchema={validationSchema}>
        {({ values, handleChange, handleBlur, handleSubmit, errors, touched, isSubmitting }) => (
          <Form className='flex flex-col gap-2 w-md border border-gray-200 p-10 rounded shadow-sm bg-slate-200 opacity-95'>
            <Typography textAlign='center' variant='h5' sx={{ marginBottom: 5, fontWeight: 'bold' }}>Login</Typography>
            {/* Name Input */}
            <FormGroup>
              <CustomTextField
                id='username'
                name='username'
                type='text'
                label='Username'
              />
              <CustomErrorMessage name='username' />
            </FormGroup>
            {/* Password Input */}
            <FormGroup>
              <TextField
                  label='Password'
                  name='password'
                  type='password'
                  required
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.password && Boolean(errors.password)}
                  fullWidth
                />
                <CustomErrorMessage name='password' />
            </FormGroup>
            {/* Submit Button */}
            <Button type="submit" variant="contained" color="primary" disabled={isSubmitting} size='large'>
              {isSubmitting ? "Login..." : "Submit"}
            </Button>
          </Form>
        )}
      </Formik>
    </Box>
  )
}