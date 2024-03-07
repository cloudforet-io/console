import type { RESOURCE_TYPE } from '@/schema/search/resource/config';

export type ResourceType = typeof RESOURCE_TYPE[keyof typeof RESOURCE_TYPE];
