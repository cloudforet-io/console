import { KeyItemSet, QueryItem, ValueHandlerMap } from '@/inputs/search/query-search/type';
import { QueryTag } from '@/inputs/search/query-search-tags/type';
import { DataTableFieldType } from '@/data-display/tables/data-table/type';

export interface QuerySearchTableProps {
    fields: DataTableFieldType[];
    items: any[];
    loading: boolean;
    sortBy?: string; // sync
    sortDesc?: boolean; // sync
    selectIndex?: number[]; // sync
    thisPage?: number; // sync
    pageSize?: number; // sync
    totalCount: number;
    keyItemSets: KeyItemSet[];
    valueHandlerMap: ValueHandlerMap;
    queryTags?: QueryTag[]; // sync
    selectable: boolean;
    colCopy: boolean;
    multiSelect: boolean;
    excelVisible: boolean;
    rowCursorPointer: boolean;
    timezone: string;
    searchable: boolean;
}

export interface Options {
    sortBy?: string;
    sortDesc?: boolean;
    pageStart?: number;
    pageLimit?: number;
    queryTags?: QueryTag[];
}

export interface QuerySearchTableFunctions {
    addTag(...queries: QueryItem[]): void;
    deleteTag(index: number): void;
    deleteAllTags(): void;
}
