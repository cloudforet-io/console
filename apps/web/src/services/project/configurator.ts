import type {
    FeatureConfigurator,
    FeatureRouteConfig,
    FeatureVersion,
    GeneratedMenuConfig,
    GeneratedRouteMetadata,
    GeneratedRouteMetadataConfig,
    GeneratedUiAffectConfig,
} from '@/lib/config/global-config/types/type';
import { MENU_ID } from '@/lib/menu/config';

import { PROJECT_ROUTE_V1 } from '@/services/project/v1/routes/route-constant';
import projectRoutesV1 from '@/services/project/v1/routes/routes';
import { PROJECT_ROUTE_V2 } from '@/services/project/v2/routes/route-constant';
import projectRoutes from '@/services/project/v2/routes/routes';

class ProjectConfigurator implements FeatureConfigurator {
    private version: FeatureVersion = 'V1';

    private routeMetadata: GeneratedRouteMetadata = {
        detail: {
            V1: {
                name: PROJECT_ROUTE_V1.DETAIL._NAME,
                params: {
                    id: 'id',
                },
            },
            V2: {
                name: PROJECT_ROUTE_V2._NAME,
                params: {
                    id: 'projectGroupOrProjectId',
                    dashboardId: 'dashboardId',
                },
            },
        },
        projectGroup: {
            V1: {
                name: PROJECT_ROUTE_V1._NAME,
                params: {
                    id: 'projectGroupId',
                },
            },
            V2: {
                name: PROJECT_ROUTE_V2._NAME,
                params: {
                    id: 'projectGroupOrProjectId',
                },
            },
        },
    };

    readonly uiAffect: GeneratedUiAffectConfig[] = [
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

    initialize(version: FeatureVersion): void {
        this.version = version;
    }

    getRoutes(): FeatureRouteConfig {
        return {
            routes: this.version === 'V1' ? projectRoutesV1 : projectRoutes,
            adminRoutes: null,
            version: this.version,
        };
    }

    getMenu(): GeneratedMenuConfig {
        return {
            version: this.version,
            menu: {
                id: MENU_ID.PROJECT,
                needPermissionByRole: true,
                subMenuList: [],
                order: 2,
            },
            adminMenu: null,
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

export default new ProjectConfigurator();
