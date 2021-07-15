import { DisplayState } from '@/store/modules/display/type';
import { Getter } from 'vuex';

export const hasUncheckedNotifications: Getter<DisplayState, any> = (state): boolean => state.uncheckedNotificationCount > 0;
