export interface DataTableEventListeners {
    select?: (selectIndex: number[]) => void|Promise<void>;
    rowLeftClick?: (item: any, index: number, event: MouseEvent) => void|Promise<void>;
    rowRightClick?: (item: any, index: number, event: MouseEvent) => void|Promise<void>;
    rowMiddleClick?: (item: any, index: number, event: MouseEvent) => void|Promise<void>;
    rowMouseOver?: (item: any, index: number, event: MouseEvent) => void|Promise<void>;
    rowMouseOut?: (item: any, index: number, event: MouseEvent) => void|Promise<void>;
    theadClick?: (field: DataTableField, index: number, event: MouseEvent) => void|Promise<void>;
    changeSort?: (sortBy: string, sortDesc: boolean) => void|Promise<void>;
    'update:selectIndex'?: (selectIndex: number[]) => void|Promise<void>;
    'update:sortBy'?: (sortBy: string) => void|Promise<void>;
    'update:sortDesc'?: (sortDesc: boolean) => void|Promise<void>;
}

interface DataTableFieldType {
    name: string;
    label?: string;
    sortable?: boolean;
    sortKey?: string;
    width?: string;
}
export type DataTableField = string | DataTableFieldType

export interface PDataTableProps {
    loading: boolean;
    fields: any[] | Readonly<any[]>;
    items: any[];
    sortable?: boolean;
    sortBy?: string;
    sortDesc?: boolean;
    colCopy?: boolean;
    selectable?: boolean;
    selectIndex?: number[] | number;
    multiSelect?: boolean;
    rowClickMultiSelectMode?: boolean;
    useCursorLoading?: boolean;
    skeletonRows?: number;
    tableStyleType?: string;
    striped?: boolean;
    bordered?: boolean|null|unknown;
    hover?: boolean;
    width?: string;
    rowHeightFixed?: boolean;
    rowCursorPointer?: boolean;
}
