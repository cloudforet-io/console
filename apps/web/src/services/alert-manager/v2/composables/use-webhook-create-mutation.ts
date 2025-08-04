import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { useWebhookApi } from '@/api-clients/alert-manager/webhook/composables/use-webhook-api';
import type { WebhookCreateParameters } from '@/api-clients/alert-manager/webhook/schema/api-verbs/create';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

interface UseWebhookCreateMutationOptions {
    onSuccess?: (data: unknown, variables: WebhookCreateParameters) => void|Promise<void>;
    onError?: (error: Error, variables: WebhookCreateParameters) => void|Promise<void>;
    onSettled?: (data: unknown|undefined, error: Error|null, variables: WebhookCreateParameters) => void|Promise<void>;
}

export const useWebhookCreateMutation = (options?: UseWebhookCreateMutationOptions) => {
    const { webhookAPI } = useWebhookApi();
    const queryClient = useQueryClient();

    const { key: webhookListBaseQueryKey } = useServiceQueryKey('alert-manager', 'webhook', 'list');

    return useMutation({
        mutationFn: (params: WebhookCreateParameters) => webhookAPI.create(params),
        onSuccess: async (data, variables) => {
            queryClient.invalidateQueries({ queryKey: webhookListBaseQueryKey.value });
            showSuccessMessage(i18n.t('ALERT_MANAGER.WEBHOOK.ALT_S_CREATE_WEBHOOK'), '');
            if (options?.onSuccess) await options.onSuccess(data, variables);
        },
        onError: (error, variables) => {
            ErrorHandler.handleError(error, true);
            if (options?.onError) options.onError(error, variables);
        },
        onSettled: (data, error, variables) => {
            if (options?.onSettled) options.onSettled(data, error, variables);
        },
    });
};
