import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { DashboardCreateParams, DashboardModel } from '@/api-clients/dashboard/_types/dashboard-type';
import type { WidgetModel } from '@/api-clients/dashboard/_types/widget-type';
import { usePrivateDashboardApi } from '@/api-clients/dashboard/private-dashboard/composables/use-private-dashboard-api';
import { usePrivateWidgetApi } from '@/api-clients/dashboard/private-widget/composables/use-private-widget-api';
import { usePublicDashboardApi } from '@/api-clients/dashboard/public-dashboard/composables/use-public-dashboard-api';
import { usePublicWidgetApi } from '@/api-clients/dashboard/public-widget/composables/use-public-widget-api';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import { useUserStore } from '@/store/user/user-store';

import { useDashboardCreateMutation } from '@/services/_shared/dashboard/core/composables/mutations/use-dashbaord-create-mutation';
import { getSharedDashboardLayouts } from '@/services/_shared/dashboard/core/helpers/dashboard-layout-template-helper';

interface UseDashboardCloneMutationOptions {
    isPrivate?: ComputedRef<boolean>;
    onSuccess?: (data: DashboardModel, variables: DashboardCreateParams) => void|Promise<void>;
    onError?: (error: Error, variables: DashboardCreateParams) => void|Promise<void>;
    onSettled?: (data: DashboardModel|undefined, error: Error|null, variables: DashboardCreateParams) => void|Promise<void>;
}

export const useDashboardCloneMutation = (options: UseDashboardCloneMutationOptions) => {
    const { publicDashboardAPI } = usePublicDashboardApi();
    const { privateDashboardAPI } = usePrivateDashboardApi();
    const { privateWidgetAPI } = usePrivateWidgetApi();
    const { publicWidgetAPI } = usePublicWidgetApi();
    const allReferenceStore = useAllReferenceStore();
    const userStore = useUserStore();

    const {
        isPrivate, onSuccess, onError, onSettled,
    } = options;


    const dashboardCreateMutation = useDashboardCreateMutation({
        isPrivate,
        onSuccess: async (data, variables) => {
            if (onSuccess) await onSuccess(data, variables);
        },
        onError: async (error, variables) => {
            if (onError) await onError(error, variables);
        },
        onSettled: async (data, error, variables) => {
            if (onSettled) await onSettled(data, error, variables);
        },
    });


    const _getDashboardFn = async (dashboardId: string): Promise<DashboardModel> => {
        if (!dashboardId) throw new Error('Dashboard id not found');
        try {
            if (dashboardId.startsWith('private')) {
                return privateDashboardAPI.get({ dashboard_id: dashboardId });
            }
            return publicDashboardAPI.get({ dashboard_id: dashboardId });
        } catch (error) {
            throw new Error('Dashboard not found');
        }
    };

    const _listWidgetFn = async (dashboardId: string): Promise<ListResponse<WidgetModel>> => {
        if (!dashboardId) throw new Error('Dashboard id not found');
        try {
            if (dashboardId.startsWith('private')) {
                return privateWidgetAPI.list({ dashboard_id: dashboardId });
            }
            return publicWidgetAPI.list({ dashboard_id: dashboardId });
        } catch (error) {
            throw new Error('Widget list not found');
        }
    };


    const cloneDashboardFn = async (params: DashboardCreateParams, dashboardId?: string): Promise<DashboardModel> => {
        if (!dashboardId) throw new Error('Dashboard id not found');

        const dashboard = await _getDashboardFn(dashboardId);
        const widgetList = await _listWidgetFn(dashboardId);

        const _sharedLayouts = await getSharedDashboardLayouts(dashboard.layouts, widgetList.results || [], allReferenceStore.getters.costDataSource);

        const _sharedDashboard: DashboardCreateParams = {
            ...params,
            layouts: _sharedLayouts,
            options: dashboard.options || {},
            labels: dashboard.labels || [],
            tags: { created_by: userStore.state.userId },
            vars: dashboard.vars,
            vars_schema: dashboard.vars_schema,
        };

        if (isPrivate?.value) {
            return dashboardCreateMutation.mutateAsync(_sharedDashboard);
        }
        return dashboardCreateMutation.mutateAsync(_sharedDashboard);
    };

    return {
        mutate: cloneDashboardFn,
        isPending: computed(() => dashboardCreateMutation.isPending.value),
    };
};
