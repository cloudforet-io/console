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

// export interface _CustomTableColumnWidthOptions {}

export interface _CustomTableColumnWidthValue {
    widthInfos?: CustomColumnWidthItem[];
}
