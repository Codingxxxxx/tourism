import { Category, PaginationMeta } from '../dto';

export type PaginatedCategories = {
  categories: Category[];
  meta: PaginationMeta | null;
};

export type PaginatedLocations = {
  locations: Location[];
  meta?: PaginationMeta | null;
};