import type { QueryTag } from '@/component-util/query-search/type';

export interface ToolboxOptions {
    pageStart?: number;
    pageLimit?: number;
    sortBy?: string;
    queryTags?: QueryTag[];
    searchText?: string;
}
