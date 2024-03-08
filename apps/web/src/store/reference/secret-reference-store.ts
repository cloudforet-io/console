import { asyncComputed } from '@vueuse/core';
import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { SecretListParameters } from '@/schema/secret/secret/api-verbs/list';
import type { SecretModel } from '@/schema/secret/secret/model';
import { store } from '@/store';

import type {
    ReferenceLoadOptions, ReferenceItem, ReferenceMap, ReferenceTypeInfo,
} from '@/store/modules/reference/type';

import { MANAGED_VARIABLE_MODEL_CONFIGS } from '@/lib/variable-models/managed';

import ErrorHandler from '@/common/composables/error/errorHandler';


export type SecretItem = Required<Pick<ReferenceItem<SecretModel>, 'key'|'label'|'name'>>;
export type SecretReferenceMap = ReferenceMap<SecretItem>;

const LOAD_TTL = 1000 * 60 * 60 * 3; // 3 hours
let lastLoadedTime = 0;

export const useSecretReferenceStore = defineStore('secret-reference', () => {
    const state = reactive({
        items: null as SecretReferenceMap | null,
    });

    const getters = reactive({
        secretItems: asyncComputed<SecretReferenceMap>(async () => {
            if (store.getters['user/getCurrentGrantInfo'].scope === 'USER') return {};
            if (state.items === null) await load();
            return state.items ?? {};
        }, {}, { lazy: true }),
        secretTypeInfo: computed<ReferenceTypeInfo>(() => ({
            type: MANAGED_VARIABLE_MODEL_CONFIGS.secret.key,
            key: MANAGED_VARIABLE_MODEL_CONFIGS.secret.idKey as string,
            name: MANAGED_VARIABLE_MODEL_CONFIGS.secret.name,
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

