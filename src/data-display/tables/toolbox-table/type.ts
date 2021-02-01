export interface PToolboxTableProps {
    // PDataTableProps
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
    //
    paginationVisible?: boolean;
    pageSizeVisible?: boolean;
    settingVisible?: boolean;
    refreshVisible?: boolean;
    excelVisible?: boolean;
    pageSize?: number;
    allPage?: number;
    thisPage?: number;
    pageNationValues?: number[];
}
