/* eslint-disable camelcase */

import { SpaceConnector } from '@/lib/space-connector';
import { AuthType, AuthSystem } from './type';

const AUTH_SYSTEM_MAP = {
    google_oauth2: 'GOOGLE_OAUTH2',
};

const getAuthSystem = (authSystem): AuthSystem => {
    if (authSystem in AUTH_SYSTEM_MAP) {
        return AUTH_SYSTEM_MAP[authSystem];
    }

    return 'ID_PW';
};

const getAuthType = (pluginInfo): AuthType => {
    if (pluginInfo) {
        return 'EXTERNAL';
    }

    return 'INTERNAL';
};

const getAuthOptions = (pluginInfo): any => {
    const pluginOptions = pluginInfo?.options || {};
    const pluginMetadata = pluginInfo?.metadata || {};
    return {
        ...pluginOptions,
        ...pluginMetadata,
    };
};

export const load = async ({ commit, state }, name: string): Promise<void|Error> => {
    const response = await SpaceConnector.client.identity.domain.list({ name });

    if (response.total_count === 1) {
        const domainResponse = response.results[0];
        commit('setDomain', {
            domainId: domainResponse.domain_id,
            name: domainResponse.name,
            authType: getAuthType(domainResponse.plugin_info),
            authSystem: getAuthSystem(domainResponse.plugin_info?.options?.auth_type),
            authOptions: getAuthOptions(domainResponse.plugin_info),
        });
    } else {
        throw new Error(`Can not found '${name}' domain.`);
    }
};
