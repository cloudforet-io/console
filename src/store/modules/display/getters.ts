import { DisplayState, SidebarProps } from '@/store/modules/display/type';
import { Getter } from 'vuex';
import { CURRENCY_SYMBOL, SIDEBAR_TYPE } from '@/store/modules/display/config';

export const hasUncheckedNotifications: Getter<DisplayState, any> = (state): boolean => state.uncheckedNotificationCount > 0;

export const isHandbookVisible: Getter<DisplayState, any> = (state): boolean => state.visibleSidebar && state.sidebarType === SIDEBAR_TYPE.handbook;

export const currencySymbol: Getter<DisplayState, any> = (state): string => CURRENCY_SYMBOL[state.currency] ?? '$';

export const sidebarProps: Getter<DisplayState, any> = (state): Partial<SidebarProps> => {
    if (state.sidebarType === SIDEBAR_TYPE.info) return { styleType: 'primary', disableButton: false, size: 'md' };
    if (state.sidebarType === SIDEBAR_TYPE.handbook) return { styleType: 'secondary', disableButton: false, size: 'md ' };
    if (state.sidebarType === SIDEBAR_TYPE.widget) return { styleType: 'primary', disableButton: true, size: 'sm' };
    return { styleType: 'primary', disableButton: false, size: 'md' };
};
