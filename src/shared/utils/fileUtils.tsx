const SERVER_IMAGE = process.env.NEXT_PUBLIC_IMAGE_SERVER;

export function convertByteToMB(bytes: number) {
  return Number(bytes / 1048576).toFixed(1);
}

export function getImagePath(imageUrl: string) {
  if (!imageUrl) return '';
  if (imageUrl.includes('google')) return `/cdn?photoUrl=${encodeURIComponent(imageUrl)}`; // url is from google
  return SERVER_IMAGE + imageUrl;
}

export function isGoogleImage(imageUrl: string) {
  return imageUrl.includes('google');
}

export function getGoogleImageLiink(cdnUrl: string) {
  const queryString = cdnUrl.split('?')[1];
  const params = new URLSearchParams(queryString);
  return decodeURIComponent(params.get('photoUrl') ?? '');
}