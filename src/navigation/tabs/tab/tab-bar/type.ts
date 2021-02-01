export interface TabBarSyncType {
    activeTab: string;
}

export interface TabItem {
    name: string;
    label?: string;
    keepAlive?: boolean;
    beta?: boolean;
}

export type TabsType = Array<string|TabItem>;

export interface TabBarStateType {
    tabs: TabsType;
}

export interface TabBarProps extends TabBarStateType, TabBarSyncType {}
