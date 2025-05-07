import type { ComputedRef } from 'vue';

import type { SIDEBAR_TYPE, CURRENCY, CURRENCY_SYMBOL } from '@/store/display/constant';


export type SidebarType = typeof SIDEBAR_TYPE[keyof typeof SIDEBAR_TYPE];
export type Currency = typeof CURRENCY[keyof typeof CURRENCY];
export type CurrencySymbol = typeof CURRENCY_SYMBOL[keyof typeof CURRENCY_SYMBOL];


export interface DisplayStoreState {
    visibleSidebar: boolean;
    sidebarType: SidebarType;
    isInitialized: boolean;
    uncheckedNotificationCount?: number;
    uncheckedNoticeCount: number,
    isSignInFailed: boolean;
    signInFailedMessage: string;
    visibleMobileGuideModal: boolean;
    gnbNotificationLastReadTime: string;
}

export interface DisplayStoreGetters {
    hasUncheckedNotifications: ComputedRef<boolean>;
    isHandbookVisible: ComputedRef<boolean>;
    sidebarProps: ComputedRef<Partial<SidebarProps>>;
}

export interface SidebarProps {
    styleType: string;
    disableButton: boolean;
    size: string;
    isFixedSize: boolean;
    disableScroll: boolean;
}
