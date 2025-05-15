/**
 * Find offset by using current page and item sizes
 * @param page 
 * @param itemSize 
 * @returns {number}
 */
export function getPageOffset(page: number, itemSize: number) {
  return page * itemSize;
}