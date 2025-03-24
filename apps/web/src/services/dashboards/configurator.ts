import type { Menu } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import adminDashboardsRoute from '@/services/dashboards/routes/admin/routes';
import dashboardsRoute from '@/services/dashboards/routes/routes';
import type { versionSchemaType } from '@/services/featureSchema';

class DashboardConfigurator {
    static getAdminRoutes() {
        return adminDashboardsRoute;
    }

    static getWorkspaceRoutes() {
        return dashboardsRoute;
    }

    static getAdminMenu(versionSchema: versionSchemaType): Menu {
        const menuId = Object.keys(versionSchema.adminMenu || versionSchema.menu)[0];
        return { id: MENU_INFO_MAP[menuId].menuId };
    }

    static getWorkspaceMenu(versionSchema: versionSchemaType): Menu {
        const menuId = Object.keys(versionSchema.menu)[0];
        return { id: MENU_INFO_MAP[menuId].menuId, needPermissionByRole: true };
    }
}

export default DashboardConfigurator;
