import { DisplayState } from '@/store/modules/display/type';
import { Getter } from 'vuex';
import { SIDEBAR_TYPE } from '@/store/modules/display/config';

export const hasUncheckedNotifications: Getter<DisplayState, any> = (state): boolean => state.uncheckedNotificationCount > 0;

export const isHandbookVisible: Getter<DisplayState, any> = (state): boolean => state.visibleSidebar && state.sidebarType === SIDEBAR_TYPE.handbook;
