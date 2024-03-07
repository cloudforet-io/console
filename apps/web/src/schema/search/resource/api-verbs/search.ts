import type { ResourceModel } from '@/schema/search/resource/model';
import type { ResourceType } from '@/schema/search/resource/type';

export interface ResourceSearchParameters {
    resource_type: ResourceType;
    keyword?: string;
    limit?: number;
    workspaces?: string[];
    all_workspaces?: boolean;
    next_token?: string;
}

export type ResourceSearchResponse = {
    results: ResourceModel[];
    next_token?: string;
};
