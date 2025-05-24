import 'server-only';

export const ApiEndpont = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh',
  CATEGORY_LIST: '/category',
  CATEGORY_CREATE: '/category',
  CATEGORY_ALL: '/category/list',
  CATEGORY_RESOURCE: '/category',
  UPLOAD_IMAGE: '/upload/image',
  LOCATION_LIST: '/location',
  LOCATOIN_CREATE: '/location',
  LOCATOIN_EDIT: '/location',
  LOCATION_BY_ID: '/location',
  LOCATION_ALL: '/location/list',
  LOCATION_DELETE: '/location',
  LISTING_CREATE: '/cms/listing',
  LISTING_LIST: '/cms/listing',
  USER_LIST: '/users',
  USER_CREATE: '/users',
  WEB_LISTING_CATEGORY: '/category',
  WEB_LISTING_SUB_CATEGORY: '/category/child',
  WEB_LISTING_DESTINATION: '/listing/cat',
  WEB_LISTING_DESTINATION_DETAILS: '/listing/details'
}