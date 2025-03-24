import { MENU_ID } from '@/lib/menu/config';

import type { ServiceConfigType } from '@/services/configurator';
import type { FeatureSchema } from '@/services/featureSchema';
import { FEATURES, initialFeatureSchema } from '@/services/featureSchema';

export class FeatureSchemaManager {
    private serviceConfig: ServiceConfigType;

    private readonly schema: FeatureSchema;

    constructor(serviceConfig: ServiceConfigType) {
        this.serviceConfig = serviceConfig;
        this.schema = JSON.parse(JSON.stringify(initialFeatureSchema));
    }

    applyGlobalConfig(): FeatureSchema {
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
                affectsUI: {
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
                this.schema.IAM.V1.menu[MENU_ID.USER_GROUP] = true;
                this.schema.IAM.V1.adminMenu[MENU_ID.USER_GROUP] = true;
                if (this.schema.PROJECT.V1?.affectsUI) {
                    this.schema.PROJECT.V1.affectsUI.showAlert = false;
                }
                if (this.schema.ASSET_INVENTORY.V1?.affectsUI) {
                    this.schema.ASSET_INVENTORY.V1.affectsUI.showAlert = false;
                }
                if (this.schema.COMMON?.affectsUI) {
                    this.schema.COMMON.affectsUI.showAlert = false;
                }
            }
        }
    }
}

