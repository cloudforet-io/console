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
            let icon;
            let label;
            pluginInfo.tags.forEach((tag) => {
                if (tag.key === 'icon') icon = tag.value;
                else if (tag.key === 'description') label = tag.value;
            });

            plugins[pluginInfo.plugin_id] = {
                label: label || pluginInfo.name,
                name: pluginInfo.name,
                icon,
            };
        });
    });

    await Promise.all(promises);

    commit('setPlugins', plugins);
};
