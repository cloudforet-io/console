export interface SearchProps {
    value: string; // sync
    placeholder?: string;
    disableIcon?: boolean;
    invalid?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    isFocused?: boolean; // sync
}

export interface InputListeners {
    input: any;
    blur: any;
    focus: any;
    keyup: any;
}
