import type { Action } from 'vuex';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { CloudServiceTypeReferenceMap, CloudServiceTypeReferenceState } from '@/store/modules/reference/cloud-service-type/type';
import { REFERENCE_LOAD_TTL } from '@/store/modules/reference/config';
import type { ReferenceLoadOptions } from '@/store/modules/reference/type';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

let lastLoadedTime = 0;

export const load: Action<CloudServiceTypeReferenceState, any> = async ({ state, commit }, options: ReferenceLoadOptions): Promise<void|Error> => {
    const currentTime = new Date().getTime();

    if (
        ((options?.lazyLoad && state.items)
        || (lastLoadedTime !== 0 && currentTime - lastLoadedTime < REFERENCE_LOAD_TTL)
        ) && !options?.force
    ) return;
    lastLoadedTime = currentTime;

    try {
        const response = await SpaceConnector.client.inventory.cloudServiceType.list({
            query: {
                only: ['cloud_service_type_id', 'name', 'group', 'provider', 'tags', 'cloud_service_type_key'],
            },
        }, { timeout: 3000 });
        const cloudServiceTypes: CloudServiceTypeReferenceMap = {};

        response.results.forEach((cloudServiceTypeInfo: any): void => {
            cloudServiceTypes[cloudServiceTypeInfo.cloud_service_type_id] = {
                key: cloudServiceTypeInfo.cloud_service_type_id,
                label: `${cloudServiceTypeInfo.group} > ${cloudServiceTypeInfo.name}`,
                name: cloudServiceTypeInfo.name,
                icon: assetUrlConverter(cloudServiceTypeInfo.tags['spaceone:icon']),
                data: {
                    provider: cloudServiceTypeInfo.provider,
                    group: cloudServiceTypeInfo.group,
                    cloudServiceTypeKey: cloudServiceTypeInfo.cloud_service_type_key,
                },
            };
        });

        commit('setCloudServiceTypes', cloudServiceTypes);
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

export const sync: Action<CloudServiceTypeReferenceState, any> = ({ state, commit }, cloudServiceTypeInfo): void => {
    const cloudServiceTypes: CloudServiceTypeReferenceMap = {
        ...state.items,
        [cloudServiceTypeInfo.cloud_service_type_id]: {
            key: cloudServiceTypeInfo.cloud_service_type_id,
            label: `${cloudServiceTypeInfo.group} > ${cloudServiceTypeInfo.name}`,
            name: cloudServiceTypeInfo.name,
            icon: assetUrlConverter(cloudServiceTypeInfo.tags['spaceone:icon']),
        },
    };
    commit('setCloudServiceTypes', cloudServiceTypes);
};
