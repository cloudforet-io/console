import { SidebarType, Currency } from '@/store/modules/display/config';
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
}

export interface SidebarProps {
    styleType: string;
    disableButton: boolean;
    size: string;
}
