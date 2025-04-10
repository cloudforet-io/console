import { FEATURES } from '@/lib/config/global-config/constants/constants';
import { initialFeatureSchema } from '@/lib/config/global-config/schema/feature-schema';
import type { FeatureSchemaType, GlobalServiceConfig } from '@/lib/config/global-config/types/type';
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

        return this.schema;
    }

    private updateSchema(serviceName: string, version: string): void {
        if (!this.schema || !this.schema[serviceName]) return;

        this.schema[serviceName].currentVersion = version;

        if (serviceName === FEATURES.ALERT_MANAGER) {
            if (version === 'V2') {
                const iamFeatureSettings = this.schema[FEATURES.IAM].V1;
                iamFeatureSettings.menu[MENU_ID.USER_GROUP] = true;
                if (iamFeatureSettings.adminMenu) {
                    iamFeatureSettings.adminMenu[MENU_ID.USER_GROUP] = true;
                }
                this.updateUiAffects(FEATURES.PROJECT, 'V1', 'visibleAlertTabAtDetail', false);
                this.updateUiAffects(FEATURES.ASSET_INVENTORY, 'V1', 'visibleAlertTabAtDetail', false);
                this.updateUiAffects(FEATURES.COST_EXPLORER, 'V1', 'visibleBudgetNotification', true);
            }
        }
    }

    private updateUiAffects(featureKey: string, version: string, affectKey: string, value: boolean): void {
        const feature = this.schema[featureKey]?.[version];
        if (feature?.uiAffects?.[affectKey] !== undefined) {
            feature.uiAffects[affectKey] = value;
        }
    }
}

