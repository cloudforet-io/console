import type { ComputedRef } from 'vue';
import type { TranslateResult } from 'vue-i18n';
import type { Location } from 'vue-router';

import type { SIDEBAR_TYPE, CURRENCY, CURRENCY_SYMBOL } from '@/store/display/constant';

import type { Menu } from '@/lib/menu/config';


export type SidebarType = typeof SIDEBAR_TYPE[keyof typeof SIDEBAR_TYPE];
export type HighlightTagType = 'new' | 'beta' | 'update';
export type Currency = typeof CURRENCY[keyof typeof CURRENCY];
export type CurrencySymbol = typeof CURRENCY_SYMBOL[keyof typeof CURRENCY_SYMBOL];

export interface DisplayMenu extends Menu {
    show?: boolean;
    label: TranslateResult;
    icon?: string;
    highlightTag?: HighlightTagType;
    to: Location;
    subMenuList?: DisplayMenu[];
    href?: string;
}

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
