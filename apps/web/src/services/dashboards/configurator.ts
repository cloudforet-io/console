import type {
    FeatureRouteConfig,
    FeatureVersion,
    GeneratedMenuConfig,
    GeneratedRouteMetadata,
    GeneratedUiAffectConfig,
} from '@/lib/config/global-config/types/type';
import type { Menu } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';

import adminDashboardsRoute from '@/services/dashboards/routes/admin/routes';
import dashboardsRoute from '@/services/dashboards/routes/routes';

class DashboardConfigurator {
    private version: FeatureVersion = 'V1';

    private routeMetadata: GeneratedRouteMetadata = {};

    readonly uiAffect: GeneratedUiAffectConfig[] = [];

    initialize(version: FeatureVersion): void {
        this.version = version;
    }

    getRoutes(): FeatureRouteConfig {
        return {
            routes: dashboardsRoute,
            adminRoutes: adminDashboardsRoute,
            version: this.version,
        };
    }

    getMenu(): GeneratedMenuConfig {
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

    getRouteMetadata(): GeneratedRouteMetadata {
        return this.routeMetadata;
    }
}

export default new DashboardConfigurator();
