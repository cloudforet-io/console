import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import apiClientsSchema from '@/api-clients/api-clients-schema.json';

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
    // eslint-disable-next-line no-undef
    [key: string]: any;

    private config: GlobalConfig['SERVICES'] | null = null;

    private apiClientsSchema: Record<string, Record<string, string>> = {};

    async initialize() {
        await config.init();
        this.config = config.get('SERVICES') || {};
        this.apiClientsSchema = apiClientsSchema;

        this.defineDynamicServices();
    }

    private defineDynamicServices() {
        if (!this.apiClientsSchema) {
            throw new Error('[APIClientLoader] APIClientLoader is not initialized. Call initialize() first.');
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
            console.warn(`[APIClientLoader] ${serviceName} is disabled or not configured.`);
            return null;
        }

        const apiClientSchemaByService = this.apiClientsSchema[serviceName];
        if (!apiClientSchemaByService) {
            console.warn('[APIClientLoader] apiClientSchemaByService is not configured.');
            return null;
        }

        const version = serviceConfig.VERSION;
        const endpointDefinition = apiClientSchemaByService[version];
        if (!endpointDefinition) {
            console.error(`[APIClientLoader] No endpoint mapping found for ${serviceName} with version ${version}.`);
            return null;
        }

        const [clientVersion, clientEndpoint] = endpointDefinition.split('/');

        const client = clientVersion === 'v1' ? SpaceConnector.client : SpaceConnector.clientV2;
        const endpoint = client[clientEndpoint];
        if (!endpoint) {
            console.error(`[APIClientLoader] No client found for endpoint "${clientEndpoint}" using "${clientVersion}".`);
            return null;
        }

        return { endpoint, version };
    }
}

export default new APIClientLoader();
