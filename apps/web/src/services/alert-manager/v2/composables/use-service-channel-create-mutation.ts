import type { ComputedRef } from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { useServiceChannelApi } from '@/api-clients/alert-manager/service-channel/composables/use-service-channel-api';
import type { ServiceChannelCreateParameters } from '@/api-clients/alert-manager/service-channel/schema/api-verbs/create';
import type { ServiceChannelCreateForwardChannelParameters } from '@/api-clients/alert-manager/service-channel/schema/api-verbs/create-forward-channel';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

type ServiceChannelCreateParametersType = Partial<ServiceChannelCreateParameters | ServiceChannelCreateForwardChannelParameters>;

interface ServiceChannelCreateMutationOptions {
    onSuccess?: (data: unknown, variables: ServiceChannelCreateParametersType) => void | Promise<void>;
    onError?: (error: Error, variables: ServiceChannelCreateParametersType) => void | Promise<void>;
    onSettled?: (data: unknown | undefined, error: Error | null, variables: ServiceChannelCreateParametersType) => void | Promise<void>;
    isForwardTypeProtocol?: ComputedRef<boolean>;
}

export const useServiceChannelCreateMutation = (options?: ServiceChannelCreateMutationOptions) => {
    const { serviceChannelAPI } = useServiceChannelApi();
    const queryClient = useQueryClient();

    const { withSuffix: serviceGetBaseQueryKey } = useServiceQueryKey('alert-manager', 'service', 'get');
    const { key: serviceChannelListBaseQueryKey } = useServiceQueryKey('alert-manager', 'service-channel', 'list');

    return useMutation({
        mutationFn: (params: ServiceChannelCreateParametersType) => {
            if (options?.isForwardTypeProtocol?.value) {
                return serviceChannelAPI.createForwardChannel(params as ServiceChannelCreateForwardChannelParameters);
            }
            return serviceChannelAPI.create(params as ServiceChannelCreateParameters);
        },
        onSuccess: async (data, variables) => {
            const _serviceId = { service_id: variables.service_id };
            queryClient.invalidateQueries({ queryKey: serviceGetBaseQueryKey(_serviceId) });
            queryClient.invalidateQueries({ queryKey: serviceChannelListBaseQueryKey });
            showSuccessMessage(i18n.t('ALERT_MANAGER.NOTIFICATIONS.ALT_S_CREATED'), '');
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
