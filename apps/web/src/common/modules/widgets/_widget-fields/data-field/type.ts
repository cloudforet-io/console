
export interface DataFieldOptions {
    multiSelectable?: boolean;
    allSelected?: boolean; // if true, all options are selected (use with multiSelectable(true))
}

export interface DataFieldValue {
    data?: string|string[];
}
