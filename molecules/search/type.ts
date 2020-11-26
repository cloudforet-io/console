export interface SearchProps {
    value: string; // sync
    placeholder?: string;
    focused?: boolean;
    disabled?: boolean;
    disableIcon?: boolean;
    isFocused?: boolean; // sync
}

export interface SearchEventArgs {
    input: [string, InputEvent];
    search: [string, KeyboardEvent];
    delete: [string]; // current value
}
