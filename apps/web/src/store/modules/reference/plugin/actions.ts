import type { Action } from 'vuex';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { REFERENCE_LOAD_TTL } from '@/store/modules/reference/config';
import type { PluginReferenceMap, PluginReferenceState } from '@/store/modules/reference/plugin/type';
import type { ReferenceLoadOptions } from '@/store/modules/reference/type';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

let lastLoadedTime = 0;

export const load: Action<PluginReferenceState, any> = async ({ state, commit }, options: ReferenceLoadOptions): Promise<void|Error> => {
    const currentTime = new Date().getTime();

    if (
        ((options?.lazyLoad && state.items)
        || (lastLoadedTime !== 0 && currentTime - lastLoadedTime < REFERENCE_LOAD_TTL)
        ) && !options?.force
    ) return;

    try {
        const repoResponse = await SpaceConnector.client.repository.repository.list({
            query: {
                only: ['repository_id'],
            },
        }, { timeout: 3000 });

        const plugins: PluginReferenceMap = {};

        const promises = repoResponse.results.map(async (repoInfo) => {
            const pluginResponse = await SpaceConnector.client.repository.plugin.list({
                query: {
                    only: ['plugin_id', 'name', 'tags'],
                },
                repository_id: repoInfo.repository_id,
            }, { timeout: 3000 });

            pluginResponse.results.forEach((pluginInfo: any): void => {
                plugins[pluginInfo.plugin_id] = {
                    key: pluginInfo.plugin_id,
                    label: pluginInfo.tags.description || pluginInfo.name,
                    name: pluginInfo.name,
                    icon: assetUrlConverter(pluginInfo.tags.icon),
                };
            });
        });

        await Promise.all(promises);

        commit('setPlugins', plugins);
        lastLoadedTime = currentTime;
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

export const sync: Action<PluginReferenceState, any> = ({ state, commit }, pluginInfo): void => {
    const plugins: PluginReferenceMap = {
        ...state.items,
        [pluginInfo.plugin_id]: {
            key: pluginInfo.plugin_id,
            label: pluginInfo.tags.description || pluginInfo.name,
            name: pluginInfo.name,
            icon: assetUrlConverter(pluginInfo.tags.icon),
        },
    };
    commit('setPlugins', plugins);
};
