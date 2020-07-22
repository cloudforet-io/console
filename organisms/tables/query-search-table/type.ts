import { DataTableFieldType } from '@/components/organisms/tables/data-table/PDataTable.toolset';

export interface QuerySearchTableListeners {
    rowLeftClick?: (rowData: any, index: number, event: MouseEvent) => void;
    rowRightClick?: (rowData: any, index: number, event: MouseEvent) => void;
    rowMiddleClick?: (rowData: any, index: number, event: MouseEvent) => void;
    rowMouseOver?: (rowData: any, index: number, event: MouseEvent) => void;
    rowMouseOut?: (rowData: any, index: number, event: MouseEvent) => void;
    changeSort?: (sortBy: string, sortDesc: boolean) => void;
    theadClick?: (field: DataTableFieldType, index: number, event: MouseEvent) => void;
    changePageSize?: (pageSize: number) => void;
    changePageNumber?: (pageNumber: number) => void;
    clickExcel?: (event: MouseEvent) => void;
    clickSetting?: (event: MouseEvent) => void;
    clickRefresh?: (event: MouseEvent) => void;
    select?: (selectIndex: number[]) => void;
}
