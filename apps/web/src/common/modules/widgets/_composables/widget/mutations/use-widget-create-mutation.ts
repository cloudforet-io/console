import { useMutation, useQueryClient } from '@tanstack/vue-query';

import type { WidgetCreateParams, WidgetModel } from '@/api-clients/dashboard/_types/widget-type';
import { usePrivateWidgetApi } from '@/api-clients/dashboard/private-widget/composables/use-private-widget-api';
import { usePublicWidgetApi } from '@/api-clients/dashboard/public-widget/composables/use-public-widget-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';

interface UseWidgetCreateMutationOptions {
    onSuccess?: (data: WidgetModel, variables: WidgetCreateParams) => Promise<void> | void;
    onError?: (error: Error, variables: WidgetCreateParams) => Promise<void> | void;
    onSettled?: (data: WidgetModel|undefined, error: Error | null, variables: WidgetCreateParams) => Promise<void> | void;
}

export const useWidgetCreateMutation = ({
    onSuccess,
    onError,
    onSettled,
}: UseWidgetCreateMutationOptions) => {
    const queryClient = useQueryClient();
    const { publicWidgetAPI } = usePublicWidgetApi();
    const { privateWidgetAPI } = usePrivateWidgetApi();

    const { withSuffix: privateWidgetListWithSuffix } = useServiceQueryKey('dashboard', 'private-widget', 'list');
    const { withSuffix: publicWidgetListWithSuffix } = useServiceQueryKey('dashboard', 'public-widget', 'list');

    const widgetCreateFn = (params: WidgetCreateParams): Promise<WidgetModel> => {
        if (!params.dashboard_id) {
            throw new Error('dashboardId is undefined');
        }
        if (params.dashboard_id.startsWith('private')) {
            return privateWidgetAPI.create(params);
        }
        return publicWidgetAPI.create(params);
    };

    return useMutation({
        mutationFn: widgetCreateFn,
        onSuccess: async (data, variables) => {
            const _isPrivate = variables.dashboard_id.startsWith('private');
            const widgetListQueryKey = _isPrivate ? privateWidgetListWithSuffix(variables.dashboard_id) : publicWidgetListWithSuffix(variables.dashboard_id);
            await queryClient.invalidateQueries({ queryKey: widgetListQueryKey });
            if (onSuccess) await onSuccess(data, variables);
        },
        onError: async (error, variables) => {
            if (onError) await onError(error, variables);
        },
        onSettled: async (data, error, variables) => {
            if (onSettled) await onSettled(data, error, variables);
        },
    });
};
