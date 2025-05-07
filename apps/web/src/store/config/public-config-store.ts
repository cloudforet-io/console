import type { Ref } from 'vue';
import { reactive, computed } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';


import type { PublicConfigGetParameters } from '@/api-clients/config/public-config/schema/api-verbs/get';
import type { PublicConfigSetParameters } from '@/api-clients/config/public-config/schema/api-verbs/set';
import { PUBLIC_CONFIG_NAMES } from '@/api-clients/config/public-config/schema/constant';
import type { PublicConfigModel } from '@/api-clients/config/public-config/schema/model';
import type { PublicConfigKey } from '@/api-clients/config/public-config/schema/type';

import { useDomainStore } from '@/store/domain/domain-store';
import { pinia } from '@/store/pinia';


interface UsePublicConfigStoreState {
    publicConfigMap: Partial<Record<PublicConfigKey, PublicConfigModel>>;
}
type UsePublicConfigStoreGetters = Record<PublicConfigKey, Ref<PublicConfigModel|undefined>>;

export const usePublicConfigStore = defineStore('public-config', () => {
    const domainStore = useDomainStore(pinia);
    const state = reactive<UsePublicConfigStoreState>({
        publicConfigMap: {},
    });
    const _getterObj = {} as UsePublicConfigStoreGetters;
    Object.keys(PUBLIC_CONFIG_NAMES).forEach((key) => {
        _getterObj[key] = computed<PublicConfigModel|undefined>(() => state.publicConfigMap[key]);
    });
    const getters = reactive<UsePublicConfigStoreGetters>(_getterObj);

    const actions = {
        async get<T extends Record<string, any> = Record<string, any>>(key: PublicConfigKey): Promise<PublicConfigModel<T>> {
            const name = PUBLIC_CONFIG_NAMES[key];
            if (state.publicConfigMap[key]) return state.publicConfigMap[key] as PublicConfigModel<T>;
            const publicConfig = await SpaceConnector.clientV2.config.publicConfig.get<PublicConfigGetParameters, PublicConfigModel<T>>({
                name,
                domain_id: domainStore.state.domainId,
            });
            state.publicConfigMap = { ...state.publicConfigMap, [key]: publicConfig };
            return publicConfig;
        },
        async set<T extends Record<string, any> = Record<string, any>>(key: PublicConfigKey, data: T) {
            const name = PUBLIC_CONFIG_NAMES[key];
            const publicConfig = await SpaceConnector.clientV2.config.publicConfig.set<PublicConfigSetParameters, PublicConfigModel<T>>({
                name,
                data,
            });
            state.publicConfigMap = { ...state.publicConfigMap, [key]: publicConfig };
            return publicConfig;
        },

        reset() {
            state.publicConfigMap = {};
        },
    };

    return {
        state,
        getters,
        ...actions,
    };
});
