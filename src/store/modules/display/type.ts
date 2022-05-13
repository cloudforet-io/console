import { SidebarType, Currency } from '@/store/modules/display/config';
import { Location } from 'vue-router';
import { Menu, MenuInfo } from '@/lib/menu/config';

export interface GNBMenu extends Menu, MenuInfo {
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
}

export interface SidebarProps {
    styleType: string;
    disableButton: boolean;
    size: string;
}
