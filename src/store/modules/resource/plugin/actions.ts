import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ResourceMap } from '@/store/modules/resource/type';
import { assetUrlConverter } from '@/lib/helper/asset-helper';
import ErrorHandler from '@/common/composables/error/errorHandler';

export const load = async ({ state, commit }, lazyLoad = false): Promise<void|Error> => {
    if (lazyLoad && Object.keys(state.items).length > 0) return;
    try {
        const repoResponse = await SpaceConnector.client.repository.repository.list({
            query: {
                only: ['repository_id'],
            },
        });

        const plugins: ResourceMap = {};

        const promises = repoResponse.results.map(async (repoInfo) => {
            const pluginResponse = await SpaceConnector.client.repository.plugin.list({
                query: {
                    only: ['plugin_id', 'name', 'tags'],
                },
                repository_id: repoInfo.repository_id,
            }, { timeout: 2000 });


            pluginResponse.results.forEach((pluginInfo: any): void => {
                plugins[pluginInfo.plugin_id] = {
                    label: pluginInfo.tags.description || pluginInfo.name,
                    name: pluginInfo.name,
                    icon: assetUrlConverter(pluginInfo.tags.icon),
                };
            });
        });

        await Promise.all(promises);

        commit('setPlugins', plugins);
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};
