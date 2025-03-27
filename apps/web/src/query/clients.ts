import { QueryClient } from '@tanstack/vue-query';

/**
 * Main query client for service-level data fetching and caching.
 * This is the default query client used throughout the application.
 * It's automatically injected when useQueryClient() is called in service context.
 */
export const serviceQueryClient = new QueryClient();

/**
 * Dedicated query client for the reference data system.
 * This client is used internally by the reference data system for managing its own cache.
 * It's not meant to be used directly in service context.
 */
export const referenceQueryClient = new QueryClient();
