/* eslint-disable camelcase */

import type { Action } from 'vuex';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { DomainGetAuthInfoParams, DomainGetAuthInfoResponse } from '@/schema/identity/domain/api-verbs/get-auth-info';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { DomainState, ExtendedAuthType } from './type';
import { DOMAIN_CONFIG_TYPE } from './type';

const EXTENDED_AUTH_TYPE_MAP = {
    google_oauth2: 'GOOGLE_OAUTH2',
    keycloak_oidc: 'KEYCLOAK',
    kbfg_sso: 'KB_SSO',
};

const getExtendedAuthType = (authType): ExtendedAuthType | undefined => EXTENDED_AUTH_TYPE_MAP[authType];

const getAuthOptions = (pluginInfo): any => {
    const pluginOptions = pluginInfo?.options || {};
    const pluginMetadata = pluginInfo?.metadata || {};
    return {
        ...pluginOptions,
        ...pluginMetadata,
    };
};

export const load = async ({ commit }, name: string): Promise<void|Error> => {
    const response = await SpaceConnector.clientV2.identity.domain.getAuthInfo<DomainGetAuthInfoParams, DomainGetAuthInfoResponse>({ name });

    // TODO: refactor below logic with new response
    if (response.domain_id) {
        const authMetadata = response.metadata;
        commit('setDomain', {
            domainId: response.domain_id,
            name: response.name,
            extendedAuthType: getExtendedAuthType(authMetadata.auth_type),
            authOptions: getAuthOptions(authMetadata.plugin_info),
        });
    } else {
        throw new Error(`Can not find '${name}' domain.`);
    }
};

export const loadExtraMenu: Action<DomainState, any> = async ({ commit, state }) => {
    if (state.extraMenu) return;
    try {
        const { results } = await SpaceConnector.client.config.domainConfig.list({
            name: DOMAIN_CONFIG_TYPE.EXTRA_MENU,
        });
        commit('setExtraMenu', results[0]?.data ?? {});
    } catch (e) {
        ErrorHandler.handleError(e);
        commit('setExtraMenu', {});
    }
};
