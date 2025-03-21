import type { ServiceConfigType } from '@/services/configurator';
import type { FeatureSchema } from '@/services/featureSchema';
import { initialFeatureSchema } from '@/services/featureSchema';


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

        return this.schema;
    }

    private updateSchema(serviceName: string, version: string): void {
        if (!this.schema) return;

        if (this.schema[serviceName]) {
            this.schema[serviceName].version = version;
        }

        if (serviceName === 'ALERT_MANAGER') {
            this.schema.ALERT_MANAGER.menu = {
                ALERT_MANAGER_DASHBOARD: version === 'V1',
                SERVICE: version === 'V2',
                ALERTS: true,
                ESCALATION_POLICY: version === 'V1',
            };

            if (version === 'V2') {
                if (this.schema.IAM?.menu) {
                    this.schema.IAM.menu.USER_GROUP = true;
                }

                if (this.schema.PROJECT?.affectsUI) {
                    this.schema.PROJECT.affectsUI.AlertTab = false;
                }

                if (this.schema.COMMON?.affectsUI) {
                    this.schema.COMMON.affectsUI.topBarAlertIcon = false;
                }
            }
        }
    }
}

