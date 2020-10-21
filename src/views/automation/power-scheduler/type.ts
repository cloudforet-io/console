/* eslint-disable camelcase */
import { QueryFilters } from '@/lib/type';
import { Filter } from '@/lib/space-connector/type';

export type ViewMode = 'READ'|'CREATE'|'UPDATE'

export interface Resource {
    resource_type: string;
    filter: Filter[];
    keyword: string;
}

export interface ResourceGroup {
    resource_group_id?: string;
    name: string;
    resources: Resource[];
    options: {
        raw_filter: QueryFilters;
    };
    // tags?: object;
}

export interface KanbanItem {
    resource_group?: ResourceGroup;
    name?: string;
    count?: number;
    icon?: string;
    recommended?: boolean;
}

export type ResourceGroupItem = Pick<Required<KanbanItem>, 'resource_group'|'count'|'name'|'recommended'>
