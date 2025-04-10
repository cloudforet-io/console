import type { ComputedRef } from 'vue';

import { useMutation } from '@tanstack/vue-query';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { DashboardCreateParams, DashboardModel } from '@/api-clients/dashboard/_types/dashboard-type';
import type { WidgetModel } from '@/api-clients/dashboard/_types/widget-type';
import { usePrivateDashboardApi } from '@/api-clients/dashboard/private-dashboard/composables/use-private-dashboard-api';
import type { PrivateDashboardCreateParameters } from '@/api-clients/dashboard/private-dashboard/schema/api-verbs/create';
import { usePrivateWidgetApi } from '@/api-clients/dashboard/private-widget/composables/use-private-widget-api';
import { usePublicDashboardApi } from '@/api-clients/dashboard/public-dashboard/composables/use-public-dashboard-api';
import type { PublicDashboardCreateParameters } from '@/api-clients/dashboard/public-dashboard/schema/api-verbs/create';
import { usePublicWidgetApi } from '@/api-clients/dashboard/public-widget/composables/use-public-widget-api';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import { useUserStore } from '@/store/user/user-store';

import { getSharedDashboardLayouts } from '@/services/dashboard-shared/core/helpers/dashboard-share-helper';


interface UseDashboardCloneActionOptions {
    dashboardId: ComputedRef<string|undefined>;
    isPrivate?: ComputedRef<boolean>;
    onSuccess?: (data: DashboardModel, variables: DashboardCreateParams) => void|Promise<void>;
    onError?: (error: Error, variables: DashboardCreateParams) => void|Promise<void>;
    onSettled?: (data: DashboardModel|undefined, error: Error|null, variables: DashboardCreateParams) => void|Promise<void>;
}

export const useDashboardCloneAction = (options: UseDashboardCloneActionOptions) => {
    const { publicDashboardAPI } = usePublicDashboardApi();
    const { privateDashboardAPI } = usePrivateDashboardApi();
    const { privateWidgetAPI } = usePrivateWidgetApi();
    const { publicWidgetAPI } = usePublicWidgetApi();
    const allReferenceStore = useAllReferenceStore();
    const userStore = useUserStore();

    const {
        dashboardId, isPrivate, onSuccess, onError, onSettled,
    } = options;


    const getDashboardFn = async (): Promise<DashboardModel> => {
        if (!dashboardId.value) throw new Error('Dashboard id not found');
        try {
            if (dashboardId.value.startsWith('private')) {
                return privateDashboardAPI.get({ dashboard_id: dashboardId.value });
            }
            return publicDashboardAPI.get({ dashboard_id: dashboardId.value });
        } catch (error) {
            throw new Error('Dashboard not found');
        }
    };

    const listWidgetFn = async (): Promise<ListResponse<WidgetModel>> => {
        if (!dashboardId.value) throw new Error('Dashboard id not found');
        try {
            if (dashboardId.value.startsWith('private')) {
                return privateWidgetAPI.list({ dashboard_id: dashboardId.value });
            }
            return publicWidgetAPI.list({ dashboard_id: dashboardId.value });
        } catch (error) {
            throw new Error('Widget list not found');
        }
    };


    const cloneDashboardFn = async (params: DashboardCreateParams): Promise<DashboardModel> => {
        if (!dashboardId.value) throw new Error('Dashboard id not found');

        const dashboard = await getDashboardFn();
        const widgetList = await listWidgetFn();

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
            return privateDashboardAPI.create(_sharedDashboard as PrivateDashboardCreateParameters);
        }
        return publicDashboardAPI.create(_sharedDashboard as PublicDashboardCreateParameters);
    };

    return useMutation({
        mutationFn: cloneDashboardFn,
        onSuccess: async (data, variables) => {
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
