export interface DictItem {
    key: string | number;
    value: string | number | boolean;
}

export interface InvalidMessage { [idx: number]: { key: string; value: string } }

export interface DictInputGroupProps {
    dict: object;
    disabled: boolean;
    showEmptyInput: boolean;
    showValidation: boolean;
    focused: boolean;
}
