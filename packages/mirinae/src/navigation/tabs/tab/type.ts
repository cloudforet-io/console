export interface TabItem {
    name: string;
    label?: string;
    keepAlive?: boolean;
}

export interface TabProps {
    activeTab: string;
    tabs: Array<string|TabItem>;
    stretch?: boolean;
}
