import type { RESOURCE_GROUP } from '@/schema/_common/constant';

export type ResourceGroupType = typeof RESOURCE_GROUP[keyof typeof RESOURCE_GROUP];
