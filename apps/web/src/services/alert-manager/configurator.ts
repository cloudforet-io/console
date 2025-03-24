import type { Menu } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import alertManagerRouteV1 from '@/services/alert-manager/v1/routes/routes';
import alertManagerRoute from '@/services/alert-manager/v2/routes/routes';
import type { versionSchemaType } from '@/services/featureSchema';

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

    static getWorkspaceMenu(versionSchema: versionSchemaType): Menu {
        const menu = versionSchema.menu;
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
}

export default AlertManagerConfigurator;
