import type { MenuItem } from '@/inputs/context-menu/type';
import type { KeyItemSet, ValueHandlerMap } from '@/inputs/search/query-search/type';
import type { QueryTag } from '@/inputs/search/query-search-tags/type';
import type { SearchTypes } from '@/navigation/toolbox/config';

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
    settingsVisible?: boolean;
    sortable?: boolean;
    exportable?: boolean;
    refreshable?: boolean;
    searchable?: boolean;
    filtersVisible?: boolean;
    searchType?: SearchTypes;
    thisPage?: number;
    pageSize?: number;
    totalCount?: number;
    sortBy?: string;
    pageSizeOptions?: number[];
    sortByOptions?: MenuItem[];
    keyItemSets?: KeyItemSet[];
    valueHandlerMap?: ValueHandlerMap;
    queryTags?: QueryTag[];
    searchText?: string;
    timezone?: string;
}
