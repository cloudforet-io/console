/* eslint-disable camelcase */

import type { Action } from 'vuex';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

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
        throw new Error(`Can not find '${name}' domain.`);
    }
};

export const setBillingEnabled: Action<DomainState, any> = async ({ commit, rootState }) => {
    try {
        if (!rootState.user.isSessionExpired) {
            const { total_count } = await SpaceConnector.client.costAnalysis.dataSource.list();
            commit('setBillingEnabled', total_count > 0);
        } else {
            commit('setBillingEnabled', false);
        }
    } catch (e) {
        commit('setBillingEnabled', false);
    }
};

export const resetBillingEnabled: Action<DomainState, any> = async ({ commit }) => {
    commit('setBillingEnabled', false);
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
