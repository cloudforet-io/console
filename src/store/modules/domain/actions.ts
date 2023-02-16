/* eslint-disable camelcase */

import type { Action } from 'vuex';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { DomainState, ExtendedAuthType } from './type';

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

export const loadDomainConfig: Action<DomainState, any> = async ({ commit, rootState }) => {
    if (rootState.domain.extraMenuSet) return;
    try {
        const { results } = await SpaceConnector.client.config.domainConfig.list({});
        const extraMenuResult = results.find((config) => config.name === 'console:ext-menu');
        commit('setExraMenus', extraMenuResult.data);
    } catch (e) {
        commit('setExraMenus', undefined);
    }
};
