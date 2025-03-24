import type { FeatureVersionSettingsType } from '@/lib/config/global-config/type';
import type { Menu } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import adminDashboardsRoute from '@/services/dashboards/routes/admin/routes';
import dashboardsRoute from '@/services/dashboards/routes/routes';

class DashboardConfigurator {
    static getAdminRoutes() {
        return adminDashboardsRoute;
    }

    static getWorkspaceRoutes() {
        return dashboardsRoute;
    }

    static getAdminMenu(settings: FeatureVersionSettingsType): Menu {
        const menuId = Object.keys(settings.adminMenu || settings.menu)[0];
        return { id: MENU_INFO_MAP[menuId].menuId };
    }

    static getWorkspaceMenu(settings: FeatureVersionSettingsType): Menu {
        const menuId = Object.keys(settings.menu)[0];
        return { id: MENU_INFO_MAP[menuId].menuId, needPermissionByRole: true };
    }
}

export default DashboardConfigurator;
