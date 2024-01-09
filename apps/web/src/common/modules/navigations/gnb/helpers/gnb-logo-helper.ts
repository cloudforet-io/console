import { WORKSPACE_LOGO_ICON_THEMES } from '@/common/modules/navigations/gnb/constants/constant';
import type { GNBLogoIconTheme } from '@/common/modules/navigations/gnb/types/type';

export const getRandomWorkspaceIconTheme = (): GNBLogoIconTheme => {
    const randomIndex = Math.floor(Math.random() * WORKSPACE_LOGO_ICON_THEMES.length);
    return WORKSPACE_LOGO_ICON_THEMES[randomIndex];
};
