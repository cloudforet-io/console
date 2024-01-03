import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { DomainGetAuthInfoParams, DomainGetAuthInfoResponse } from '@/schema/identity/domain/api-verbs/get-auth-info';

import type { ExtendedAuthType } from './type';


const EXTENDED_AUTH_TYPE_MAP = {
    google_oauth2: 'GOOGLE_OAUTH2',
    keycloak_oidc: 'KEYCLOAK',
    kbfg_sso: 'KB_SSO',
};

const getExtendedAuthType = (authType): ExtendedAuthType | undefined => EXTENDED_AUTH_TYPE_MAP[authType];

export const load = async ({ commit }, name: string): Promise<void|Error> => {
    const response = await SpaceConnector.clientV2.identity.domain.getAuthInfo<DomainGetAuthInfoParams, DomainGetAuthInfoResponse>({ name });

    if (response.domain_id) {
        const authMetadata = response.metadata;
        commit('setDomain', {
            domainId: response.domain_id,
            name: response.name,
            extendedAuthType: getExtendedAuthType(authMetadata.auth_type),
            authOptions: authMetadata,
            config: response.config,
        });
    } else {
        throw new Error(`Can not find '${name}' domain.`);
    }
};
