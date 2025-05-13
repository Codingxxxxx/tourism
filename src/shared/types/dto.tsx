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
  video: string
}

export type PaginationMeta = {
  total: number,
  itemCount: number,
  limit: number,
  page: number,
  pages: number
}

export type PaginationParamters = {
  limit: number,
  offset: number
}

export type FormCreateCateogry = {
  name: string,
  nameKH: string,
  description?: string,
  video?: string
  image?: string
}

export type UploadImageResult = {
  url: string
}