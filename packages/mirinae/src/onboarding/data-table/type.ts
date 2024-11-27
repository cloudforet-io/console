import type { DATA_TABLE_CELL_TEXT_ALIGN, DATA_TABLE_STYLE_TYPE, DATA_TABLE_TYPE } from '@/onboarding/data-table/config';

export type DataTableCellTextAlign = typeof DATA_TABLE_CELL_TEXT_ALIGN[keyof typeof DATA_TABLE_CELL_TEXT_ALIGN];

export interface DataTableFieldType {
    name: string;
    label?: string;
    textAlign?:DataTableCellTextAlign;
    sortable?: boolean;
}

export type DataTableField = DataTableFieldType;

export type DataTableStyleType = typeof DATA_TABLE_STYLE_TYPE[keyof typeof DATA_TABLE_STYLE_TYPE];
export type DataTableType = typeof DATA_TABLE_TYPE[keyof typeof DATA_TABLE_TYPE];

export interface DataTableProps {
    loading?: boolean;
    fields: DataTableField[];
    items: any[];
    showFooter?: boolean;
    selectable?: boolean;
    selectIndex?: number[] | number;
    multiSelectable?: boolean;
    rowClickMultiSelectMode?: boolean;
    getRowSelectable?: (item: any, i: number) => boolean;
    styleType: DataTableStyleType;
    type: DataTableType;
    headerLeftSlot: boolean;
    headerRightSlot: boolean;
    columnLeftSlot: boolean;
    columnRightSlot: boolean;
}
