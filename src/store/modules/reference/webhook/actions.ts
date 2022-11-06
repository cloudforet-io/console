import type { Action } from 'vuex';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { REFERENCE_LOAD_TTL } from '@/store/modules/reference/config';
import type { ReferenceLoadOptions } from '@/store/modules/reference/type';
import type { WebhookReferenceMap, WebhookReferenceState } from '@/store/modules/reference/webhook/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

let lastLoadedTime = 0;

export const load: Action<WebhookReferenceState, any> = async ({ state, commit }, options: ReferenceLoadOptions): Promise<void|Error> => {
    const currentTime = new Date().getTime();

    if (
        ((options?.lazyLoad && state.items)
        || (lastLoadedTime !== 0 && currentTime - lastLoadedTime < REFERENCE_LOAD_TTL)
        ) && !options?.force
    ) return;
    lastLoadedTime = currentTime;

    try {
        const response = await SpaceConnector.client.monitoring.webhook.list({
            query: {
                only: ['webhook_id', 'name'],
            },
        }, { timeout: 3000 });
        const webhooks: WebhookReferenceMap = {};

        response.results.forEach((webhookInfo: any): void => {
            webhooks[webhookInfo.webhook_id] = {
                key: webhookInfo.webhook_id,
                label: webhookInfo.name,
                name: webhookInfo.name,
            };
        });

        commit('setWebhooks', webhooks);
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

export const sync: Action<WebhookReferenceState, any> = ({ state, commit }, webhookInfo): void => {
    const webhooks: WebhookReferenceMap = {
        ...state.items,
        [webhookInfo.webhook_id]: {
            key: webhookInfo.webhook_id,
            label: webhookInfo.name,
            name: webhookInfo.name,
        },
    };
    commit('setWebhooks', webhooks);
};
