import { asyncComputed } from '@vueuse/core';
import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { CloudServiceTypeListParameters } from '@/schema/inventory/cloud-service-type/api-verbs/list';
import type { CloudServiceTypeModel } from '@/schema/inventory/cloud-service-type/model';
// eslint-disable-next-line import/no-cycle
import { store } from '@/store';

import type {
    ReferenceLoadOptions, ReferenceItem, ReferenceMap, ReferenceTypeInfo,
} from '@/store/reference/type';

import { assetUrlConverter } from '@/lib/helper/asset-helper';
import { MANAGED_VARIABLE_MODEL_CONFIGS } from '@/lib/variable-models/managed';

import ErrorHandler from '@/common/composables/error/errorHandler';


type PickedCloudServiceTypeModel = Pick<CloudServiceTypeModel, 'provider'|'group'|'cloud_service_type_key'>;
export type CloudServiceTypeItem = Required<Pick<ReferenceItem<PickedCloudServiceTypeModel>, 'key'|'label'|'name'|'icon'|'data'>>;
export type CloudServiceTypeReferenceMap = ReferenceMap<CloudServiceTypeItem>;

const LOAD_TTL = 1000 * 60 * 60 * 3; // 3 hours
let lastLoadedTime = 0;

export const useCloudServiceTypeReferenceStore = defineStore('reference-cloud-service-type', () => {
    const state = reactive({
        items: null as CloudServiceTypeReferenceMap | null,
    });

    const getters = reactive({
        cloudServiceTypeItems: asyncComputed<CloudServiceTypeReferenceMap>(async () => {
            if (store.getters['user/getCurrentGrantInfo'].scope === 'USER') return {};
            if (state.items === null) await load();
            return state.items ?? {};
        }, {}, { lazy: true }),
        cloudServiceTypeTypeInfo: computed<ReferenceTypeInfo>(() => ({
            type: MANAGED_VARIABLE_MODEL_CONFIGS.cloud_service_type.key,
            key: MANAGED_VARIABLE_MODEL_CONFIGS.cloud_service_type.idKey as string,
            name: MANAGED_VARIABLE_MODEL_CONFIGS.cloud_service_type.name,
            referenceMap: getters.cloudServiceTypeItems,
        })),
    });

    const load = async (options?: ReferenceLoadOptions) => {
        const currentTime = new Date().getTime();

        if (
            ((lastLoadedTime !== 0 && currentTime - lastLoadedTime < LOAD_TTL)
                || (options?.lazyLoad && state.items)
            ) && !options?.force
        ) return;

        const referenceMap: CloudServiceTypeReferenceMap = {};
        try {
            const response = await SpaceConnector.clientV2.inventory.cloudServiceType.list<CloudServiceTypeListParameters, ListResponse<CloudServiceTypeModel>>({
                query: {
                    only: ['cloud_service_type_id', 'name', 'group', 'provider', 'tags', 'cloud_service_type_key'],
                },
            }, { timeout: 3000 });

            response.results?.forEach((cloudServiceTypeInfo: any): void => {
                referenceMap[cloudServiceTypeInfo.cloud_service_type_id] = {
                    key: cloudServiceTypeInfo.cloud_service_type_id,
                    label: `${cloudServiceTypeInfo.group} > ${cloudServiceTypeInfo.name}`,
                    name: cloudServiceTypeInfo.name,
                    icon: assetUrlConverter(cloudServiceTypeInfo.tags['spaceone:icon']),
                    data: {
                        provider: cloudServiceTypeInfo.provider,
                        group: cloudServiceTypeInfo.group,
                        cloud_service_type_key: cloudServiceTypeInfo.cloud_service_type_key,
                    },
                };
            });
            state.items = referenceMap;
            lastLoadedTime = currentTime;
        } catch (e) {
            ErrorHandler.handleError(e);
        }
    };

    const sync = async (cloudServiceTypeInfo: CloudServiceTypeModel) => {
        state.items = {
            ...state.items,
            [cloudServiceTypeInfo.cloud_service_type_id]: {
                key: cloudServiceTypeInfo.cloud_service_type_id,
                label: `${cloudServiceTypeInfo.group} > ${cloudServiceTypeInfo.name}`,
                name: cloudServiceTypeInfo.name,
                icon: assetUrlConverter(cloudServiceTypeInfo.tags['spaceone:icon']),
                data: {
                    provider: cloudServiceTypeInfo.provider,
                    group: cloudServiceTypeInfo.group,
                    cloud_service_type_key: cloudServiceTypeInfo.cloud_service_type_key,
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

