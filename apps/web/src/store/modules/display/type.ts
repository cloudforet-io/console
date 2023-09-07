import type { TranslateResult } from 'vue-i18n';
import type { Location } from 'vue-router';

import type { SidebarType } from '@/store/modules/display/config';

import type { Menu } from '@/lib/menu/config';

export type HighlightTagType = 'new' | 'beta' | 'update';

export interface DisplayMenu extends Menu {
    show?: boolean;
    label: TranslateResult;
    icon?: string;
    highlightTag?: HighlightTagType;
    to: Location;
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
