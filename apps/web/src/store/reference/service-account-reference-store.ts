import { asyncComputed } from '@vueuse/core';
import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { ServiceAccountListParameters } from '@/schema/identity/service-account/api-verbs/list';
import type { ServiceAccountModel } from '@/schema/identity/service-account/model';
// eslint-disable-next-line import/no-cycle
import { store } from '@/store';

import type {
    ReferenceLoadOptions, ReferenceItem, ReferenceMap, ReferenceTypeInfo,
} from '@/store/reference/type';

import { MANAGED_VARIABLE_MODEL_CONFIGS } from '@/lib/variable-models/managed';

import ErrorHandler from '@/common/composables/error/errorHandler';


export type ServiceAccountItem = Required<Pick<ReferenceItem<{
    account_id?: string;
    subscription_id?: string;
    project_id?: string;
}>, 'key'|'label'|'name'|'provider'|'data'>>;
export type ServiceAccountReferenceMap = ReferenceMap<ServiceAccountItem>;

const LOAD_TTL = 1000 * 60 * 60 * 3; // 3 hours
let lastLoadedTime = 0;

export const useServiceAccountReferenceStore = defineStore('reference-service-account', () => {
    const state = reactive({
        items: null as ServiceAccountReferenceMap | null,
    });

    const getters = reactive({
        serviceAccountItems: asyncComputed<ServiceAccountReferenceMap>(async () => {
            if (store.getters['user/getCurrentGrantInfo'].scope === 'USER') return {};
            if (state.items === null) await load();
            return state.items ?? {};
        }, {}, { lazy: true }),
        serviceAccountTypeInfo: computed<ReferenceTypeInfo>(() => ({
            type: MANAGED_VARIABLE_MODEL_CONFIGS.service_account.key,
            key: MANAGED_VARIABLE_MODEL_CONFIGS.service_account.idKey as string,
            name: MANAGED_VARIABLE_MODEL_CONFIGS.service_account.name,
            referenceMap: getters.serviceAccountItems,
        })),
    });

    const load = async (options?: ReferenceLoadOptions) => {
        const currentTime = new Date().getTime();

        if (
            ((lastLoadedTime !== 0 && currentTime - lastLoadedTime < LOAD_TTL)
                || (options?.lazyLoad && state.items)
            ) && !options?.force
        ) return;

        const referenceMap: ServiceAccountReferenceMap = {};
        try {
            const response = await SpaceConnector.clientV2.identity.serviceAccount.list<ServiceAccountListParameters, ListResponse<ServiceAccountModel>>({
                query: {
                    only: ['service_account_id', 'name', 'provider', 'data'],
                },
            }, { timeout: 3000 });

            response.results?.forEach((serviceAccountInfo: any): void => {
                referenceMap[serviceAccountInfo.service_account_id] = {
                    key: serviceAccountInfo.service_account_id,
                    label: serviceAccountInfo.name,
                    name: serviceAccountInfo.name,
                    provider: serviceAccountInfo.provider,
                    data: serviceAccountInfo.data,
                };
            });
            state.items = referenceMap;
            lastLoadedTime = currentTime;
        } catch (e) {
            ErrorHandler.handleError(e);
        }
    };

    const sync = async (serviceAccountInfo: ServiceAccountModel) => {
        state.items = {
            ...state.items,
            [serviceAccountInfo.service_account_id]: {
                key: serviceAccountInfo.service_account_id,
                label: serviceAccountInfo.name,
                name: serviceAccountInfo.name,
                provider: serviceAccountInfo.provider,
                data: serviceAccountInfo.data,
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

