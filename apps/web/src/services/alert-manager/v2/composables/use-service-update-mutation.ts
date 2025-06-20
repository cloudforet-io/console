import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { useServiceApi } from '@/api-clients/alert-manager/service/composables/use-service-api';
import type { ServiceUpdateParameters } from '@/api-clients/alert-manager/service/schema/api-verbs/update';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

interface UseServiceUpdateMutationOptions {
    onSuccess?: (data: unknown, variables: ServiceUpdateParameters) => void|Promise<void>;
    onError?: (error: Error, variables: ServiceUpdateParameters) => void|Promise<void>;
    onSettled?: (data: unknown|undefined, error: Error|null, variables: ServiceUpdateParameters) => void|Promise<void>;
}

export const useServiceUpdateMutation = (options?: UseServiceUpdateMutationOptions) => {
    const { serviceAPI } = useServiceApi();
    const queryClient = useQueryClient();

    const { withSuffix: serviceQueryKey } = useServiceQueryKey('alert-manager', 'service', 'get');

    return useMutation({
        mutationFn: (params: ServiceUpdateParameters) => serviceAPI.update(params),
        onSuccess: async (data, variables) => {
            const _serviceId = { service_id: variables.service_id };
            queryClient.invalidateQueries({ queryKey: serviceQueryKey(_serviceId) });
            showSuccessMessage(i18n.t('ALERT_MANAGER.SERVICE.ALT_S_UPDATE_SERVICE'), '');
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
