import type { QueryTag } from '@/inputs/search/query-search-tags/type';
import type { KeyItemSet, ValueHandlerMap } from '@/inputs/search/query-search/type';
import type { GridLayoutProps } from '@/others/deprecated/grid-layout/type';


export interface SearchGridLayoutProps extends GridLayoutProps {
    items: any[];
    totalCount: number;
    paginationValues?: number[];
    pageSize: number;
    thisPage: number;
    cardMinWidth?: string;
    cardHeight?: string;
    loading: boolean;
    keyItemSets: KeyItemSet[];
    valueHandlerMap: ValueHandlerMap;
    queryTags?: QueryTag[];
}

export interface Options {
    sortBy: string;
    sortDesc: boolean;
    thisPage: number;
    pageSize: number;
    queryTags: QueryTag[];
}
