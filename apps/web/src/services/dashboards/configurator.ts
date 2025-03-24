import type { Menu } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';

import adminDashboardsRoute from '@/services/dashboards/routes/admin/routes';
import dashboardsRoute from '@/services/dashboards/routes/routes';

class DashboardConfigurator {
    static getAdminRoutes() {
        return adminDashboardsRoute;
    }

    static getWorkspaceRoutes() {
        return dashboardsRoute;
    }

    static getAdminMenu(): Menu {
        return {
            id: MENU_ID.DASHBOARDS,
        };
    }

    static getWorkspaceMenu(): Menu {
        return {
            id: MENU_ID.DASHBOARDS,
            needPermissionByRole: true,
        };
    }
}

export default DashboardConfigurator;
