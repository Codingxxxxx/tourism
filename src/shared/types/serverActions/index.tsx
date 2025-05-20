import { PaginationMeta } from '../dto';

export type ServerResponse<T = any> = {
  message?: string;
  success?: boolean;
  data?: T;
  isUnauthorized?: boolean;
};

export type PaginateDestination = {
  destinations: PaginateDestination[];
  meta?: PaginationMeta | null;
};