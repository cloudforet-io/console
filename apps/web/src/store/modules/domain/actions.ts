import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { DomainGetAuthInfoParams, DomainGetAuthInfoResponse, Metadata } from '@/schema/identity/domain/api-verbs/get-auth-info';

import type { ExtendedAuthType } from './type';

const getExtendedAuthType = (provider:Metadata['identity_provider'], protocol: Metadata['protocol']): ExtendedAuthType | undefined => {
    if (provider && protocol) {
        return `${provider.toUpperCase()}_${protocol.toUpperCase()}` as ExtendedAuthType;
    }
    return undefined;
};

export const load = async ({ commit }, name: string): Promise<void|Error> => {
    const response = await SpaceConnector.clientV2.identity.domain.getAuthInfo<DomainGetAuthInfoParams, DomainGetAuthInfoResponse>({ name });

    if (response.domain_id) {
        const authMetadata = response.metadata;
        commit('setDomain', {
            domainId: response.domain_id,
            name: response.name,
            extendedAuthType: getExtendedAuthType(authMetadata.identity_provider, authMetadata.protocol),
            authOptions: authMetadata,
            config: response.config,
        });
    } else {
        throw new Error(`Can not find '${name}' domain.`);
    }
};
