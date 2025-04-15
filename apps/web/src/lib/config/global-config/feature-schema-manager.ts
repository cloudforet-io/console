import { useGlobalConfigSchemaStore } from '@/store/global-config-schema/global-config-schema-store';

import { getFeatureConfigurator } from '@/lib/config/global-config/helpers/get-feature-configurator';
import type {
    GeneratedMenuSchema, GeneratedRouteMetadataSchema, GeneratedRouteSchema, GeneratedUiAffectSchema, GlobalServiceConfig,
} from '@/lib/config/global-config/types/type';

import adminAdvancedRoutes from '@/services/advanced/routes/admin/routes';
import adminInfoRoutes from '@/services/info/routes/admin/routes';
import infoRoutes from '@/services/info/routes/routes';
import adminWorkspaceHomeRoutes from '@/services/workspace-home/routes/admin/routes';
import workspaceHomeRoute from '@/services/workspace-home/routes/routes';

export class FeatureSchemaManager {
    private config: GlobalServiceConfig = {
        IAM: {
            ENABLED: true,
            VERSION: 'V1',
        },
    };

    initialize(config: GlobalServiceConfig) {
        this.config = {
            ...this.config,
            ...config,
        };
        this.createMenuSchema();
        this.createRouteSchema();
        this.createRouteMetadata();
        this.createUiAffectsSchema();
    }

    createMenuSchema() {
        const globalConfigSchemaStore = useGlobalConfigSchemaStore();
        const generatedMenuSchema = {} as GeneratedMenuSchema;

        Object.keys(this.config).forEach((feature) => {
            if (this.config[feature]?.ENABLED) {
                const configurator = getFeatureConfigurator(feature);
                if (configurator) {
                    const currentVersion = this.config[feature]?.VERSION || 'V1';
                    configurator.initialize(currentVersion);

                    const menuConfig = configurator.getMenu(this.config);

                    generatedMenuSchema[feature] = {
                        version: currentVersion,
                        menu: menuConfig.menu,
                        adminMenu: menuConfig?.adminMenu === null ? null : (menuConfig?.adminMenu || menuConfig?.menu),
                    };
                }
            }
        });

        globalConfigSchemaStore.setMenuSchema(generatedMenuSchema);
    }

    createRouteSchema() {
        const globalConfigSchemaStore = useGlobalConfigSchemaStore();

        const baseRoutes: GeneratedRouteSchema = {
            routes: [workspaceHomeRoute, infoRoutes],
            adminRoutes: [adminWorkspaceHomeRoutes, adminAdvancedRoutes, adminInfoRoutes],
        };

        Object.keys(this.config).forEach((feature) => {
            if (this.config[feature]?.ENABLED) {
                const configurator = getFeatureConfigurator(feature);
                if (configurator) {
                    const featureRoutes = configurator.getRoutes();
                    if (featureRoutes?.routes) {
                        baseRoutes.routes.push(featureRoutes.routes);
                    }
                    if (featureRoutes?.adminRoutes) {
                        baseRoutes.adminRoutes.push(featureRoutes.adminRoutes);
                    }
                }
            }
        });

        globalConfigSchemaStore.setRouteSchema(baseRoutes);
    }

    createRouteMetadata() {
        const globalConfigSchemaStore = useGlobalConfigSchemaStore();
        const routeMetadata = {} as GeneratedRouteMetadataSchema;

        Object.keys(this.config).forEach((feature) => {
            if (this.config[feature]?.ENABLED) {
                const configurator = getFeatureConfigurator(feature);
                if (configurator) {
                    const currentVersion = this.config[feature]?.VERSION || 'V1';
                    configurator.initialize(currentVersion);
                    routeMetadata[feature] = configurator.getRouteMetadata();
                }
            }
        });

        globalConfigSchemaStore.setRouteMetadataSchema(routeMetadata);
    }

    createUiAffectsSchema() {
        const globalConfigSchemaStore = useGlobalConfigSchemaStore();
        const schema = {} as GeneratedUiAffectSchema;

        const featureMethodMap: Record<string, Record<string, boolean>> = {};

        Object.keys(this.config).forEach((feature) => {
            if (this.config[feature]?.ENABLED) {
                const configurator = getFeatureConfigurator(feature);
                if (configurator) {
                    const currentVersion = this.config[feature]?.VERSION || 'V1';
                    configurator.initialize(currentVersion);

                    if (configurator.uiAffect) {
                        configurator.uiAffect.forEach((uiAffect) => {
                            const targetFeature = uiAffect.feature;
                            const targetVersion = targetFeature === feature
                                ? currentVersion
                                : (this.config[targetFeature]?.VERSION || 'V1');

                            if (!featureMethodMap[targetFeature]) {
                                featureMethodMap[targetFeature] = {};
                            }

                            uiAffect.affects.forEach((affect) => {
                                if (affect.version === targetVersion) {
                                    featureMethodMap[targetFeature][affect.method] = true;
                                }
                            });
                        });
                    }

                    schema[feature] = feature in featureMethodMap ? featureMethodMap[feature] : {};
                }
            }
        });

        globalConfigSchemaStore.setUiAffectsSchema(schema);
    }
}

export default new FeatureSchemaManager();
