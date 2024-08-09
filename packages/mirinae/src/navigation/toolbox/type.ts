import type { MenuItem } from '@/inputs/context-menu/type';
import type { QueryTag } from '@/inputs/search/query-search-tags/type';
import type { KeyItemSet, ValueHandlerMap } from '@/inputs/search/query-search/type';

export interface ToolboxOptions {
    pageStart?: number;
    pageLimit?: number;
    sortBy?: string;
    queryTags?: QueryTag[];
    searchText?: string;
    sortDesc?: boolean;
}

export interface ToolboxProps {
    paginationVisible?: boolean;
    pageSizeChangeable?: boolean;
    placeholder?: string;
    settingsVisible?: boolean;
    sortable?: boolean;
    exportable?: boolean;
    refreshable?: boolean;
    searchable?: boolean;
    filtersVisible?: boolean;
    searchType?: string;
    thisPage?: number;
    pageSize?: number;
    totalCount?: number;
    hasNextPage?: boolean;
    sortBy?: string;
    pageSizeOptions?: number[];
    sortByOptions?: MenuItem[];
    keyItemSets?: KeyItemSet[];
    valueHandlerMap?: ValueHandlerMap;
    queryTags?: QueryTag[];
    searchText?: string;
    timezone?: string;
}
