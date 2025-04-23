import { asyncComputed } from '@vueuse/core';
import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import type { WebhookModel } from '@/schema/alert-manager/webhook/model';
import type { WebhookModel as WebhookModelV1 } from '@/schema/monitoring/webhook/model';

import { useAuthorizationStore } from '@/store/authorization/authorization-store';
import type {
    ReferenceItem, ReferenceLoadOptions, ReferenceMap, ReferenceTypeInfo,
} from '@/store/reference/type';

import APIClientManager from '@/lib/config/global-config/api-client-manager';
import { MANAGED_VARIABLE_MODELS } from '@/lib/variable-models/managed-model-config/base-managed-model-config';

import ErrorHandler from '@/common/composables/error/errorHandler';

export type WebhookItem = Required<Pick<ReferenceItem<WebhookModel|WebhookModelV1>, 'key'|'label'|'name'|'data'>>;
export type WebhookReferenceMap = ReferenceMap<WebhookItem>;

const LOAD_TTL = 1000 * 60 * 60 * 3; // 3 hours
let lastLoadedTime = 0;

export const useWebhookReferenceStore = defineStore('reference-webhook', () => {
    const authorizationStore = useAuthorizationStore();
    const state = reactive({
        items: null as WebhookReferenceMap | null,
    });

    const getters = reactive({
        webhookItems: asyncComputed<WebhookReferenceMap>(async () => {
            if (!authorizationStore.state.currentGrantInfo?.scope || authorizationStore.state.currentGrantInfo?.scope === 'USER') return {};
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
        const alertManagerClient = APIClientManager.alertManager;
        if (!alertManagerClient) return;
        try {
            const response = await alertManagerClient.endpoint.webhook.list({
                query: {
                    only: ['webhook_id', 'name', 'plugin_info'],
                },
            }, { timeout: 3000 });

            response.results?.forEach((webhookInfo: WebhookModel|WebhookModelV1): void => {
                referenceMap[webhookInfo.webhook_id] = {
                    key: webhookInfo.webhook_id,
                    label: webhookInfo.name,
                    name: webhookInfo.name,
                    data: webhookInfo,
                };
            });
            state.items = referenceMap;
            lastLoadedTime = currentTime;
        } catch (e) {
            ErrorHandler.handleError(e);
        }
    };

    const sync = async (webhookInfo: WebhookModel|WebhookModelV1) => {
        state.items = {
            ...state.items,
            [webhookInfo.webhook_id]: {
                key: webhookInfo.webhook_id,
                label: webhookInfo.name,
                name: webhookInfo.name,
                data: webhookInfo,
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

