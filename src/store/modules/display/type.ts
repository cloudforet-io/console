import { SIDEBAR_TYPE } from '@/store/modules/display/config';

export interface DisplayState {
    visibleSidebar: boolean;
    sidebarType: SIDEBAR_TYPE;
    isInitialized: boolean;
    isDownloaded: boolean;
}
