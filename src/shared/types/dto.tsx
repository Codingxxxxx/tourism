export type Meta = {
  createdAt: Date,
  createdBy?: number,
  updatedAt?: Date,
  updatedBy?: number
}

export type Category = Meta & {
  id: number,
  name: string,
  nameKH: string,
  parentId: number,
  parent: Category | null,
  description:  string,
  photo: string,
  video: string,
  isFeatured: boolean,
  isFront: boolean,
  child: Category[],
  listingCount: number
}

export type Location = Meta & {
  id?: number,
  name: string,
  remark: string,
  latitude?: string,
  longitude?: string
}

export type Destination = Meta & {
  id?: number,
  name: string,
  categoryIds: number[],
  locationId: number,
  latitude: number,
  longitude: number,
  placeId: string,
  description: string,
  cover: string,
  map?: string,
  website?: string,
  contactNumber?: string,
  isPopular: number,
  ratingScore: number,
  categories: Category[],
  location: Location
}

export type PaginationMeta = {
  total: number,
  itemCount?: number,
  limit?: number,
  page?: number,
  pages?: number
}

export type PaginationParamters = {
  limit: number,
  offset: number
}

export type FormCreateCateogry = {
  name: string,
  nameKH: string,
  description?: string,
  video?: string,
  photo?: string,
  parentId: number,
  isFront: number
}

export type FormCreateLocation = {
  id?: number,
  name: string,
  remark?:string,
  latitude: number,
  longitude: number
}

export type UploadImageResult = {
  url: string
}

export type FormCreateDestination = {
  name: string,
  categoryIds: number[],
  locationId: number,
  latitude: number,
  longitude: number,
  placeId: string,
  description: string,
  cover?: string,
  map?: string,
  website?: string,
  contactNumber: string,
  ratingScore: number,
  email: string,
  isPopular: number,
  status: number
}

export type FormCreateUser = {
  firstName: string,
  lastName: string,
  username: string,
  password: string,
  email: string,
  roleIds: number[]
}

export type FormUpdateUser = {
  firstName: string,
  lastName: string,
  username: string,
  email: string,
  roleIds: number[]
}

export type Role = {
  id: number,
  name: string
}

export type User = {
  id: number,
  username: string,
  email: string,
  firstName: string,
  lastName: string,
  roles: Role[]
}

export type DashboardStatistic = {
  category: {
    total: number
  },
  listing: {
    total: number
  }
}