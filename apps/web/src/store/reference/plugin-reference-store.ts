import { asyncComputed } from '@vueuse/core';
import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { PluginListParameters } from '@/schema/repository/plugin/api-verbs/list';
import type { PluginModel } from '@/schema/repository/plugin/model';
// eslint-disable-next-line import/no-cycle
import { store } from '@/store';

import type {
    ReferenceLoadOptions, ReferenceItem, ReferenceMap, ReferenceTypeInfo,
} from '@/store/reference/type';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';


export type PluginItem = Required<Pick<ReferenceItem<PluginModel>, 'key'|'label'|'name'|'icon'|'description'|'link'>>;
export type PluginReferenceMap = ReferenceMap<PluginItem>;

const LOAD_TTL = 1000 * 60 * 60 * 3; // 3 hours
let lastLoadedTime = 0;

export const usePluginReferenceStore = defineStore('plugin-reference', () => {
    const state = reactive({
        items: null as PluginReferenceMap | null,
    });

    const getters = reactive({
        pluginItems: asyncComputed<PluginReferenceMap>(async () => {
            if (store.getters['user/getCurrentGrantInfo'].scope === 'USER') return {};
            if (state.items === null) await load();
            return state.items ?? {};
        }, {}, { lazy: true }),
        pluginTypeInfo: computed<ReferenceTypeInfo>(() => ({
            type: 'plugin',
            key: 'plugin_id',
            name: 'name',
            referenceMap: getters.pluginItems,
        })),
    });

    const load = async (options?: ReferenceLoadOptions) => {
        const currentTime = new Date().getTime();

        if (
            ((lastLoadedTime !== 0 && currentTime - lastLoadedTime < LOAD_TTL)
                || (options?.lazyLoad && state.items)
            ) && !options?.force
        ) return;

        const referenceMap: PluginReferenceMap = {};
        try {
            const response = await SpaceConnector.clientV2.repository.plugin.list<PluginListParameters, ListResponse<PluginModel>>({
                query: {
                    only: ['plugin_id', 'name', 'tags'],
                },
            }, { timeout: 3000 });

            response.results?.forEach((pluginInfo: PluginModel): void => {
                referenceMap[pluginInfo.plugin_id] = {
                    key: pluginInfo.plugin_id,
                    label: pluginInfo.name,
                    name: pluginInfo.name,
                    icon: pluginInfo.tags.icon ? assetUrlConverter(pluginInfo.tags.icon) : '',
                    description: pluginInfo.tags.description ?? '',
                    link: pluginInfo.tags.link ?? '',
                };
            });
            state.items = referenceMap;
            lastLoadedTime = currentTime;
        } catch (e) {
            ErrorHandler.handleError(e);
        }
    };

    const sync = async (pluginInfo: PluginModel) => {
        state.items = {
            ...state.items,
            [pluginInfo.plugin_id]: {
                key: pluginInfo.plugin_id,
                label: pluginInfo.tags.description || pluginInfo.name,
                name: pluginInfo.name,
                icon: pluginInfo.tags.icon ? assetUrlConverter(pluginInfo.tags.icon) : '',
                description: pluginInfo.tags.description ?? '',
                link: pluginInfo.tags.link ?? '',
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

