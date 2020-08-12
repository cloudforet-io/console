import { DataTableField } from '@/components/organisms/tables/data-table/PDataTable.toolset';

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
