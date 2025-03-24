import { FEATURES } from '@/lib/config/global-config/constants';
import { initialFeatureSchema } from '@/lib/config/global-config/feature-schema';
import type { FeatureSchemaType, GlobalServiceConfig } from '@/lib/config/global-config/type';
import { MENU_ID } from '@/lib/menu/config';

export class FeatureSchemaManager {
    private serviceConfig: GlobalServiceConfig;

    private readonly schema: FeatureSchemaType;

    constructor(serviceConfig: GlobalServiceConfig) {
        this.serviceConfig = serviceConfig;
        this.schema = JSON.parse(JSON.stringify(initialFeatureSchema));
    }

    applyGlobalConfig(): FeatureSchemaType {
        Object.entries(this.serviceConfig).forEach(([serviceName, config]) => {
            if (config.ENABLED) {
                this.updateSchema(serviceName, config.VERSION);
            } else {
                delete this.schema[serviceName];
            }
        });

        return {
            ...this.schema,
            [FEATURES.COMMON]: {
                uiAffects: {
                    showAlert: true,
                },
            },
        };
    }

    private updateSchema(serviceName: string, version: string): void {
        if (!this.schema || !this.schema[serviceName]) return;

        this.schema[serviceName].currentVersion = version;

        if (serviceName === FEATURES.ALERT_MANAGER) {
            if (version === 'V2') {
                this.schema[FEATURES.IAM].V1.menu[MENU_ID.USER_GROUP] = true;
                this.schema[FEATURES.IAM].V1.adminMenu[MENU_ID.USER_GROUP] = true;
                if (this.schema[FEATURES.PROJECT].V1?.uiAffects) {
                    this.schema[FEATURES.PROJECT].V1.uiAffects.showAlert = false;
                }
                if (this.schema[FEATURES.ASSET_INVENTORY].V1?.uiAffects) {
                    this.schema[FEATURES.ASSET_INVENTORY].V1.uiAffects.showAlert = false;
                }
                if (this.schema[FEATURES.COMMON]?.uiAffects) {
                    this.schema[FEATURES.COMMON].uiAffects.showAlert = false;
                }
            }
        }
    }
}

