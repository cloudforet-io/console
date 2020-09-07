export class DictItem {
    private static count = 0;

    key: string | number;

    value: string | number;

    constructor(key?: string | number, value?: string | number) {
        this.key = key || '';
        this.value = value || '';
        DictItem.count += 1;
    }
}

interface InvalidMessage { [idx: number]: { key: string; value: string } }

export interface DictInputGroupProps {
    items: DictItem[]; // sync
    disabled: boolean;
    showEmptyInput: boolean;
    showValidation: boolean;
    invalidMessages: InvalidMessage;
}
