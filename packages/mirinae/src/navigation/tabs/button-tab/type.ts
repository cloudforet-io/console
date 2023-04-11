import type { TabItem } from '@/navigation/tabs/tab/type';

export interface ButtonTabProps {
    tabs: Array<string|TabItem>;
    activeTab: string;
}
