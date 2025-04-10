import type { FeatureVersionSettingsType } from '@/lib/config/global-config/types/type';
import type { Menu } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import { useGnbStore } from '@/common/modules/navigations/stores/gnb-store';

import alertManagerRouteV1 from '@/services/alert-manager/v1/routes/routes';
import alertManagerRoute from '@/services/alert-manager/v2/routes/routes';
import { useMyPageStore } from '@/services/my-page/stores/my-page-store';

class AlertManagerConfigurator {
    static getAdminRoutes() {
        return null;
    }

    static getWorkspaceRoutes(version: string) {
        return version === 'V1' ? alertManagerRouteV1 : alertManagerRoute;
    }

    static getAdminMenu(): Menu|null {
        return null;
    }

    static getWorkspaceMenu(settings: FeatureVersionSettingsType): Menu {
        const menu = settings.menu;
        const subMenuIds = Object.keys(menu).filter((menuId) => (menu)[menuId])
            .map((menuId) => ({
                id: MENU_INFO_MAP[menuId].menuId,
                needPermissionByRole: true,
            }));
        return {
            id: MENU_ID.ALERT_MANAGER,
            needPermissionByRole: true,
            subMenuList: subMenuIds,
        };
    }

    static applyUiAffects(settings: FeatureVersionSettingsType): void|null {
        const gnbStore = useGnbStore();
        const myPageStore = useMyPageStore();

        gnbStore.setVisibleAlertIcon(settings.uiAffects?.visibleAlertIcon);
        myPageStore.setVisibleUserNotification(settings.uiAffects?.visibleUserNotification);
    }
}

export default AlertManagerConfigurator;
