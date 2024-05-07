import { asyncComputed } from '@vueuse/core';
import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { NamespaceListParameters } from '@/schema/inventory/namespace/api-verbs/list';
import type { NamespaceModel } from '@/schema/inventory/namespace/model';
// eslint-disable-next-line import/no-cycle
import { store } from '@/store';

import type {
    ReferenceLoadOptions, ReferenceItem, ReferenceMap,
    ReferenceTypeInfo,
} from '@/store/reference/type';

import ErrorHandler from '@/common/composables/error/errorHandler';


export type NamespaceReferenceItem = Required<Pick<ReferenceItem<Partial<NamespaceModel>>, 'key'|'label'|'name'|'provider'|'data'>>;
export type NamespaceReferenceMap = ReferenceMap<NamespaceReferenceItem>;

const LOAD_TTL = 1000 * 60 * 60 * 3; // 3 hours
let lastLoadedTime = 0;

export const useNamespaceReferenceStore = defineStore('reference-namespace', () => {
    const state = reactive({
        items: null as NamespaceReferenceMap | null,
    });

    const getters = reactive({
        namespaceItems: asyncComputed<NamespaceReferenceMap>(async () => {
            if (store.getters['user/getCurrentGrantInfo'].scope === 'USER') return {};
            if (state.items === null) await load();
            return state.items ?? {};
        }, {}, { lazy: true }),
        namespaceTypeInfo: computed<ReferenceTypeInfo>(() => ({
            type: 'namespace',
            key: 'namespace_id',
            name: 'name',
            referenceMap: getters.namespaceItems,
        })),
    });

    const load = async (options?: ReferenceLoadOptions) => {
        const currentTime = new Date().getTime();

        if (
            ((lastLoadedTime !== 0 && currentTime - lastLoadedTime < LOAD_TTL)
                || (options?.lazyLoad && state.items)
            ) && !options?.force
        ) return;

        const referenceMap: NamespaceReferenceMap = {};
        try {
            const response = await SpaceConnector.clientV2.inventory.namespace.list<NamespaceListParameters, ListResponse<NamespaceModel>>({
                query: {
                    only: ['namespace_id', 'name', 'provider', 'category', 'icon'],
                },
            }, { timeout: 3000 });

            response.results?.forEach((namespaceInfo: NamespaceModel): void => {
                referenceMap[namespaceInfo.namespace_id] = {
                    key: namespaceInfo.namespace_id,
                    label: namespaceInfo.name,
                    name: namespaceInfo.name,
                    provider: namespaceInfo.provider,
                    data: {
                        category: namespaceInfo.category,
                        icon: namespaceInfo.icon,
                    },
                };
            });
            state.items = referenceMap;
            lastLoadedTime = currentTime;
        } catch (e) {
            ErrorHandler.handleError(e);
        }
    };

    const sync = async (namespaceInfo: NamespaceModel) => {
        state.items = {
            ...state.items,
            [namespaceInfo.namespace_id]: {
                key: namespaceInfo.namespace_id,
                label: namespaceInfo.name,
                name: namespaceInfo.name,
                provider: namespaceInfo.provider,
                data: {
                    category: namespaceInfo.category,
                    icon: namespaceInfo.icon,
                },
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

