// Alias for formdata-polyfill to prevent it from overwriting window.fetch
export const FormData = globalThis.FormData;
export const formDataToBlob = (fd) => {
  // Simple fallback if needed, but native fetch handles FormData directly
  return fd;
};
export default globalThis.FormData;
