import * as yub from 'yup';

export const LoginSchema = yub.object({
  username: yub.string().label('Username').required().trim(),
  password: yub.string().label('Password').required()
})