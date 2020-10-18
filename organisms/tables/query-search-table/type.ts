import { DataTableFieldType } from '@/components/organisms/tables/data-table/PDataTable.toolset';
import { KeyItem, QueryItem, ValueHandlerMap } from '@/components/organisms/search/query-search/type';
import { QueryTag } from '@/components/organisms/search/query-search-tags/type';

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
    keyItems: KeyItem[];
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
    sortBy: string;
    sortDesc: boolean;
    thisPage: number;
    pageSize: number;
    queryTags: QueryTag[];
}

export interface QuerySearchTableFunctions {
    addTag(...queries: QueryItem[]): void;
    deleteTag(index: number): void;
    deleteAllTags(): void;
}

export interface QuerySearchTableListeners {
    init: (options: Readonly<Options>) => void|Promise<void>;
    change: (options: Readonly<Options>, changedOptions: Readonly<Options>) => void|Promise<void>;
    export: () => void|Promise<void>;
    select: (selectIndex: number[]) => void|Promise<void>;
}
