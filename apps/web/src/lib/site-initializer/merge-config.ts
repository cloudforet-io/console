import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { PublicConfigGetParameters } from '@/api-clients/config/public-config/schema/api-verbs/get';
import { PUBLIC_CONFIG_NAMES } from '@/api-clients/config/public-config/schema/constant';
import type { PublicConfigModel } from '@/api-clients/config/public-config/schema/model';

import type { GlobalServiceConfig } from '@/lib/config/global-config/type';

export const mergeConfig = async (config, domainId: string): Promise<GlobalServiceConfig> => {
    const baseConfig = config.get('SERVICES') || {};

    let overrideConfig = {};
    try {
        const { data: overrideConfigData } = await SpaceConnector.clientV2.config.publicConfig.get<PublicConfigGetParameters, PublicConfigModel>({
            name: PUBLIC_CONFIG_NAMES.OVERRIDE_SERVICE_SETTING,
            domain_id: domainId,
        });
        overrideConfig = overrideConfigData.SERVICES || {};
    } catch {
        console.warn('404 Not Found: Data not found. Setting default values.');
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
