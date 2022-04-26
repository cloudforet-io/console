import { CURRENCY, SIDEBAR_TYPE } from '@/store/modules/display/config';
import { Location } from 'vue-router';
import { Menu } from '@/lib/menu/config';

export interface GNBMenu extends Menu {
    label: string;
    to: Location;
    icon?: string;
    subMenuList?: GNBMenu[];
    isNew?: boolean;
    isBeta?: boolean;
}

export interface DisplayState {
    visibleSidebar: boolean;
    sidebarType: SIDEBAR_TYPE;
    isInitialized: boolean;
    isLoading: boolean;
    uncheckedNotificationCount: number;
    isSignInFailed: boolean;
    currency: CURRENCY;
    currencyRates: CurrencyRates;
}

export type CurrencyRates = {
    [K in CURRENCY]: number;
}

export interface SidebarProps {
    styleType: string;
    disableButton: boolean;
    size: string;
}
