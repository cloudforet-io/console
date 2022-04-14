import { CURRENCY, SIDEBAR_TYPE } from '@/store/modules/display/config';
import { Location } from 'vue-router';

export interface Menu {
    id: string;
    label: string;
    sub_menu?: Menu[];
    optional?: boolean;
}

export interface GNBMenu extends Menu {
    subMenuList?: GNBMenu[];
    to: Location;
    show?: boolean;
    isNew?: boolean;
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
    menuList: Menu[];
}

export type CurrencyRates = {
    [K in CURRENCY]: number;
}

export interface SidebarProps {
    styleType: string;
    disableButton: boolean;
    size: string;
}
