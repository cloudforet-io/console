import type { ResourceModel } from '@/api-clients/search/resource/schema/model';
import type { ResourceType } from '@/api-clients/search/resource/schema/type';

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
