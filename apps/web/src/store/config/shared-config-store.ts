import type { Ref } from 'vue';
import { reactive, computed } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { APIError } from '@cloudforet/core-lib/space-connector/error';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { ResourceGroupType } from '@/schema/_common/type';
import type { PublicConfigCreateParameters as SharedConfigCreateParameters } from '@/schema/config/public-config/api-verbs/create';
import type {
    PublicConfigGetAccessibleConfigsParameters as SharedConfigGetAccessibleConfigsParameters,
} from '@/schema/config/public-config/api-verbs/get-accesible-configs';
import type { PublicConfigUpdateParameters as SharedConfigUpdateParameters } from '@/schema/config/public-config/api-verbs/update';
import type { PublicConfigModel as SharedConfigModel } from '@/schema/config/public-config/model';
import { SHARED_CONFIG_NAMES } from '@/schema/config/shared-config/constant';
import type { SharedConfigKey } from '@/schema/config/shared-config/type';


interface UseSharedConfigStoreState {
    sharedConfigMap: Partial<Record<SharedConfigKey, SharedConfigModel>>;
}
type UseSharedConfigStoreGetters = Record<SharedConfigKey, Ref<SharedConfigModel|undefined>>;

export const useSharedConfigStore = defineStore('shared-config', () => {
    const state = reactive<UseSharedConfigStoreState>({
        sharedConfigMap: {},
    });
    const _getterObj = {} as UseSharedConfigStoreGetters;
    Object.keys(SHARED_CONFIG_NAMES).forEach((key) => {
        _getterObj[key] = computed<SharedConfigModel|undefined>(() => state.sharedConfigMap[key]);
    });
    const getters = reactive<UseSharedConfigStoreGetters>(_getterObj);

    const createSharedConfig = async <T extends Record<string, any> = Record<string, any>>(key: SharedConfigKey, data: T, resourceGroup: ResourceGroupType) => {
        const name = SHARED_CONFIG_NAMES[key];
        const sharedConfig = await SpaceConnector.clientV2.config.sharedConfig.create<SharedConfigCreateParameters, SharedConfigModel<T>>({
            name,
            data,
            resource_group: resourceGroup,
        });
        return sharedConfig;
    };
    const updateSharedConfig = async <T extends Record<string, any> = Record<string, any>>(key: SharedConfigKey, data: T) => {
        const name = SHARED_CONFIG_NAMES[key];
        const sharedConfig = await SpaceConnector.clientV2.config.sharedConfig.update<SharedConfigUpdateParameters, SharedConfigModel<T>>({
            name,
            data,
        });
        return sharedConfig;
    };
    const actions = {
        async get<T extends Record<string, any> = Record<string, any>>(key: SharedConfigKey): Promise<SharedConfigModel<T>|undefined> {
            const name = SHARED_CONFIG_NAMES[key];
            if (state.sharedConfigMap[key]) return state.sharedConfigMap[key] as SharedConfigModel<T>;
            const res = await SpaceConnector.clientV2.config.sharedConfig.getAccessibleConfigs<SharedConfigGetAccessibleConfigsParameters, ListResponse<SharedConfigModel<T>>>({
                name,
            });
            const sharedConfig = res.results?.[0];
            if (sharedConfig) {
                state.sharedConfigMap = { ...state.sharedConfigMap, [key]: sharedConfig };
            }
            return sharedConfig;
        },
        async set<T extends Record<string, any> = Record<string, any>>(key: SharedConfigKey, data: T, resourceGroupId?: string) {
            let sharedConfig: SharedConfigModel<T>;
            try {
                sharedConfig = await updateSharedConfig(key, data);
            } catch (e) {
                if (e instanceof APIError && e.status === 404) {
                    let resourceGroup: ResourceGroupType;
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
