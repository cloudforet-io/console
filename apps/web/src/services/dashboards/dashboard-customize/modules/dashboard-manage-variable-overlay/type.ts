export type OverlayStatus = 'LIST' | 'ADD' | 'CLONE' | 'EDIT';

export interface OptionItem {
    _key: string;
    key: string;
    label: string;
    error?: boolean;
}
