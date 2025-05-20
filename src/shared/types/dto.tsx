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
  description:  string,
  photo: string,
  video: string,
  child: Category[]
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
  categories: Category[]
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
  parentId: number
}

export type FormCreateLocation = {
  name: string,
  remark:string
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