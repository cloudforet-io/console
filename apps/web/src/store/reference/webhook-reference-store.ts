import { asyncComputed } from '@vueuse/core';
import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { WebhookListParameters } from '@/schema/monitoring/webhook/api-verbs/list';
import type { WebhookModel } from '@/schema/monitoring/webhook/model';
// eslint-disable-next-line import/no-cycle
import { store } from '@/store';

import type {
    ReferenceItem, ReferenceLoadOptions, ReferenceMap, ReferenceTypeInfo,
} from '@/store/reference/type';

import { MANAGED_VARIABLE_MODELS } from '@/lib/variable-models/managed-model-config/base-managed-model-config';

import ErrorHandler from '@/common/composables/error/errorHandler';


export type WebhookItem = Required<Pick<ReferenceItem<WebhookModel>, 'key'|'label'|'name'>>;
export type WebhookReferenceMap = ReferenceMap<WebhookItem>;

const LOAD_TTL = 1000 * 60 * 60 * 3; // 3 hours
let lastLoadedTime = 0;

export const useWebhookReferenceStore = defineStore('reference-webhook', () => {
    const state = reactive({
        items: null as WebhookReferenceMap | null,
    });

    const getters = reactive({
        webhookItems: asyncComputed<WebhookReferenceMap>(async () => {
            if (store.getters['user/getCurrentGrantInfo'].scope === 'USER') return {};
            if (state.items === null) await load();
            return state.items ?? {};
        }, {}, { lazy: true }),
        webhookTypeInfo: computed<ReferenceTypeInfo>(() => ({
            type: MANAGED_VARIABLE_MODELS.webhook.meta.key,
            key: MANAGED_VARIABLE_MODELS.webhook.meta.idKey,
            name: MANAGED_VARIABLE_MODELS.webhook.meta.name,
            referenceMap: getters.webhookItems,
        })),
    });

    const load = async (options?: ReferenceLoadOptions) => {
        const currentTime = new Date().getTime();

        if (
            ((lastLoadedTime !== 0 && currentTime - lastLoadedTime < LOAD_TTL)
                || (options?.lazyLoad && state.items)
            ) && !options?.force
        ) return;

        const referenceMap: WebhookReferenceMap = {};
        try {
            const response = await SpaceConnector.clientV2.monitoring.webhook.list<WebhookListParameters, ListResponse<WebhookModel>>({
                query: {
                    only: ['webhook_id', 'name'],
                },
            }, { timeout: 3000 });

            response.results?.forEach((webhookInfo: any): void => {
                referenceMap[webhookInfo.webhook_id] = {
                    key: webhookInfo.webhook_id,
                    label: webhookInfo.name,
                    name: webhookInfo.name,
                };
            });
            state.items = referenceMap;
            lastLoadedTime = currentTime;
        } catch (e) {
            ErrorHandler.handleError(e);
        }
    };

    const sync = async (webhookInfo: WebhookModel) => {
        state.items = {
            ...state.items,
            [webhookInfo.webhook_id]: {
                key: webhookInfo.webhook_id,
                label: webhookInfo.name,
                name: webhookInfo.name,
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

