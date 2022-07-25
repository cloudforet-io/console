import type { TranslateResult } from 'vue-i18n';
import type { Location } from 'vue-router';

import type { SidebarType, Currency } from '@/store/modules/display/config';

import type { Menu } from '@/lib/menu/config';

export interface GNBMenu extends Menu {
    label: TranslateResult;
    icon?: string;
    isNew?: boolean;
    isBeta?: boolean;
    to: Location;
    subMenuList?: GNBMenu[];
}

export type CurrencyRates = {
    [K in Currency]: number;
}

export interface DisplayState {
    visibleSidebar: boolean;
    sidebarType: SidebarType;
    isInitialized: boolean;
    isLoading: boolean;
    uncheckedNotificationCount: number;
    isSignInFailed: boolean;
    currency: Currency;
    currencyRates: CurrencyRates;
    visibleMobileGuideModal: boolean;
}

export interface SidebarProps {
    styleType: string;
    disableButton: boolean;
    size: string;
    disableScroll: boolean;
}
