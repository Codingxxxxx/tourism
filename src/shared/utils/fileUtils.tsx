export function convertByteToMB(bytes: number) {
  return Number(bytes / 1048576).toFixed(1);
}