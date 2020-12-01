import { SpaceConnector } from '@/lib/space-connector';
import { ResourceMap } from '@/store/modules/resource/type';

export const load = async ({ commit }): Promise<void|Error> => {
    const response = await SpaceConnector.client.inventory.cloudServiceType.list({
        query: {
            only: ['cloud_service_type_id', 'name', 'group', 'provider', 'tags'],
        },
    });
    const cloudServiceTypes: ResourceMap = {};

    response.results.forEach((cloudServiceTypeInfo: any): void => {
        let icon;
        cloudServiceTypeInfo.tags.forEach((tag) => {
            if (tag.key === 'spaceone:icon') icon = tag.value;
        });

        cloudServiceTypes[cloudServiceTypeInfo.cloud_service_type_id] = {
            label: `${cloudServiceTypeInfo.group} > ${cloudServiceTypeInfo.name}`,
            name: cloudServiceTypeInfo.group,
            icon,
        };
    });

    commit('setCloudServiceTypes', cloudServiceTypes);
};
