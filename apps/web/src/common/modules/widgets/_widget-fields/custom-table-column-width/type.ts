export type CustomColumnWidthItem = {
    fieldKey: string;
    width: number;
};

export interface CustomTableColumnWidthOptions {
    toggle?: boolean;
}

export interface CustomTableColumnWidthValue {
    widthInfos?: CustomColumnWidthItem[];
}
