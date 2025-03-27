import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { PublicConfigGetParameters } from '@/api-clients/config/public-config/schema/api-verbs/get';
import { PUBLIC_CONFIG_NAMES } from '@/api-clients/config/public-config/schema/constant';
import type { PublicConfigModel } from '@/api-clients/config/public-config/schema/model';

import type { GlobalServiceConfig } from '@/lib/config/global-config/type';

export const mergeConfig = async (config, domainId: string): GlobalServiceConfig => {
    const baseConfig = config.get('SERVICES') || {};

    const { data: overrideConfigData } = await SpaceConnector.clientV2.config.publicConfig.get<PublicConfigGetParameters, PublicConfigModel>({
        name: PUBLIC_CONFIG_NAMES.OVERRIDE_SERVICE_SETTING,
        domainId,
    });
    const overrideConfig = overrideConfigData.SERVICES || {};

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
