import {
    useMutation, useQueryClient,
} from '@tanstack/vue-query';

import type { DashboardModel, DashboardUpdateParams } from '@/api-clients/dashboard/_types/dashboard-type';
import { usePrivateDashboardApi } from '@/api-clients/dashboard/private-dashboard/composables/use-private-dashboard-api';
import { usePublicDashboardApi } from '@/api-clients/dashboard/public-dashboard/composables/use-public-dashboard-api';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

interface UseDashboardUpdateMutationOptions {
    onSuccess?: (data: DashboardModel, variables: DashboardUpdateParams) => void|Promise<void>;
    onError?: (error: Error, variables: DashboardUpdateParams) => void|Promise<void>;
    onSettled?: (data: DashboardModel|undefined, error: Error|null, variables: DashboardUpdateParams) => void|Promise<void>;
}

export const useDashboardUpdateMutation = (options: UseDashboardUpdateMutationOptions) => {
    const { publicDashboardAPI } = usePublicDashboardApi();
    const { privateDashboardAPI } = usePrivateDashboardApi();
    const queryClient = useQueryClient();
    const { withSuffix: publicDashboardGetQueryKey } = useServiceQueryKey('dashboard', 'public-dashboard', 'get');
    const { withSuffix: privateDashboardGetQueryKey } = useServiceQueryKey('dashboard', 'private-dashboard', 'get');

    const {
        onSuccess, onError, onSettled,
    } = options;

    const updateDashboardFn = (params: DashboardUpdateParams): Promise<DashboardModel> => {
        if (!params.dashboard_id) throw new Error('Dashboard ID is not provided');
        const _isPrivate = params.dashboard_id.startsWith('private');
        const fetcher = _isPrivate ? privateDashboardAPI.update : publicDashboardAPI.update;
        return fetcher(params);
    };

    return useMutation({
        mutationFn: updateDashboardFn,
        onSuccess: async (data, variables) => {
            const _dashboardId = variables.dashboard_id;
            const _isPrivate = _dashboardId.startsWith('private');
            const dashboardListQueryKey = _isPrivate ? privateDashboardGetQueryKey(_dashboardId) : publicDashboardGetQueryKey(_dashboardId);
            queryClient.invalidateQueries({ queryKey: dashboardListQueryKey });
            if (onSuccess) await onSuccess(data, variables);
        },
        onError: (error, variables) => {
            if (onError) onError(error, variables);
        },
        onSettled: (data, error, variables) => {
            if (onSettled) onSettled(data, error, variables);
        },
    });
};
