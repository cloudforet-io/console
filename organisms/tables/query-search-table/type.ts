import { DataTableFieldType } from '@/components/organisms/tables/data-table/PDataTable.toolset';
import { KeyItem, ValueHandlerMap } from '@/components/organisms/search/query-search/type';
import { QueryTag } from '@/components/organisms/search/query-search-tags/PQuerySearchTags.toolset';

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
    queryTags: QueryTag[];
}

export interface Options {
    sortBy: string;
    sortDesc: boolean;
    thisPage: number;
    pageSize: number;
    queryTags: QueryTag[];
}

export interface QuerySearchTableListeners {
    // rowLeftClick?: (rowData: any, index: number, event: MouseEvent) => void;
    // rowRightClick?: (rowData: any, index: number, event: MouseEvent) => void;
    // rowMiddleClick?: (rowData: any, index: number, event: MouseEvent) => void;
    // rowMouseOver?: (rowData: any, index: number, event: MouseEvent) => void;
    // rowMouseOut?: (rowData: any, index: number, event: MouseEvent) => void;
    // changeSort?: (sortBy: string, sortDesc: boolean) => void;
    // theadClick?: (field: DataTableFieldType, index: number, event: MouseEvent) => void;
    // changePageSize?: (pageSize: number) => void;
    // changePageNumber?: (pageNumber: number) => void;
    // clickExcel?: (event: MouseEvent) => void;
    // clickSetting?: (event: MouseEvent) => void;
    // clickRefresh?: (event: MouseEvent) => void;
    // select?: (selectIndex: number[]) => void;
    change?: (options: Options) => void|Promise<void>;
    export?: () => void|Promise<void>;
    select?: (selectIndex: number[]) => void|Promise<void>;
}
