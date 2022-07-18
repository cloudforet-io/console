import type { TabItem } from '@/navigation/tabs/tab/type';

export interface BalloonTabProps {
    tabs: Array<string|TabItem>;
    activeTab: string;
    //
    tail?: boolean;
    styleType?: string;
    size?: string;
    position?: string;
    stretch?: boolean;
}
