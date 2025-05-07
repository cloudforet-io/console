import type {
    FeatureConfigurator,
    FeatureRouteConfig,
    FeatureVersion,
    GeneratedMenuConfig,
    GeneratedRouteMetadata,
    GeneratedRouteMetadataConfig,
    GeneratedUiAffectConfig,
} from '@/lib/config/global-config/types/type';
import type { Menu } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';

import adminOpsFlowRoutes from '@/services/ops-flow/routes/admin/routes';
import opsFlowRoutes from '@/services/ops-flow/routes/routes';

class OpsFlowConfigurator implements FeatureConfigurator {
    private version: FeatureVersion = 'V1';

    private routeMetadata: GeneratedRouteMetadata = {};

    readonly uiAffect: GeneratedUiAffectConfig[] = [];

    initialize(version: FeatureVersion): void {
        this.version = version;
    }

    getRoutes(): FeatureRouteConfig {
        return {
            routes: opsFlowRoutes,
            adminRoutes: adminOpsFlowRoutes,
            version: this.version,
        };
    }

    getMenu(): GeneratedMenuConfig {
        const baseMenu: Menu = {
            id: MENU_ID.OPS_FLOW,
            needPermissionByRole: true,
            subMenuList: [],
            order: 7,
        };

        return {
            menu: {
                ...baseMenu,
                subMenuList: [
                    { id: MENU_ID.OPS_FLOW_LANDING, needPermissionByRole: true },
                    { id: MENU_ID.TASK_BOARD, needPermissionByRole: true },
                ],
            },
            adminMenu: {
                ...baseMenu,
                subMenuList: [
                    { id: MENU_ID.TASK_MANAGEMENT },
                ],
            },
            version: this.version,
        };
    }

    getRouteMetadata(): GeneratedRouteMetadataConfig {
        const versionedMetadata: GeneratedRouteMetadataConfig = {};

        Object.entries(this.routeMetadata).forEach(([routeKey, routeConfig]) => {
            const versionConfig = routeConfig[this.version];
            if (versionConfig) {
                versionedMetadata[routeKey] = {
                    name: versionConfig.name,
                    ...(versionConfig.params && { params: versionConfig.params }),
                };
            }
        });

        return versionedMetadata;
    }
}

export default new OpsFlowConfigurator();
