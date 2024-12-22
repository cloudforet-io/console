export interface Icon {
    name: string;
    label: string;
}

export interface IconOptions {
    default?: string; // e.g. 'ic_coin-filled'
    toggle?: boolean;
}

export interface IconValue {
    toggleValue: boolean;
    icon?: Icon;
    color?: string;
}
