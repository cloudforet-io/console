export type OverlayStatus = 'LIST' | 'ADD' | 'CLONE' | 'EDIT';

export interface OptionItem {
    key: string;
    value: string;
    error?: boolean;
}
