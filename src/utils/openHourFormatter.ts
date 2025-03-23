const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatTime(timeStr: string): string {
  const hours = parseInt(timeStr.slice(0, 2), 10);
  const minutes = timeStr.slice(2);
  const period = hours >= 12 ? 'PM' : 'AM';
  const adjustedHours = hours % 12 || 12;
  return `${adjustedHours}:${minutes} ${period}`;
}

export function formatOpeningHours(openingHours: google.maps.places.PlaceOpeningHours): string {
  if (!openingHours || !openingHours.periods || openingHours.periods.length === 0) {
    return 'Opening hours not available';
  }
  const period = openingHours.periods[0]; // First period
  const openDay = days[period.open.day];
  const openTime = formatTime(period.open.time);
  return `Opens ${openTime} ${openDay}`;
}