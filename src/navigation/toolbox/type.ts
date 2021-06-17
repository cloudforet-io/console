import { QueryTag } from '@/inputs/search/query-search-tags/type';
import { KeyItemSet, ValueHandlerMap } from '@/inputs/search/query-search/type';

export interface ToolboxOptions {
    pageStart?: number;
    pageLimit?: number;
    sortBy?: string;
    queryTags?: QueryTag[];
    searchText?: string;
}

export interface ToolboxProps {
    paginationVisible?: boolean;
    pageSizeChangeable?: boolean;
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
    sortBy?: string;
    pageSizeOptions?: number[];
    sortByOptions?: string[];
    keyItemSets?: KeyItemSet[];
    valueHandlerMap?: ValueHandlerMap;
    queryTags?: QueryTag[];
    searchText?: string;
    timezone?: string;
}
