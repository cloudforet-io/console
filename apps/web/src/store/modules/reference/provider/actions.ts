import type { Action } from 'vuex';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/model';
import type { ProviderListRequestParams } from '@/schema/identity/provider/api-verbs/list';
import type { ProviderModel } from '@/schema/identity/provider/model';

import { REFERENCE_LOAD_TTL } from '@/store/modules/reference/config';
import type { ProviderReferenceMap, ProviderReferenceState } from '@/store/modules/reference/provider/type';
import type { ReferenceLoadOptions } from '@/store/modules/reference/type';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { indigo } from '@/styles/colors';

let lastLoadedTime = 0;

export const load: Action<ProviderReferenceState, any> = async ({ commit, state, rootState }, options: ReferenceLoadOptions): Promise<void|Error> => {
    const currentTime = new Date().getTime();

    if (
        ((options?.lazyLoad && state.items)
        || (lastLoadedTime !== 0 && currentTime - lastLoadedTime < REFERENCE_LOAD_TTL)
        ) && !options?.force
    ) return;

    try {
        const response: ListResponse<ProviderModel> = await SpaceConnector.clientV2.identity.provider.list({
            domain_id: rootState.domain.domainId, // TODO: remove domain_id after backend is ready
            query: {
                only: ['provider', 'name', 'tags'],
            },
        } as ProviderListRequestParams, { timeout: 3000 });
        const providers: ProviderReferenceMap = {};

        (response.results ?? []).forEach((providerInfo): void => {
            providers[providerInfo.provider] = {
                key: providerInfo.provider,
                label: providerInfo.tags.label || providerInfo.name,
                name: providerInfo.name,
                icon: assetUrlConverter(providerInfo.tags.icon),
                color: providerInfo.tags.color || indigo[400],
                linkTemplate: providerInfo.tags.external_link_template,
            };
        });

        commit('setProviders', providers);
        lastLoadedTime = currentTime;
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

export const sync: Action<ProviderReferenceState, any> = ({ state, commit }, providerInfo): void => {
    const providers: ProviderReferenceMap = {
        ...state.items,
        [providerInfo.provider]: {
            key: providerInfo.provider,
            label: providerInfo.tags.label || providerInfo.name,
            name: providerInfo.name,
            icon: assetUrlConverter(providerInfo.tags.icon),
            color: providerInfo.tags.color || indigo[400],
            linkTemplate: providerInfo.tags.external_link_template,
        },
    };
    commit('setProviders', providers);
};
