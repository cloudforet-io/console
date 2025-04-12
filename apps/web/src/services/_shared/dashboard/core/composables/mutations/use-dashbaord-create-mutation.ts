import type { ComputedRef } from 'vue';

import { useMutation } from '@tanstack/vue-query';

import type { DashboardCreateParams, DashboardModel } from '@/api-clients/dashboard/_types/dashboard-type';
import { usePrivateDashboardApi } from '@/api-clients/dashboard/private-dashboard/composables/use-private-dashboard-api';
import type { PrivateDashboardCreateParameters } from '@/api-clients/dashboard/private-dashboard/schema/api-verbs/create';
import { usePublicDashboardApi } from '@/api-clients/dashboard/public-dashboard/composables/use-public-dashboard-api';
import type { PublicDashboardCreateParameters } from '@/api-clients/dashboard/public-dashboard/schema/api-verbs/create';

interface UseDashboardCreateMutationOptions {
    isPrivate?: ComputedRef<boolean>;
    onSuccess?: (data: DashboardModel, variables: DashboardCreateParams) => void|Promise<void>;
    onError?: (error: Error, variables: DashboardCreateParams) => void|Promise<void>;
    onSettled?: (data: DashboardModel|undefined, error: Error|null, variables: DashboardCreateParams) => void|Promise<void>;
}

export const useDashboardCreateMutation = (options: UseDashboardCreateMutationOptions) => {
    const { publicDashboardAPI } = usePublicDashboardApi();
    const { privateDashboardAPI } = usePrivateDashboardApi();

    const {
        isPrivate, onSuccess, onError, onSettled,
    } = options;

    const createDashboardFn = async (params: DashboardCreateParams): Promise<DashboardModel> => {
        if (isPrivate?.value) {
            return privateDashboardAPI.create(params as PrivateDashboardCreateParameters);
        }
        return publicDashboardAPI.create(params as PublicDashboardCreateParameters);
    };

    return useMutation({
        mutationFn: createDashboardFn,
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
};
