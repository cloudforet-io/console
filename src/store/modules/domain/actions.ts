/* eslint-disable camelcase */

import { SpaceConnector } from '@/core-lib/space-connector';
import { ExtendedAuthType } from './type';

const EXTENDED_AUTH_TYPE_MAP = {
    google_oauth2: 'GOOGLE_OAUTH2',
    keycloak_oidc: 'KEYCLOAK',
};

const getExtendedAuthType = (authType): ExtendedAuthType | undefined => EXTENDED_AUTH_TYPE_MAP[authType];

const getAuthOptions = (pluginInfo): any => {
    const pluginOptions = pluginInfo?.options || {};
    const pluginMetadata = pluginInfo?.options.metadata || {};
    return {
        ...pluginOptions,
        ...pluginMetadata,
    };
};

export const load = async ({ commit }, name: string): Promise<void|Error> => {
    const response = await SpaceConnector.client.identity.domain.list({ name });

    if (response.total_count === 1) {
        const domainResponse = response.results[0];
        commit('setDomain', {
            domainId: domainResponse.domain_id,
            name: domainResponse.name,
            extendedAuthType: getExtendedAuthType(domainResponse.plugin_info?.options?.auth_type),
            authOptions: getAuthOptions(domainResponse.plugin_info),
        });
    } else {
        throw new Error(`Can not found '${name}' domain.`);
    }
};
