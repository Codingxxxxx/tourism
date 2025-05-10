import * as yub from 'yup';

export const LoginSchema = yub.object({
  email: yub.string().email().label('Username').required().trim(),
  password: yub.string().label('Password').required()
})