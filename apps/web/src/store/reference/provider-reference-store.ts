import { asyncComputed } from '@vueuse/core';
import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { ProviderListParameters } from '@/schema/identity/provider/api-verbs/list';
import type { ProviderModel } from '@/schema/identity/provider/model';
import { store } from '@/store';

import type {
    ReferenceLoadOptions, ReferenceItem, ReferenceMap, ReferenceTypeInfo,
} from '@/store/modules/reference/type';

import { assetUrlConverter } from '@/lib/helper/asset-helper';
import { MANAGED_VARIABLE_MODEL_CONFIGS } from '@/lib/variable-models/managed';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { indigo } from '@/styles/colors';


export type ProviderItem = Required<Pick<ReferenceItem<ProviderModel>, 'key'|'label'|'name'|'icon'|'color'|'linkTemplate'>>;
export type ProviderReferenceMap = ReferenceMap<ProviderItem>;

const LOAD_TTL = 1000 * 60 * 60 * 3; // 3 hours
let lastLoadedTime = 0;

export const useProviderReferenceStore = defineStore('provider-reference', () => {
    const state = reactive({
        items: null as ProviderReferenceMap | null,
    });

    const getters = reactive({
        providerItems: asyncComputed<ProviderReferenceMap>(async () => {
            if (store.getters['user/getCurrentGrantInfo'].scope === 'USER') return {};
            if (state.items === null) await load();
            return state.items ?? {};
        }, {}, { lazy: true }),
        providerTypeInfo: computed<ReferenceTypeInfo>(() => ({
            type: MANAGED_VARIABLE_MODEL_CONFIGS.provider.key,
            key: MANAGED_VARIABLE_MODEL_CONFIGS.provider.idKey as string,
            name: MANAGED_VARIABLE_MODEL_CONFIGS.provider.name,
            referenceMap: getters.providerItems,
        })),
    });

    const load = async (options?: ReferenceLoadOptions) => {
        const currentTime = new Date().getTime();

        if (
            ((lastLoadedTime !== 0 && currentTime - lastLoadedTime < LOAD_TTL)
                || (options?.lazyLoad && state.items)
            ) && !options?.force
        ) return;

        const referenceMap: ProviderReferenceMap = {};
        try {
            const response: ListResponse<ProviderModel> = await SpaceConnector.clientV2.identity.provider.list<ProviderListParameters, ListResponse<ProviderModel>>({
                query: {
                    only: ['provider', 'name', 'icon', 'alias', 'color', 'options'],
                },
            }, { timeout: 3000 });

            response.results?.forEach((providerInfo): void => {
                referenceMap[providerInfo.provider] = {
                    key: providerInfo.provider,
                    label: providerInfo.alias || providerInfo.name,
                    name: providerInfo.name,
                    icon: assetUrlConverter(providerInfo.icon),
                    color: providerInfo.color || indigo[400],
                    linkTemplate: providerInfo.tags?.external_link_template,
                };
            });
            state.items = referenceMap;
            lastLoadedTime = currentTime;
        } catch (e) {
            ErrorHandler.handleError(e);
        }
    };

    const sync = async (providerInfo: ProviderModel) => {
        state.items = {
            ...state.items,
            [providerInfo.provider]: {
                key: providerInfo.provider,
                label: providerInfo.alias || providerInfo.name,
                name: providerInfo.name,
                icon: assetUrlConverter(providerInfo.icon),
                color: providerInfo.color || indigo[400],
                linkTemplate: providerInfo.tags?.external_link_template,
            },
        };
    };

    const flush = () => {
        state.items = null;
        lastLoadedTime = 0;
    };

    const actions = {
        load,
        sync,
        flush,
    };

    return {
        state,
        getters,
        ...actions,
    };
});

