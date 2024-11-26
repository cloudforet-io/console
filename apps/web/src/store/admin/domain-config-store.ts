import type { Ref } from 'vue';
import { reactive, computed } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { DomainConfigGetParameters } from '@/schema/config/domain-config/api-verbs/get';
import type { DomainConfigSetParameters } from '@/schema/config/domain-config/api-verbs/set';
import type { DomainConfigModel } from '@/schema/config/domain-config/model';

import { DOMAIN_CONFIG_TYPE } from '@/store/domain/constant';
import type { DomainConfigKey } from '@/store/domain/type';


interface UseDomainConfigStoreState {
    domainConfigMap: Partial<Record<DomainConfigKey, DomainConfigModel>>;
}
type UseDomainConfigStoreGetters = Record<DomainConfigKey, Ref<DomainConfigModel|undefined>>;

export const useDomainConfigStore = defineStore('domain-config', () => {
    const state = reactive<UseDomainConfigStoreState>({
        domainConfigMap: {},
    });
    const _getterObj = {} as UseDomainConfigStoreGetters;
    Object.keys(DOMAIN_CONFIG_TYPE).forEach((key) => {
        const type = DOMAIN_CONFIG_TYPE[key as DomainConfigKey];
        _getterObj[key] = computed<DomainConfigModel|undefined>(() => state.domainConfigMap[type]);
    });
    const getters = reactive<UseDomainConfigStoreGetters>(_getterObj);

    const actions = {
        async get<T extends Record<string, any> = Record<string, any>>(key: DomainConfigKey): Promise<DomainConfigModel<T>> {
            const domainConfigType = DOMAIN_CONFIG_TYPE[key];
            if (state.domainConfigMap[key]) return state.domainConfigMap[key] as DomainConfigModel<T>;
            const domainConfig = await SpaceConnector.client.config.domainConfig.get<DomainConfigGetParameters, DomainConfigModel<T>>({
                name: domainConfigType,
            });
            state.domainConfigMap[key] = domainConfig;
            return domainConfig;
        },
        async set<T extends Record<string, any> = Record<string, any>>(key: DomainConfigKey, data: T) {
            const domainConfigType = DOMAIN_CONFIG_TYPE[key];
            const domainConfig = await SpaceConnector.client.config.domainConfig.set<DomainConfigSetParameters, DomainConfigModel<T>>({
                name: domainConfigType,
                data,
            });
            state.domainConfigMap[key] = domainConfig;
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
