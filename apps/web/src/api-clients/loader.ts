import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import config from '@/lib/config';

interface ServiceConfig {
    ENABLED: boolean;
    VERSION: string;
}
interface GlobalConfig {
    SERVICES: {
        [key: string]: ServiceConfig;
    };
}

class APIClientLoader {
    private config: GlobalConfig | null = null;

    private apiClients: Record<string, Record<string, any>>;

    async initialize() {
        await config.init();
        this.config = config.get('SERVICES') || {};

        this.apiClients = {
            DASHBOARD: {
                V1: SpaceConnector.clientV2.dashboard,
            },
            ALERT_MANAGER: {
                V1: SpaceConnector.clientV2.monitoring,
                V2: SpaceConnector.clientV2.alertManager,
            },
            PROJECT: {
                V1: SpaceConnector.clientV2.project,
            },
        };
    }

    getAPIClient(serviceName: string) {
        if (!this.config) {
            throw new Error('[APIClientLoader] APIClientLoader is not initialized. Call initialize() first.');
        }

        const serviceConfig = this.config[serviceName];
        if (!serviceConfig || !serviceConfig.ENABLED) {
            console.warn(`[APIClientLoader] ${serviceName} is disabled.`);
            return null;
        }

        const version = serviceConfig.VERSION;
        const client = this.apiClients[serviceName]?.[version];

        if (!client) {
            console.error(
                `[APIClientLoader] No API client found for ${serviceName} with version ${version}.`,
            );
            return null;
        }

        return { client, version };
    }
}

export default new APIClientLoader();

