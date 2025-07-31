import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { useAlertApi } from '@/api-clients/alert-manager/alert/composables/use-alert-api';
import type { AlertUpdateParameters } from '@/api-clients/alert-manager/alert/schema/api-verbs/update';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

interface UseAlertUpdateMutationOptions {
    onSuccess?: (data: unknown, variables: AlertUpdateParameters) => void|Promise<void>;
    onError?: (error: Error, variables: AlertUpdateParameters) => void|Promise<void>;
    onSettled?: (data: unknown|undefined, error: Error|null, variables: AlertUpdateParameters) => void|Promise<void>;
}

export const useAlertUpdateMutation = (options?: UseAlertUpdateMutationOptions) => {
    const { alertAPI } = useAlertApi();
    const queryClient = useQueryClient();

    const { withSuffix: alertQueryKey } = useServiceQueryKey('alert-manager', 'alert', 'get');
    const { key: alertListQueryKey } = useServiceQueryKey('alert-manager', 'alert', 'list');

    return useMutation({
        mutationFn: (params: AlertUpdateParameters) => alertAPI.update(params),
        onSuccess: async (data, variables) => {
            const _alertId = { alert_id: variables.alert_id };
            queryClient.invalidateQueries({ queryKey: alertQueryKey(_alertId) });
            queryClient.invalidateQueries({ queryKey: alertListQueryKey.value });
            showSuccessMessage(i18n.t('ALERT_MANAGER.ALERTS.ALT_S_UPDATE'), '');
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
