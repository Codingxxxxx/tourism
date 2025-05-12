export async function formDataToJson(formData: FormData) {
  return Object.fromEntries(formData.entries());
}