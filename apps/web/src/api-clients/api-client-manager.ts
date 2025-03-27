import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ApiClientsSchemaType } from '@/lib/config/global-config/api-client-schema';
import { ApiClientEndpoint } from '@/lib/config/global-config/api-client-schema';
import type { GlobalServiceConfig } from '@/lib/config/global-config/type';


class APIClientManager {
    // eslint-disable-next-line no-undef
    [key: string]: any;

    private config: GlobalServiceConfig = {} as GlobalServiceConfig;

    private apiClientsSchema: ApiClientsSchemaType = {} as ApiClientsSchemaType;

    async initialize(mergedConfig) {
        this.config = mergedConfig;

        this.apiClientsSchema = JSON.parse(JSON.stringify(ApiClientEndpoint));
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
            return null;
        }

        const apiClientSchemaByService = this.apiClientsSchema[serviceName];
        if (!apiClientSchemaByService) {
            return null;
        }

        const version = serviceConfig.VERSION;
        const clientEndpoint = apiClientSchemaByService[version];
        if (!clientEndpoint) {
            return null;
        }

        const endpoint = SpaceConnector.clientV2[clientEndpoint];

        return { endpoint, version };
    }
}

export default new APIClientManager();
