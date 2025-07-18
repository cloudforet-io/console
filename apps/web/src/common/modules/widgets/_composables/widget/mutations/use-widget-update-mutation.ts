import { useMutation, useQueryClient } from '@tanstack/vue-query';

import type { WidgetModel, WidgetUpdateParams } from '@/api-clients/dashboard/_types/widget-type';
import { usePrivateWidgetApi } from '@/api-clients/dashboard/private-widget/composables/use-private-widget-api';
import { usePublicWidgetApi } from '@/api-clients/dashboard/public-widget/composables/use-public-widget-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';

interface UseWidgetUpdateMutationOptions {
    onSuccess?: (data: WidgetModel, variables: WidgetUpdateParams) => Promise<void> | void;
    onError?: (error: Error, variables: WidgetUpdateParams) => Promise<void> | void;
    onSettled?: (data: WidgetModel|undefined, error: Error | null, variables: WidgetUpdateParams) => Promise<void> | void;
}

export const useWidgetUpdateMutation = ({
    onSuccess,
    onError,
    onSettled,
}: UseWidgetUpdateMutationOptions) => {
    const queryClient = useQueryClient();
    const { publicWidgetAPI } = usePublicWidgetApi();
    const { privateWidgetAPI } = usePrivateWidgetApi();

    const { withSuffix: privateWidgetListWithSuffix } = useServiceQueryKey('dashboard', 'private-widget', 'list');
    const { withSuffix: publicWidgetListWithSuffix } = useServiceQueryKey('dashboard', 'public-widget', 'list');
    const { withSuffix: privateWidgetGetQueryKey } = useServiceQueryKey('dashboard', 'private-widget', 'get');
    const { withSuffix: publicWidgetGetQueryKey } = useServiceQueryKey('dashboard', 'public-widget', 'get');

    const widgetUpdateFn = (params: WidgetUpdateParams): Promise<WidgetModel> => {
        if (!params.widget_id) {
            throw new Error('widgetId is undefined');
        }
        if (params.widget_id.startsWith('private')) {
            return privateWidgetAPI.update(params);
        }
        return publicWidgetAPI.update(params);
    };

    return useMutation({
        mutationFn: widgetUpdateFn,
        onSuccess: async (data, variables) => {
            const _isPrivate = variables.widget_id.startsWith('private');

            /* Update Widget List Query */
            const widgetListQueryKey = _isPrivate ? privateWidgetListWithSuffix(data.dashboard_id) : publicWidgetListWithSuffix(data.dashboard_id);
            await queryClient.invalidateQueries({ queryKey: widgetListQueryKey });

            /* Update Widget Get Query */
            await queryClient.invalidateQueries({ queryKey: _isPrivate ? privateWidgetGetQueryKey(data.widget_id) : publicWidgetGetQueryKey(data.widget_id) });
            if (onSuccess) onSuccess(data, variables);
        },
        onError: (error, variables) => {
            if (onError) onError(error, variables);
        },
        onSettled: (data, error, variables) => {
            if (onSettled) onSettled(data, error, variables);
        },
    });
};
