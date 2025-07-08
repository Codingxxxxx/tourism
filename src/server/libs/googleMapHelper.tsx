import { Destination } from '@/shared/types/dto';
import { isCustomUploadImage, isGoogleImage } from '@/shared/utils/fileUtils';
import 'server-only'

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

const IMAGE_BASE_URL = 'https://maps.googleapis.com/maps/api/place/photo?key=' + GOOGLE_API_KEY;

export async function getGoogleMapPhoto(placeId: string, maxWidth: number = 600): Promise<string | null | undefined> {
  try {
    const res = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_API_KEY}&fields=photos`, {
      next: {
          revalidate: 72000 // cache 20 hours, since google image doesn't change frequently
      }
    }); 

    if (!res.ok) {
      console.error(await res.text())
      return null;
    }

    const data = await res.json();

    console.log('PLACE_DETAILS: ', data);

    if (!(data && data.result && data.result.photos && data.result.photos.length > 0)) return null;

    // generate google image base on photo reference
    return IMAGE_BASE_URL + '&maxwidth=' + Math.max(maxWidth, 600) + '&photoreference=' + data.result.photos[0].photo_reference;
  } catch (error){
    console.error(error);
    return null;
  }
}

export async function mapDestinationGoogleImage(destination: Destination[], maxWidth: number = 600) {
  // remove previously saved google image
  destination
    .filter(destination => isGoogleImage(destination.cover))
    .forEach(destination => {
        destination.cover = '';
    });

  const destinationsContainGoogleImage = destination.filter(destination => (!isCustomUploadImage(destination.cover) || !destination.cover) && destination.placeId);

  const googleImagePromises = destinationsContainGoogleImage.map(async destination => {
    const photo = await getGoogleMapPhoto(destination.placeId, maxWidth);
    destination.cover = photo ?? '';
  });
  await Promise.all(googleImagePromises);
}