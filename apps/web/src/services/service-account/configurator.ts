import type {
    FeatureConfigurator,
    FeatureRouteConfig,
    FeatureVersion,
    GeneratedMenuConfig,
    GeneratedRouteMetadata,
    GeneratedUiAffectConfig,
} from '@/lib/config/global-config/types/type';
import { MENU_ID } from '@/lib/menu/config';

import adminServiceAccountRoute from '@/services/service-account/routes/admin/routes';
import serviceAccountRoute from '@/services/service-account/routes/routes';

class ServiceAccountConfigurator implements FeatureConfigurator {
    private version: FeatureVersion = 'V1';

    private routeMetadata: GeneratedRouteMetadata = {};

    readonly uiAffect: GeneratedUiAffectConfig[] = [];

    initialize(version: FeatureVersion): void {
        this.version = version;
    }

    getRoutes(): FeatureRouteConfig {
        return {
            routes: serviceAccountRoute,
            adminRoutes: adminServiceAccountRoute,
            version: this.version,
        };
    }

    getMenu(): GeneratedMenuConfig {
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

    getRouteMetadata(): GeneratedRouteMetadata {
        return this.routeMetadata;
    }
}

export default new ServiceAccountConfigurator();
