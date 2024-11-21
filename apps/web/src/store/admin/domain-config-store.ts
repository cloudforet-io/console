import { reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { DomainConfigGetParameters } from '@/schema/config/domain-config/api-verbs/get';
import type { DomainConfigSetParameters } from '@/schema/config/domain-config/api-verbs/set';
import type { DomainConfigModel } from '@/schema/config/domain-config/model';

import type { DomainConfigType } from '@/store/domain/type';

interface UseDomainConfigStoreState {
    domainConfigMap: Partial<Record<DomainConfigType, DomainConfigModel>>;
}
export const useDomainConfigStore = defineStore('domain-config', () => {
    const state = reactive<UseDomainConfigStoreState>({
        domainConfigMap: {},
    });

    const actions = {
        async get(domainConfigType: DomainConfigType) {
            if (state.domainConfigMap[domainConfigType]) return state.domainConfigMap[domainConfigType];
            const domainConfig = await SpaceConnector.client.config.domainConfig.get<DomainConfigGetParameters, DomainConfigModel>({
                name: domainConfigType,
            });
            state.domainConfigMap[domainConfigType] = domainConfig;
            return domainConfig;
        },
        async set(domainConfigType: DomainConfigType, data: Record<string, any>) {
            const domainConfig = await SpaceConnector.client.config.domainConfig.set<DomainConfigSetParameters, DomainConfigModel>({
                name: domainConfigType,
                data,
            });
            state.domainConfigMap[domainConfigType] = domainConfig;
            return domainConfig;
        },

        reset() {
            state.domainConfigMap = {};
        },
    };

    return {
        state,
        ...actions,
    };
});
