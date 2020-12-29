export interface SearchProps {
    value: string; // sync
    placeholder?: string;
    focused?: boolean;
    disabled?: boolean;
    disableIcon?: boolean;
    isFocused?: boolean; // sync
}

export interface InputListeners {
    input: Function;
    blur: Function;
    focus: Function;
    keyup: Function;
}

export interface SearchSlotScope extends SearchProps {
    inputListeners: InputListeners;
}

export interface SearchEventArgs {
    input: [string, InputEvent];
    search: [string, KeyboardEvent];
    delete: [string]; // current value
}
