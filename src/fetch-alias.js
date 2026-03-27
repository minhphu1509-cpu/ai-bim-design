// Alias for node-fetch to use native browser fetch
const nativeFetch = globalThis.fetch.bind(globalThis);
export default nativeFetch;
export const fetch = nativeFetch;
export const Request = globalThis.Request;
export const Response = globalThis.Response;
export const Headers = globalThis.Headers;
export const FormData = globalThis.FormData;
export const AbortController = globalThis.AbortController;
