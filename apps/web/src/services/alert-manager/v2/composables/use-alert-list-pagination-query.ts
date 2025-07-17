import type { ComputedRef } from 'vue';
import { computed } from 'vue';


import { useQueryClient } from '@tanstack/vue-query';

import { iso8601Formatter } from '@cloudforet/utils';

import { useAlertApi } from '@/api-clients/alert-manager/alert/composables/use-alert-api';
import type { AlertListParameters } from '@/api-clients/alert-manager/alert/schema/api-verbs/list';
import { ALERT_STATUS } from '@/api-clients/alert-manager/alert/schema/constants';
import type { AlertModel } from '@/api-clients/alert-manager/alert/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedPaginationQuery } from '@/query/service-query/pagination/use-scoped-pagination-query';

import { useUserStore } from '@/store/user/user-store';

import { calculateTime } from '@/services/iam/composables/refined-table-data';

interface UseAlertListPaginationQueryOptions {
    params: ComputedRef<AlertListParameters>;
    thisPage: ComputedRef<number>;
    pageSize: ComputedRef<number>;
}

export const useAlertListPaginationQuery = ({ params, thisPage, pageSize }: UseAlertListPaginationQueryOptions) => {
    const userStore = useUserStore();
    const userState = userStore.state;
    const queryClient = useQueryClient();

    const { alertAPI } = useAlertApi();

    const timezone = computed<string>(() => userState.timezone || 'UTC');

    const { key: alertListPaginationQueryKey, params: alertListPaginationQueryParams } = useServiceQueryKey('alert-manager', 'alert', 'list', {
        params: computed(() => params.value),
        pagination: true,
    });

    const query = useScopedPaginationQuery({
        queryKey: alertListPaginationQueryKey,
        queryFn: alertAPI.list,
        params: alertListPaginationQueryParams,
        gcTime: 1000 * 60 * 2,
        staleTime: 1000 * 60 * 2,
        enabled: true,
    }, {
        thisPage,
        pageSize,
        verb: 'list',
    }, ['WORKSPACE']);


    const refresh = async () => {
        await queryClient.resetQueries({ queryKey: alertListPaginationQueryKey.value });
    };

    return {
        data: computed<AlertModel[]>(() => query.data.value?.results?.map((alert) => ({
            ...alert,
            duration: alert.status === ALERT_STATUS.RESOLVED
                ? calculateTime(alert?.resolved_at, timezone.value)
                : calculateTime(alert?.created_at, timezone.value),
            created_at: iso8601Formatter(alert.created_at, timezone.value),
            resolved_at: iso8601Formatter(alert.resolved_at, timezone.value) || '-',
        })) || []),
        totalCount: query.totalCount,
        isLoading: query.isLoading,
        refresh,
    };
};
