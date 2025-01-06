export type CustomColumnWidthItem = {
    fieldKey: string;
    width: number;
};

export interface CustomTableColumnWidthValue {
    widthInfos?: CustomColumnWidthItem[];
}
