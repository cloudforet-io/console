import type { Ref } from 'vue';
import { reactive, computed } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { APIError } from '@cloudforet/core-lib/space-connector/error';

import type { ResourceGroupType } from '@/schema/_common/type';
import type { PublicConfigCreateParameters as SharedConfigCreateParameters } from '@/schema/config/public-config/api-verbs/create';
import type { PublicConfigGetParameters as SharedConfigGetParameters } from '@/schema/config/public-config/api-verbs/get';
import type { PublicConfigUpdateParameters as SharedConfigUpdateParameters } from '@/schema/config/public-config/api-verbs/update';
import type { PublicConfigModel as SharedConfigModel } from '@/schema/config/public-config/model';

import { SHARED_CONFIG_NAMES } from '@/store/domain/constant';
import type { DomainConfigKey } from '@/store/domain/type';


interface UseSharedConfigStoreState {
    sharedConfigMap: Partial<Record<DomainConfigKey, SharedConfigModel>>;
}
type UseSharedConfigStoreGetters = Record<DomainConfigKey, Ref<SharedConfigModel|undefined>>;

export const useSharedConfigStore = defineStore('shared-config', () => {
    const state = reactive<UseSharedConfigStoreState>({
        sharedConfigMap: {},
    });
    const _getterObj = {} as UseSharedConfigStoreGetters;
    Object.keys(SHARED_CONFIG_NAMES).forEach((key) => {
        _getterObj[key] = computed<SharedConfigModel|undefined>(() => state.sharedConfigMap[key]);
    });
    const getters = reactive<UseSharedConfigStoreGetters>(_getterObj);

    const createSharedConfig = async <T extends Record<string, any> = Record<string, any>>(key: DomainConfigKey, data: T, resourceGroup: ResourceGroupType) => {
        const name = SHARED_CONFIG_NAMES[key];
        const sharedConfig = await SpaceConnector.clientV2.config.publicConfig.create<SharedConfigCreateParameters, SharedConfigModel<T>>({
            name,
            data,
            resource_group: resourceGroup,
        });
        return sharedConfig;
    };
    const updateSharedConfig = async <T extends Record<string, any> = Record<string, any>>(key: DomainConfigKey, data: T, resourceGroupId?: string) => {
        const name = SHARED_CONFIG_NAMES[key];
        const projectId = resourceGroupId?.startsWith('project') ? resourceGroupId : undefined;
        const workspaceId = resourceGroupId?.startsWith('workspace') ? resourceGroupId : undefined;
        const sharedConfig = await SpaceConnector.clientV2.config.publicConfig.update<SharedConfigUpdateParameters, SharedConfigModel<T>>({
            name,
            data,
            project_id: projectId,
            workspace_id: workspaceId,
        });
        return sharedConfig;
    };
    const actions = {
        async get<T extends Record<string, any> = Record<string, any>>(key: DomainConfigKey, resourceGroupId?: string): Promise<SharedConfigModel<T>> {
            const name = SHARED_CONFIG_NAMES[key];
            const projectId = resourceGroupId?.startsWith('project') ? resourceGroupId : undefined;
            const workspaceId = resourceGroupId?.startsWith('workspace') ? resourceGroupId : undefined;
            if (state.sharedConfigMap[key]) return state.sharedConfigMap[key] as SharedConfigModel<T>;
            const sharedConfig = await SpaceConnector.clientV2.config.publicConfig.get<SharedConfigGetParameters, SharedConfigModel<T>>({
                name,
                project_id: projectId,
                workspace_id: workspaceId,
            });
            state.sharedConfigMap = { ...state.sharedConfigMap, [key]: sharedConfig };
            return sharedConfig;
        },
        async set<T extends Record<string, any> = Record<string, any>>(key: DomainConfigKey, data: T, resourceGroupId?: string) {
            let sharedConfig;
            try {
                sharedConfig = await updateSharedConfig(key, data, resourceGroupId);
            } catch (e) {
                if (e instanceof APIError && e.status === 404) {
                    let resourceGroup;
                    if (resourceGroupId === undefined) resourceGroup = 'DOMAIN';
                    else {
                        resourceGroup = resourceGroupId.startsWith('project') ? 'PROJECT' : 'WORKSPACE';
                    }
                    sharedConfig = await createSharedConfig(key, data, resourceGroup);
                } else {
                    throw e;
                }
            }
            state.sharedConfigMap = { ...state.sharedConfigMap, [key]: sharedConfig };
            return sharedConfig;
        },

        reset() {
            state.sharedConfigMap = {};
        },
    };

    return {
        state,
        getters,
        ...actions,
    };
});
