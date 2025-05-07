import { asyncComputed } from '@vueuse/core';
import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import type { ServiceListParameters } from '@/schema/alert-manager/service/api-verbs/list';
import type { ServiceModel } from '@/schema/alert-manager/service/model';

import { useAuthorizationStore } from '@/store/authorization/authorization-store';
import type {
    ReferenceLoadOptions, ReferenceItem, ReferenceMap,
    ReferenceTypeInfo,
} from '@/store/reference/type';

import APIClientManager from '@/lib/config/global-config/api-client-manager';
import { MANAGED_VARIABLE_MODELS } from '@/lib/variable-models/managed-model-config/base-managed-model-config';

import ErrorHandler from '@/common/composables/error/errorHandler';

export type ServiceItem = Required<Pick<ReferenceItem<ServiceModel>, 'key'|'label'|'name'|'data'>>;
export type ServiceReferenceMap = ReferenceMap<ServiceItem>;

const LOAD_TTL = 1000 * 60 * 60 * 3; // 3 hours
let lastLoadedTime = 0;

export const useServiceReferenceStore = defineStore('reference-service', () => {
    const authorizationStore = useAuthorizationStore();

    const state = reactive({
        items: null as ServiceReferenceMap | null,
    });

    const getters = reactive({
        serviceItems: asyncComputed<ServiceReferenceMap>(async () => {
            if (!authorizationStore.state.currentGrantInfo?.scope || authorizationStore.state.currentGrantInfo?.scope === 'USER') return {};
            if (state.items === null) await load();
            return state.items ?? {};
        }, {}, { lazy: true }),
        serviceTypeInfo: computed<ReferenceTypeInfo>(() => ({
            type: MANAGED_VARIABLE_MODELS.service.meta.key,
            key: MANAGED_VARIABLE_MODELS.service.meta.idKey,
            name: MANAGED_VARIABLE_MODELS.service.meta.name,
            referenceMap: getters.serviceItems,
        })),
    });

    const load = async (options?: ReferenceLoadOptions) => {
        const currentTime = new Date().getTime();

        if (
            ((lastLoadedTime !== 0 && currentTime - lastLoadedTime < LOAD_TTL)
                || (options?.lazyLoad && state.items)
            ) && !options?.force
        ) return;

        const params: ServiceListParameters = {
            query: {
                only: ['name', 'service_id', 'service_key', 'members'],
            },
        };

        const alertManagerClient = APIClientManager.alertManager;
        if (!alertManagerClient) return;
        try {
            const { results } = await alertManagerClient.endpoint.service.list(params);

            const serviceReferenceMap: ServiceReferenceMap = {};

            results?.forEach((service) => {
                serviceReferenceMap[service.service_id] = {
                    key: service.service_key,
                    label: service.name,
                    name: service.service_id,
                    data: service,
                };
            });

            state.items = serviceReferenceMap;
            lastLoadedTime = currentTime;
        } catch (e) {
            ErrorHandler.handleError(e);
        }
    };

    const sync = async (service: ServiceModel) => {
        state.items = {
            ...state.items,
            [service.service_id]: {
                key: service.service_key,
                label: service.name,
                name: service.service_id,
                data: service,
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

