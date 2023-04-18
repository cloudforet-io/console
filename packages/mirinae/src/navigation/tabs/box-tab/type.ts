import type { TabItem } from '@/navigation/tabs/tab/type';

export interface BoxTabProps {
    tabs: Array<string|TabItem>;
    activeTab: string;
    styleType?: string;
}
