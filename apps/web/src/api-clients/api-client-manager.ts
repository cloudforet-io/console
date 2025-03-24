import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import config from '@/lib/config';
import { ApiClientSchema } from '@/lib/config/global-config/api-client-schema';
import type { ApiClientsSchemaType } from '@/lib/config/global-config/type';

interface ServiceConfig {
    ENABLED: boolean;
    VERSION: string;
}

interface GlobalConfig {
    SERVICES: {
        [key: string]: ServiceConfig;
    };
}

class APIClientManager {
    // eslint-disable-next-line no-undef
    [key: string]: any;

    private config: GlobalConfig['SERVICES'] | null = null;

    private apiClientsSchema: ApiClientsSchemaType = {} as ApiClientsSchemaType;

    async initialize() {
        await config.init();
        this.config = config.get('SERVICES') || {};
        this.apiClientsSchema = JSON.parse(JSON.stringify(ApiClientSchema));

        this.defineDynamicServices();
    }

    private defineDynamicServices() {
        if (!this.apiClientsSchema) {
            throw new Error('[APIClientManager] APIClientManager is not initialized. Call initialize() first.');
        }

        Object.keys(this.apiClientsSchema).forEach((serviceName) => {
            const propertyName = serviceName.toLowerCase()
                .replace(/_([a-z])/g, (_, char) => char.toUpperCase());

            Object.defineProperty(this, propertyName, {
                get: () => this.createServiceHandler(serviceName),
                enumerable: true,
            });
        });
    }

    private createServiceHandler(serviceName: string) {
        const serviceConfig = this.config?.[serviceName] || null;
        if (!serviceConfig || !serviceConfig.ENABLED) {
            console.warn(`[APIClientManager] ${serviceName} is disabled or not configured.`);
            return null;
        }

        const apiClientSchemaByService = this.apiClientsSchema[serviceName];
        if (!apiClientSchemaByService) {
            console.warn('[APIClientManager] apiClientSchemaByService is not configured.');
            return null;
        }

        const version = serviceConfig.VERSION;
        const clientEndpoint = apiClientSchemaByService[version];
        if (!clientEndpoint) {
            console.error(`[APIClientManager] No endpoint mapping found for ${serviceName} with version ${version}.`);
            return null;
        }

        const endpoint = SpaceConnector.clientV2[clientEndpoint];

        return { endpoint, version };
    }
}

export default new APIClientManager();
