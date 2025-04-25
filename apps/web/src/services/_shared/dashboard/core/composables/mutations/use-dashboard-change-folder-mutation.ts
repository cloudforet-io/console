import {
    useMutation, useQueryClient,
} from '@tanstack/vue-query';

import type { DashboardChangeFolderParams, DashboardModel } from '@/api-clients/dashboard/_types/dashboard-type';
import { usePrivateDashboardApi } from '@/api-clients/dashboard/private-dashboard/composables/use-private-dashboard-api';
import { usePublicDashboardApi } from '@/api-clients/dashboard/public-dashboard/composables/use-public-dashboard-api';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

interface UseDashboardChangeFolderMutationOptions {
    onSuccess?: (data: DashboardModel, variables: DashboardChangeFolderParams) => void|Promise<void>;
    onError?: (error: Error, variables: DashboardChangeFolderParams) => void|Promise<void>;
    onSettled?: (data: DashboardModel|undefined, error: Error|null, variables: DashboardChangeFolderParams) => void|Promise<void>;
}

export const useDashboardChangeFolderMutation = (options: UseDashboardChangeFolderMutationOptions) => {
    const { publicDashboardAPI } = usePublicDashboardApi();
    const { privateDashboardAPI } = usePrivateDashboardApi();
    const queryClient = useQueryClient();
    const { withSuffix: publicDashboardGetQueryKey } = useServiceQueryKey('dashboard', 'public-dashboard', 'get');
    const { withSuffix: privateDashboardGetQueryKey } = useServiceQueryKey('dashboard', 'private-dashboard', 'get');

    const {
        onSuccess, onError, onSettled,
    } = options;

    const changeFolderFn = (params: DashboardChangeFolderParams): Promise<DashboardModel> => {
        if (!params.dashboard_id) throw new Error('Dashboard ID is not provided');
        const _isPrivate = params.dashboard_id.startsWith('private');
        const fetcher = _isPrivate ? privateDashboardAPI.changeFolder : publicDashboardAPI.changeFolder;
        return fetcher(params);
    };

    return useMutation({
        mutationFn: changeFolderFn,
        onSuccess: async (data, variables) => {
            const _dashboardId = variables.dashboard_id;
            const _isPrivate = _dashboardId.startsWith('private');
            const dashboardGetQueryKey = _isPrivate ? privateDashboardGetQueryKey(_dashboardId) : publicDashboardGetQueryKey(_dashboardId);
            queryClient.invalidateQueries({ queryKey: dashboardGetQueryKey });
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
