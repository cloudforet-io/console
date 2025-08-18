import type { RESOURCE_TYPE } from '@/api-clients/search/resource/schema/config';

export type ResourceType = typeof RESOURCE_TYPE[keyof typeof RESOURCE_TYPE];
