const SERVER_IMAGE = process.env.NEXT_PUBLIC_IMAGE_SERVER;

export function convertByteToMB(bytes: number) {
  return Number(bytes / 1048576).toFixed(1);
}

export function getImagePath(imageUrl: string) {
  if (!imageUrl) return '';
  return SERVER_IMAGE + imageUrl;
}