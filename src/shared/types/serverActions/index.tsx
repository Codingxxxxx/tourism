import type { PaginationMeta, Location, Category, User } from '../dto';

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


export type PaginatedCategories = {
  categories: Category[];
  meta: PaginationMeta | null;
};

export type PaginatedLocations = {
  locations: Location[];
  meta?: PaginationMeta | null;
};

export type PaginatedDisplayCategories = {
  categories: Category[];
  meta: PaginationMeta | null;
  videoCategory?: Category
};

export type PaginatedUsers = {
  users: User[],
  meta?: PaginationMeta
}