export type ServerResponse<T = any> = {
  message?: string;
  success?: boolean;
  data?: T;
  isUnauthorized?: boolean;
};