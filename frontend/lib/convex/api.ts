// Local API shim using Convex's runtime proxies.
// This avoids cross-dir ESM parsing issues while remaining compatible with useQuery/useMutation.
import { anyApi, componentsGeneric } from 'convex/server';
export const api = anyApi;
export const internal = anyApi;
export const components = componentsGeneric();
