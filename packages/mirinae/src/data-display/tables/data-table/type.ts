import type { DATA_TABLE_CELL_TEXT_ALIGN, DATA_TABLE_STYLE_TYPE } from '@/data-display/tables/data-table/config';

export interface DataTableEventListeners {
    select?: (selectIndex: number[]) => void|Promise<void>;
    rowLeftClick?: (item: any, index: number, event: MouseEvent) => void|Promise<void>;
    changeSort?: (sortBy: string, sortDesc: boolean) => void|Promise<void>;
    'update:selectIndex'?: (selectIndex: number[]) => void|Promise<void>;
    'update:sortBy'?: (sortBy: string) => void|Promise<void>;
    'update:sortDesc'?: (sortDesc: boolean) => void|Promise<void>;
}

export type DataTableCellTextAlign = typeof DATA_TABLE_CELL_TEXT_ALIGN[keyof typeof DATA_TABLE_CELL_TEXT_ALIGN];

export interface DataTableFieldType {
    name: string;
    label?: string;
    sortable?: boolean;
    sortKey?: string;
    disableCopy?: boolean;
    width?: string;
    textAlign?: DataTableCellTextAlign;
    children?: DataTableFieldType[];
    invisible?: boolean;
}
export type DataTableField = string | DataTableFieldType;

export type DataTableStyleType = typeof DATA_TABLE_STYLE_TYPE[keyof typeof DATA_TABLE_STYLE_TYPE];

export interface DataTableProps {
    loading?: boolean;
    fields: DataTableField[];
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
    tableStyleType?: DataTableStyleType;
    tableCustomStyle?: {[key: string]: string};
    striped?: boolean;
    bordered?: boolean|null|unknown;
    disableHover?: boolean;
    rowHeightFixed?: boolean;
    rowCursorPointer?: boolean;
    invalid?: boolean;
    getRowClassNames?: (item?: any, i?: number) => Record<string, boolean>;
    getRowSelectable?: (item: any, i: number) => boolean;
    beautifyText?: boolean;
}
