import type { ComputedRef } from 'vue';

import {
    useMutation, useQueryClient,
} from '@tanstack/vue-query';

import type { DashboardModel } from '@/api-clients/dashboard/_types/dashboard-type';
import { usePublicDashboardApi } from '@/api-clients/dashboard/public-dashboard/composables/use-public-dashboard-api';
import type { PublicDashboardShareParameters } from '@/api-clients/dashboard/public-dashboard/schema/api-verbs/share';
import type { PublicDashboardUnshareParameters } from '@/api-clients/dashboard/public-dashboard/schema/api-verbs/unshare';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

interface UseDashboardShareActionOptions {
    dashboardId: ComputedRef<string|undefined>;
    isShared: ComputedRef<boolean>;
    onSuccess?: (data: DashboardModel, variables: PublicDashboardShareParameters|PublicDashboardUnshareParameters) => void|Promise<void>;
    onError?: (error: Error, variables: PublicDashboardShareParameters|PublicDashboardUnshareParameters) => void|Promise<void>;
    onSettled?: (data: DashboardModel|undefined, error: Error|null, variables: PublicDashboardShareParameters|PublicDashboardUnshareParameters) => void|Promise<void>;
}

export const useDashboardShareAction = (options: UseDashboardShareActionOptions) => {
    const { publicDashboardAPI } = usePublicDashboardApi();
    const queryClient = useQueryClient();
    const { withSuffix: publicDashboardGetQueryKey } = useServiceQueryKey('dashboard', 'public-dashboard', 'get');

    const {
        dashboardId, isShared, onSuccess, onError, onSettled,
    } = options;

    const shareDashboardFn = (params: PublicDashboardShareParameters|PublicDashboardUnshareParameters): Promise<DashboardModel> => {
        if (!dashboardId.value) throw new Error('Dashboard ID is not provided');
        if (isShared.value) return publicDashboardAPI.unshare(params as PublicDashboardUnshareParameters);
        return publicDashboardAPI.share(params as PublicDashboardShareParameters);
    };

    return useMutation({
        mutationFn: shareDashboardFn,
        onSuccess: async (data, variables) => {
            const _dashboardId = variables.dashboard_id;
            queryClient.invalidateQueries({ queryKey: publicDashboardGetQueryKey(_dashboardId) });
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
