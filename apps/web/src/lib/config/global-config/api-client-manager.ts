import camelCase from 'lodash/camelCase';
import kebabCase from 'lodash/kebabCase';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { DEFAULT_VERSION } from '@/lib/config/global-config/constants/constants';
import { ApiClientEndpoint } from '@/lib/config/global-config/schema/api-client-schema';
import type { ApiClientsSchemaType, GlobalServiceConfig } from '@/lib/config/global-config/types/type';

interface ServiceEndpoint {
    endpoint: any;
    version: string;
}

class APIClientManagerError extends Error {
    constructor(message: string) {
        super(`[APIClientManager] ${message}`);
        this.name = 'APIClientManagerError';
    }
}

class APIClientManager {
    // eslint-disable-next-line no-undef
    [key: string]: any;

    private config: GlobalServiceConfig | null = null;

    private apiClientsSchema: ApiClientsSchemaType | null = null;

    private serviceEndpoints: Map<string, ServiceEndpoint> = new Map();

    async initialize(mergedConfig: GlobalServiceConfig): Promise<void> {
        this.config = mergedConfig;
        this.apiClientsSchema = JSON.parse(JSON.stringify(ApiClientEndpoint));
        await this.initializeServiceConfig();
        this.defineDynamicServices();
    }

    private async initializeServiceConfig(): Promise<void> {
        if (!this.config || !this.apiClientsSchema) {
            throw new APIClientManagerError('Configuration or schema is not initialized');
        }

        const serviceConfig: Record<string, { enabled: boolean }> = {};

        Object.entries(this.config).forEach(([serviceName, config]) => {
            if (this.apiClientsSchema?.[serviceName]) {
                const version = config.VERSION || DEFAULT_VERSION;
                const endpoint = this.apiClientsSchema[serviceName][version];
                if (endpoint) {
                    const formattedEndpoint = APIClientManager.formatEndpoint(endpoint);
                    serviceConfig[formattedEndpoint] = {
                        enabled: config.ENABLED,
                    };
                }
            }
        });

        SpaceConnector.setServiceConfig(serviceConfig);
    }

    private static formatEndpoint(endpoint: string): string {
        return kebabCase(endpoint);
    }

    private defineDynamicServices(): void {
        if (!this.apiClientsSchema) {
            throw new APIClientManagerError('APIClientManager is not initialized');
        }

        Object.keys(this.apiClientsSchema).forEach((serviceName) => {
            const propertyName = APIClientManager.formatPropertyName(serviceName);
            Object.defineProperty(this, propertyName, {
                get: () => this.getServiceEndpoint(serviceName),
                enumerable: true,
                configurable: true,
            });
        });
    }

    private static formatPropertyName(serviceName: string): string {
        return camelCase(serviceName);
    }

    private getServiceEndpoint(serviceName: string): ServiceEndpoint | null {
        if (this.serviceEndpoints.has(serviceName)) {
            return this.serviceEndpoints.get(serviceName) ?? null;
        }

        const serviceConfig = this.config?.[serviceName];
        if (!serviceConfig?.ENABLED) return null;

        const apiClientSchemaByService = this.apiClientsSchema?.[serviceName];
        if (!apiClientSchemaByService) return null;

        const version = serviceConfig.VERSION;
        const clientEndpoint = apiClientSchemaByService[version];
        if (!clientEndpoint) return null;

        const endpoint = SpaceConnector.clientV2[clientEndpoint];
        const serviceEndpoint: ServiceEndpoint = { endpoint, version };

        this.serviceEndpoints.set(serviceName, serviceEndpoint);
        return serviceEndpoint;
    }
}

export default new APIClientManager();
