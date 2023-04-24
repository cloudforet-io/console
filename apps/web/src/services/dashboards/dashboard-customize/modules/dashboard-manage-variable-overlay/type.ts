export type OverlayStatus = 'LIST' | 'ADD' | 'CLONE' | 'EDIT';

export interface OptionItem {
    // For drag-item-key, it was named `key` before.
    // As MANUAL option got `key` property, this changed to `draggableItemKey`.
    draggableItemId: string;
    key: string;
    label: string;
    error?: boolean;
}
