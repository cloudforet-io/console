import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { indigo } from '@/styles/colors';
import { assetUrlConverter } from '@/lib/helper/asset-helper';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { REFERENCE_LOAD_TTL } from '@/store/modules/reference/config';
import { Action } from 'vuex';
import { ProviderReferenceMap, ProviderReferenceState } from '@/store/modules/reference/provider/type';

let lastLoadedTime = 0;

export const load: Action<ProviderReferenceState, any> = async ({ commit, state }, lazyLoad = false): Promise<void|Error> => {
    const currentTime = new Date().getTime();

    if (
        (lazyLoad && Object.keys(state.items).length > 0)
        || (lastLoadedTime !== 0 && currentTime - lastLoadedTime < REFERENCE_LOAD_TTL)
    ) return;
    lastLoadedTime = currentTime;

    try {
        const response = await SpaceConnector.client.identity.provider.list({
            query: {
                only: ['provider', 'name', 'tags'],
                sort: {
                    key: 'provider',
                },
            },
        }, { timeout: 3000 });
        const providers: ProviderReferenceMap = {};

        response.results.forEach((providerInfo: any): void => {
            providers[providerInfo.provider] = {
                label: providerInfo.tags.label || providerInfo.name,
                name: providerInfo.name,
                icon: assetUrlConverter(providerInfo.tags.icon),
                color: providerInfo.tags.color || indigo[400],
                linkTemplate: providerInfo.tags.external_link_template,
            };
        });

        commit('setProviders', providers);
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

export const sync: Action<ProviderReferenceState, any> = ({ state, commit }, providerInfo): void => {
    const providers: ProviderReferenceMap = {
        ...state.items,
        [providerInfo.provider]: {
            label: providerInfo.tags.label || providerInfo.name,
            name: providerInfo.name,
            icon: assetUrlConverter(providerInfo.tags.icon),
            color: providerInfo.tags.color || indigo[400],
            linkTemplate: providerInfo.tags.external_link_template,
        },
    };
    commit('setProviders', providers);
};
