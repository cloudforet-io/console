export interface SearchProps {
    value: string; // sync
    placeholder?: string;
    disableIcon?: boolean;
    isFocused?: boolean; // sync
    invalid?: boolean;
}

export interface InputListeners {
    input: Function;
    blur: Function;
    focus: Function;
    keyup: Function;
}
