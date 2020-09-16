export interface SetItemRequest {
    page: string;
    key: string;
    value: any;
}

export type SettingItem = Record<string, any>;

export interface SettingsState {
    items: SettingItem;
}
