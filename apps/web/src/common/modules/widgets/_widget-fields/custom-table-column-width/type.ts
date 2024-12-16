export type CustomColumnWidthItem = {
    fieldKey: string;
    width: number;
};

export interface CustomTableColumnWidthOptions {
    toggle?: boolean;
}

// export interface _CustomTableColumnWidthOptions {}

export interface CustomTableColumnWidthValue {
    widthInfos?: CustomColumnWidthItem[];
}
