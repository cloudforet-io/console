export interface SearchProps {
    value: string; // sync
    placeholder?: string;
    disableIcon?: boolean;
    invalid?: boolean;
    disabled?: boolean;
    isFocused?: boolean; // sync
}

export interface InputListeners {
    input: Function;
    blur: Function;
    focus: Function;
    keyup: Function;
}
