import { SpaceConnector } from '@/lib/space-connector';
import { tagsToObject } from '@/lib/util';
import { ResourceMap } from '@/store/modules/resource/type';

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
            });


            pluginResponse.results.forEach((pluginInfo: any): void => {
                const pluginTags = tagsToObject(pluginInfo.tags);

                plugins[pluginInfo.plugin_id] = {
                    label: pluginTags.description || pluginInfo.name,
                    name: pluginInfo.name,
                    icon: pluginTags.icon,
                };
            });
        });

        await Promise.all(promises);

        commit('setPlugins', plugins);
    } catch (e) {}
};
