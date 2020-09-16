export interface SetItemRequest {
    key: string;
    value: any;
    path?: string;
}

export type SettingItem = Record<string, any>;

export interface SettingsState {
    items: SettingItem;
}
