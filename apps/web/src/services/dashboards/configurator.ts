import type { RouteConfig } from 'vue-router';

import type {
    FeatureConfiguratorType, FeatureMenuConfig, FeatureUiAffect, FeatureVersion,
} from '@/lib/config/global-config/types/type';
import type { Menu } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';

import adminDashboardsRoute from '@/services/dashboards/routes/admin/routes';
import dashboardsRoute from '@/services/dashboards/routes/routes';

class DashboardConfigurator implements FeatureConfiguratorType {
    private version: FeatureVersion = 'V1';

    readonly uiAffect: FeatureUiAffect[] = [];

    initialize(version: FeatureVersion): void {
        this.version = version;
    }

    // eslint-disable-next-line class-methods-use-this
    getRoutes(isAdmin?: boolean): RouteConfig | null {
        return isAdmin ? adminDashboardsRoute : dashboardsRoute;
    }

    getMenu(): FeatureMenuConfig {
        const baseMenu: Menu = {
            id: MENU_ID.DASHBOARDS,
            needPermissionByRole: true,
            subMenuList: [],
            order: 1,
        };

        return {
            menu: baseMenu,
            version: this.version,
        };
    }
}

export default new DashboardConfigurator();
