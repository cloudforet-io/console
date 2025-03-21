import type { Menu } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import alertManagerRouteV1 from '@/services/alert-manager/v1/routes/routes';
import alertManagerRoute from '@/services/alert-manager/v2/routes/routes';
import type { schemaType } from '@/services/featureSchema';

class AlertManagerConfigurator {
    static getAdminRoutes() {
        return null;
    }

    static getWorkspaceRoutes(featureSchema: schemaType) {
        return featureSchema.version === 'V1' ? alertManagerRouteV1 : alertManagerRoute;
    }

    static getAdminMenu(): Menu|null {
        return null;
    }

    static getWorkspaceMenu(featureSchema: schemaType): Menu {
        const subMenuIds = Object.entries(featureSchema.menu || {})
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            .filter(([_, isEnabled]) => isEnabled)
            .map(([menuId]) => ({ id: MENU_INFO_MAP[menuId.toLowerCase()].menuId, needPermissionByRole: true }));

        return {
            id: MENU_INFO_MAP[featureSchema.id.toLowerCase()].menuId,
            needPermissionByRole: true,
            subMenuList: subMenuIds,
        };
    }
}

export default AlertManagerConfigurator;
