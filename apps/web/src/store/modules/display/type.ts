import type { RouteLocationRaw } from 'vue-router';

import type { SidebarType } from '@/store/modules/display/config';

import type { Menu } from '@/lib/menu/config';

export interface DisplayMenu extends Menu {
    show?: boolean;
    label: string;
    icon?: string;
    isNew?: boolean;
    isBeta?: boolean;
    to: RouteLocationRaw;
    subMenuList?: DisplayMenu[];
}

export interface DisplayState {
    visibleSidebar: boolean;
    sidebarType: SidebarType;
    isInitialized: boolean;
    isLoading: boolean;
    uncheckedNotificationCount: number;
    isSignInFailed: boolean;
    visibleMobileGuideModal: boolean;
}

export interface SidebarProps {
    styleType: string;
    disableButton: boolean;
    size: string;
    isFixedSize: boolean;
    disableScroll: boolean;
}
