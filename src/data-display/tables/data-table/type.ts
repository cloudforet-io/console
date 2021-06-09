export interface DataTableEventListeners {
    select?: (selectIndex: number[]) => void|Promise<void>;
    rowLeftClick?: (item: any, index: number, event: MouseEvent) => void|Promise<void>;
    changeSort?: (sortBy: string, sortDesc: boolean) => void|Promise<void>;
    'update:selectIndex'?: (selectIndex: number[]) => void|Promise<void>;
    'update:sortBy'?: (sortBy: string) => void|Promise<void>;
    'update:sortDesc'?: (sortDesc: boolean) => void|Promise<void>;
}

export interface DataTableFieldType {
    name: string;
    label?: string;
    sortable?: boolean;
    sortKey?: string;
    width?: string;
}
export type DataTableField = string | DataTableFieldType
