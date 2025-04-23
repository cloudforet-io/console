import { asyncComputed } from '@vueuse/core';
import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { SecretListParameters } from '@/schema/secret/secret/api-verbs/list';
import type { SecretModel } from '@/schema/secret/secret/model';

import { useAuthorizationStore } from '@/store/authorization/authorization-store';
import type {
    ReferenceItem, ReferenceLoadOptions, ReferenceMap, ReferenceTypeInfo,
} from '@/store/reference/type';

import { MANAGED_VARIABLE_MODELS } from '@/lib/variable-models/managed-model-config/base-managed-model-config';

import ErrorHandler from '@/common/composables/error/errorHandler';

export type SecretItem = Required<Pick<ReferenceItem<SecretModel>, 'key'|'label'|'name'>>;
export type SecretReferenceMap = ReferenceMap<SecretItem>;

const LOAD_TTL = 1000 * 60 * 60 * 3; // 3 hours
let lastLoadedTime = 0;

export const useSecretReferenceStore = defineStore('reference-secret', () => {
    const authorizationStore = useAuthorizationStore();
    const state = reactive({
        items: null as SecretReferenceMap | null,
    });

    const getters = reactive({
        secretItems: asyncComputed<SecretReferenceMap>(async () => {
            if (!authorizationStore.state.currentGrantInfo?.scope || authorizationStore.state.currentGrantInfo?.scope === 'USER') return {};
            if (state.items === null) await load();
            return state.items ?? {};
        }, {}, { lazy: true }),
        secretTypeInfo: computed<ReferenceTypeInfo>(() => ({
            type: MANAGED_VARIABLE_MODELS.secret.meta.key,
            key: MANAGED_VARIABLE_MODELS.secret.meta.idKey as string,
            name: MANAGED_VARIABLE_MODELS.secret.meta.name,
            referenceMap: getters.secretItems,
        })),
    });

    const load = async (options?: ReferenceLoadOptions) => {
        const currentTime = new Date().getTime();

        if (
            ((lastLoadedTime !== 0 && currentTime - lastLoadedTime < LOAD_TTL)
                || (options?.lazyLoad && state.items)
            ) && !options?.force
        ) return;

        const referenceMap: SecretReferenceMap = {};
        try {
            const response = await SpaceConnector.clientV2.secret.secret.list<SecretListParameters, ListResponse<SecretModel>>({
                query: {
                    only: ['secret_id', 'name'],
                },
            }, { timeout: 3000 });

            response.results?.forEach((secretInfo: any): void => {
                referenceMap[secretInfo.secret_id] = {
                    key: secretInfo.secret_id,
                    label: secretInfo.name,
                    name: secretInfo.name,
                };
            });
            state.items = referenceMap;
            lastLoadedTime = currentTime;
        } catch (e) {
            ErrorHandler.handleError(e);
        }
    };

    const sync = async (secretInfo: SecretModel) => {
        state.items = {
            ...state.items,
            [secretInfo.secret_id]: {
                key: secretInfo.secret_id,
                label: secretInfo.name,
                name: secretInfo.name,
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

