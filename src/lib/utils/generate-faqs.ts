import { PlaceWithImages } from '@/types';

export function generatePlaceFAQs(place: PlaceWithImages) {
  const faqs = [
    {
      q: `What is ${place.name}?`,
      a: `${place.name} is a ${place.religion.toLowerCase()} place of worship located in ${place.city}, ${place.state}. It serves the local community with regular services, events, and spiritual guidance.`,
    },
    {
      q: `Where is ${place.name} located?`,
      a: `It is located at ${place.address || 'an address'} in ${place.city}, ${place.state} ${place.zip || ''}. You can click the "Get Directions" button to open Google Maps.`,
    },
    {
      q: `What are the regular service times?`,
      a: place.schedule_notes && Object.keys(place.schedule_notes).length > 0
        ? `Service times: ${JSON.stringify(place.schedule_notes)}. Please contact the place directly for the most up-to-date schedule.`
        : `Please contact ${place.name} directly or visit their website for the latest service schedule.`,
    },
    {
      q: `What facilities are available?`,
      a: place.facilities.length > 0
        ? `Available facilities include: ${place.facilities.join(', ')}.`
        : `Basic worship facilities are available. Contact them for more details.`,
    },
    {
      q: `How can I contact ${place.name}?`,
      a: `You can reach them by phone at ${place.phone || 'their listed contact number'}, email at ${place.email || 'their email address'}, or through their website at ${place.website || 'their official website'}.`,
    },
  ];

  return faqs;
}
