export type CustomColumnWidthItem = {
    fieldKey: string;
    width: number;
};

export interface CustomTableColumnWidthValue {
    toggleValue: boolean;
    value?: CustomColumnWidthItem[];
}

export interface CustomTableColumnWidthOptions {
    toggle?: boolean;
}
