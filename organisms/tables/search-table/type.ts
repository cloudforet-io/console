import { DataTableFieldType } from '@/components/organisms/tables/data-table/PDataTable.toolset';

export interface SearchTableProps {
    fields: DataTableFieldType[];
    items: any[];
    loading: boolean;
    sortBy: string; // sync
    sortDesc: boolean; // sync
    selectIndex: number[]; // sync
    thisPage: number; // sync
    pageSize: number; // sync
    totalCount: number;
    searchText: string; // sync
    selectable: boolean;
    multiSelect: boolean;
    excelVisible: boolean;
}

export interface Options {
    sortBy: string;
    sortDesc: boolean;
    thisPage: number;
    pageSize: number;
    searchText: string;
}

export interface SearchTableListeners {
    init?: (options: Readonly<Options>) => void|Promise<void>;
    change?: (options: Readonly<Options>, changedOptions: Readonly<Options>) => void|Promise<void>;
    export?: () => void|Promise<void>;
    select?: (selectIndex: number[]) => void|Promise<void>;
}
