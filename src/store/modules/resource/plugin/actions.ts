import { SpaceConnector } from '@/lib/space-connector';
import { ResourceMap } from '@/store/modules/resource/type';

export const load = async ({ commit }): Promise<void|Error> => {
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
            plugins[pluginInfo.plugin_id] = {
                label: pluginInfo.tags.description || pluginInfo.name,
                name: pluginInfo.name,
                icon: pluginInfo.tags.icon,
            };
        });
    });

    await Promise.all(promises);

    commit('setPlugins', plugins);
};
