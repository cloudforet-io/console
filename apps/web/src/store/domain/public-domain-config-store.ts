import type { Ref } from 'vue';
import { reactive, computed } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { DomainConfigGetParameters } from '@/schema/config/domain-config/api-verbs/get';
import type { DomainConfigSetParameters } from '@/schema/config/domain-config/api-verbs/set';
import type { DomainConfigModel } from '@/schema/config/domain-config/model';

import { DOMAIN_CONFIG_NAMES } from '@/store/domain/constant';
import type { DomainConfigKey } from '@/store/domain/type';


interface UsePublicDomainConfigStoreState {
    domainConfigMap: Partial<Record<DomainConfigKey, DomainConfigModel>>;
}
type UsePublicDomainConfigStoreGetters = Record<DomainConfigKey, Ref<DomainConfigModel|undefined>>;

export const usePublicDomainConfigStore = defineStore('public-domain-config', () => {
    const state = reactive<UsePublicDomainConfigStoreState>({
        domainConfigMap: {},
    });
    const _getterObj = {} as UsePublicDomainConfigStoreGetters;
    Object.keys(DOMAIN_CONFIG_NAMES).forEach((key) => {
        _getterObj[key] = computed<DomainConfigModel|undefined>(() => state.domainConfigMap[key]);
    });
    const getters = reactive<UsePublicDomainConfigStoreGetters>(_getterObj);

    const actions = {
        async get<T extends Record<string, any> = Record<string, any>>(key: DomainConfigKey): Promise<DomainConfigModel<T>> {
            const name = DOMAIN_CONFIG_NAMES[key];
            if (state.domainConfigMap[key]) return state.domainConfigMap[key] as DomainConfigModel<T>;
            const domainConfig = await SpaceConnector.client.config.publicDomainConfig.get<DomainConfigGetParameters, DomainConfigModel<T>>({
                name,
            });
            state.domainConfigMap = { ...state.domainConfigMap, [key]: domainConfig };
            return domainConfig;
        },
        async set<T extends Record<string, any> = Record<string, any>>(key: DomainConfigKey, data: T) {
            const name = DOMAIN_CONFIG_NAMES[key];
            const domainConfig = await SpaceConnector.client.config.domainConfig.set<DomainConfigSetParameters, DomainConfigModel<T>>({
                name,
                data,
            });
            state.domainConfigMap = { ...state.domainConfigMap, [key]: domainConfig };
            return domainConfig;
        },

        reset() {
            state.domainConfigMap = {};
        },
    };

    return {
        state,
        getters,
        ...actions,
    };
});
