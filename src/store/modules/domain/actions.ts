/* eslint-disable camelcase */

import { SpaceConnector } from '@/lib/space-connector';
import { AuthType } from './type';

const AUTH_TYPE_MAP = {
    google_oauth2: 'GOOGLE_OAUTH2',
};

const getAuthType = (authType): AuthType => {
    if (authType in AUTH_TYPE_MAP) {
        return AUTH_TYPE_MAP[authType];
    }

    return 'ID_PW';
};

export const load = async ({ commit, state }, name: string): Promise<void|Error> => {
    const response = await SpaceConnector.client.identity.domain.list({ name });

    if (response.total_count === 1) {
        const domainResponse = response.results[0];
        commit('setDomain', {
            domainId: domainResponse.domain_id,
            name: domainResponse.name,
            authType: getAuthType(domainResponse.plugin_info.options?.auth_type),
        });
    } else {
        throw new Error(`Can not found '${name}' domain.`);
    }
};
