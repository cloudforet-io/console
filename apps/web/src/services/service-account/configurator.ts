import type {
    FeatureConfiguratorType, FeatureMenuConfig, FeatureRouteConfig, FeatureUiAffect,
} from '@/lib/config/global-config/types/type';
import { MENU_ID } from '@/lib/menu/config';

import adminServiceAccountRoute from '@/services/service-account/routes/admin/routes';
import serviceAccountRoute from '@/services/service-account/routes/routes';

class ServiceAccountConfigurator implements FeatureConfiguratorType {
    private version: 'V1' | 'V2' = 'V1';

    readonly uiAffect: FeatureUiAffect[] = [];

    initialize(version: 'V1' | 'V2'): void {
        this.version = version;
    }

    getRoutes(): FeatureRouteConfig {
        return {
            routes: serviceAccountRoute,
            adminRoutes: adminServiceAccountRoute,
            version: this.version,
        };
    }

    getMenu(): FeatureMenuConfig {
        return {
            menu: {
                id: MENU_ID.SERVICE_ACCOUNT,
                needPermissionByRole: true,
                subMenuList: [],
                order: 3,
            },
            version: this.version,
        };
    }
}

export default new ServiceAccountConfigurator();
