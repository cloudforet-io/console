import type {
    FeatureConfiguratorType, FeatureMenuConfig, FeatureRouteConfig, FeatureUiAffect,
} from '@/lib/config/global-config/types/type';
import { MENU_ID } from '@/lib/menu/config';

import projectRoutesV1 from '@/services/project/v1/routes/routes';
import projectRoutes from '@/services/project/v2/routes/routes';

class ProjectConfigurator implements FeatureConfiguratorType {
    private version: 'V1' | 'V2' = 'V1';

    readonly uiAffect: FeatureUiAffect[] = [
        {
            feature: 'ALERT_MANAGER',
            affects: [
                {
                    method: 'visibleProjectAlertTab',
                    version: 'V1',
                },
            ],
        },
    ];

    initialize(version: 'V1' | 'V2'): void {
        this.version = version;
    }

    getRoutes(): FeatureRouteConfig {
        return {
            routes: this.version === 'V1' ? projectRoutesV1 : projectRoutes,
            adminRoutes: null,
            version: this.version,
        };
    }

    getMenu(): FeatureMenuConfig {
        return {
            menu: {
                id: MENU_ID.PROJECT,
                needPermissionByRole: true,
                subMenuList: [],
                order: 2,
            },
            adminMenu: null,
            version: this.version,
        };
    }
}

export default new ProjectConfigurator();
