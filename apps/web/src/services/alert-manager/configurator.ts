import type { Menu } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';

import alertManagerRouteV1 from '@/services/alert-manager/v1/routes/routes';
import alertManagerRoute from '@/services/alert-manager/v2/routes/routes';

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

    static getWorkspaceMenu(version: string): Menu {
        return {
            id: MENU_ID.ALERT_MANAGER,
            needPermissionByRole: true,
            subMenuList: version === 'V1' ? [
                { id: MENU_ID.ALERT_MANAGER_DASHBOARD, needPermissionByRole: true },
                { id: MENU_ID.ALERTS, needPermissionByRole: true },
                { id: MENU_ID.ESCALATION_POLICY, needPermissionByRole: true },
            ] : [
                { id: MENU_ID.SERVICE, needPermissionByRole: true },
                { id: MENU_ID.ALERTS, needPermissionByRole: true },
            ],
        };
    }
}

export default AlertManagerConfigurator;
