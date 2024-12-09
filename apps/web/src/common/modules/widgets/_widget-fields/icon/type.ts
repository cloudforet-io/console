export interface Icon {
    name: string;
    label: string;
}
// Field Value Options
export interface IconValue {
    icon: Icon;
    color: string;
}

export interface IconOptions {
    default?: string; // e.g. 'ic_coin-filled'
    toggle?: boolean;
}

export interface _IconValue {
    toggleValue: boolean;
    icon?: Icon;
    color?: string;
}
