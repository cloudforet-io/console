import type { RESOURCE_CONFIG_MAP } from '@/query/resource-query/shared/contants/resource-config-map';

export type ResourceKeyType = keyof typeof RESOURCE_CONFIG_MAP;

export type ResourceCacheType<T extends Record<string, any>> = Record<string, T>;
