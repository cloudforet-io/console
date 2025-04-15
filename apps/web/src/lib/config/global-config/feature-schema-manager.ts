import { useGlobalConfigStore } from '@/store/global-config/global-config-store';

import { getFeatureConfigurator } from '@/lib/config/global-config/helpers/get-feature-configurator';
import type {
    GeneratedMenuSchema, GeneratedRouteMetadataSchema, GeneratedUiAffectSchema, GlobalServiceConfig,
} from '@/lib/config/global-config/types/type';

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
        this.createUiAffectsSchema();
        this.createRouteMetadata();
    }

    createMenuSchema() {
        const globalConfigStore = useGlobalConfigStore();
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

        globalConfigStore.setMenuSchema(generatedMenuSchema);
    }

    createUiAffectsSchema() {
        const globalConfigStore = useGlobalConfigStore();
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

        globalConfigStore.setUiAffectsSchema(schema);
    }

    createRouteMetadata(): void {
        const globalConfigStore = useGlobalConfigStore();
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

        globalConfigStore.setRouteMetadataSchema(routeMetadata);
    }
}

export default new FeatureSchemaManager();
