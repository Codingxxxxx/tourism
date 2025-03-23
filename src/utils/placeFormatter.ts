export function formatPlaceType(type: string): string {
  return type
    .replace(/_/g, ' ') // Replace underscores with spaces
    .split(' ') // Split into words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
    .join(' '); // Join back with spaces
}
