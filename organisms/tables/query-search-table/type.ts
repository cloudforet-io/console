import { DataTableFieldType } from '@/components/organisms/tables/data-table/PDataTable.toolset';
import { KeyItem, ValueHandlerMap } from '@/components/organisms/search/query-search/type';
import { QueryTag, QueryTagConverter } from '@/components/organisms/search/query-search-tags/type';

export interface QuerySearchTableProps {
    fields: DataTableFieldType[];
    items: any[];
    loading: boolean;
    sortBy: string; // sync
    sortDesc: boolean; // sync
    selectIndex: number[]; // sync
    thisPage: number; // sync
    pageSize: number; // sync
    totalCount: number;
    keyItems: KeyItem[];
    valueHandlerMap: ValueHandlerMap;
    queryTags: QueryTag[]; // sync
    selectable: boolean;
    multiSelect: boolean;
    excelVisible: boolean;
    rowCursorPointer: boolean;
    converter: QueryTagConverter;
}

export interface Options {
    sortBy: string;
    sortDesc: boolean;
    thisPage: number;
    pageSize: number;
    queryTags: QueryTag[];
}

export interface QuerySearchTableListeners {
    change: (options: Readonly<Options>, changedOptions: Readonly<Options>) => void|Promise<void>;
    export: () => void|Promise<void>;
    select: (selectIndex: number[]) => void|Promise<void>;
}
