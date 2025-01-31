import type { RESOURCE_GROUP } from '@/api-clients/_common/schema/constant';

export type ResourceGroupType = typeof RESOURCE_GROUP[keyof typeof RESOURCE_GROUP];

export interface Page {
    start: number;
    limit: number;
}

export type ContentsType = 'html' | 'markdown' | 'plain';
