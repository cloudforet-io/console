
export interface TableColumnWidthValue {
    minimumWidth: number;
    widthType: 'auto' | 'fixed';
    fixedWidth?: number;
}

export interface TableColumnWidthOptions {
    defaultMinimumWidth?: number;
    defaultFixedWidth?: number;
}
