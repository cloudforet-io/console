import { GridLayoutProps } from '@/components/molecules/layouts/grid-layout/type';
import { KeyItemSet, ValueHandlerMap } from '@/components/organisms/search/query-search/type';
import { QueryTag } from '@/components/organisms/search/query-search-tags/type';


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
