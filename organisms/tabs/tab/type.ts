export interface TabItem {
    name: string;
    label?: string;
    keepAlive?: boolean;
}

type TabsType = Array<string|TabItem>;

interface TabStateType {
    tabs: TabsType;
}
interface TabSyncType {
    activeTab: string;
}

export interface TabProps extends TabStateType, TabSyncType {}
