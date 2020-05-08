export interface MenuItem {
    name: string;
    label: string;
    type: 'divider'|'header'|'item';
    disabled?: boolean;
}
