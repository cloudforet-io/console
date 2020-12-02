import { SpaceConnector } from '@/lib/space-connector';
import { tagsToObject } from '@/lib/util';
import { ResourceMap } from '@/store/modules/resource/type';

export const load = async ({ commit }): Promise<void|Error> => {
    const response = await SpaceConnector.client.inventory.cloudServiceType.list({
        query: {
            only: ['cloud_service_type_id', 'name', 'group', 'provider', 'tags'],
        },
    });
    const cloudServiceTypes: ResourceMap = {};

    response.results.forEach((cloudServiceTypeInfo: any): void => {
        const cloudServiceTypeTags = tagsToObject(cloudServiceTypeInfo.tags);

        cloudServiceTypes[cloudServiceTypeInfo.cloud_service_type_id] = {
            label: `${cloudServiceTypeInfo.group} > ${cloudServiceTypeInfo.name}`,
            name: cloudServiceTypeInfo.name,
            icon: cloudServiceTypeTags['spaceone:icon'],
        };
    });

    commit('setCloudServiceTypes', cloudServiceTypes);
};
