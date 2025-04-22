import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { APIError } from '@cloudforet/core-lib/space-connector/error';

import type { PublicConfigGetParameters } from '@/api-clients/config/public-config/schema/api-verbs/get';
import { PUBLIC_CONFIG_NAMES } from '@/api-clients/config/public-config/schema/constant';
import type { PublicConfigModel } from '@/api-clients/config/public-config/schema/model';

import type { GlobalServiceConfig } from '@/lib/config/global-config/types/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

export const mergeConfig = async (config, domainId: string): Promise<GlobalServiceConfig> => {
    const baseConfig = config.get('SERVICES') || {};

    let overrideConfig = {};
    try {
        const { data: overrideConfigData } = await SpaceConnector.clientV2.config.publicConfig.get<PublicConfigGetParameters, PublicConfigModel>({
            name: PUBLIC_CONFIG_NAMES.OVERRIDE_SERVICE_SETTING,
            domain_id: domainId,
        });
        overrideConfig = overrideConfigData.SERVICES || {};
    } catch (e: any) {
        if (e instanceof APIError && e.status === 404) {
            console.warn('404 Not Found: Service Setting Data not found. Setting default values.');
        } else {
            ErrorHandler.handleError(e);
        }
    }

    Object.keys(overrideConfig).forEach((serviceName) => {
        if (baseConfig[serviceName]) {
            baseConfig[serviceName] = {
                ...baseConfig[serviceName],
                ...overrideConfig[serviceName],
            };
        }
    });

    return baseConfig;
};
