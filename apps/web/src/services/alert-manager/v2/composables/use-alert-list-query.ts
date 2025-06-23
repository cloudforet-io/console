import type { ComputedRef, Ref } from 'vue';
import { computed } from 'vue';

import type { QueryKey } from '@tanstack/vue-query';

import { iso8601Formatter } from '@cloudforet/utils';

import { useAlertApi } from '@/api-clients/alert-manager/alert/composables/use-alert-api';
import type { AlertListParameters } from '@/api-clients/alert-manager/alert/schema/api-verbs/list';
import { ALERT_STATUS } from '@/api-clients/alert-manager/alert/schema/constants';
import type { AlertModel } from '@/api-clients/alert-manager/alert/schema/model';
import { useScopedQuery } from '@/query/composables/use-scoped-query';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

import { useUserStore } from '@/store/user/user-store';

import { calculateTime } from '@/services/iam/composables/refined-table-data';

interface UseAlertListQueryReturn {
    alertListData: Ref<AlertModel[]>;
    alertListTotalCount: Ref<number>;
    alertListFetching: Ref<boolean>;
    alertListQueryKey: Ref<QueryKey>;
}
interface UseAlertListQueryOptions {
    params: ComputedRef<AlertListParameters>;
}

export const useAlertListQuery = ({ params }: UseAlertListQueryOptions): UseAlertListQueryReturn => {
    const userStore = useUserStore();
    const userState = userStore.state;

    const { alertAPI } = useAlertApi();

    const timezone = computed<string>(() => userState.timezone || 'UTC');

    const { key: alertListQueryKey, params: alertListQueryParams } = useServiceQueryKey('alert-manager', 'alert', 'list', {
        params: computed(() => params.value),
    });

    const { data: queryData, isFetching: alertListFetching } = useScopedQuery({
        queryKey: alertListQueryKey,
        queryFn: async () => alertAPI.list(alertListQueryParams.value),
        initialData: {
            results: [],
            total_count: 0,
        },
        gcTime: 1000 * 60 * 2,
    }, ['WORKSPACE']);

    const alertListData = computed<AlertModel[]>(() => (queryData.value?.results ?? []).map((alert) => ({
        ...alert,
        duration: alert.status === ALERT_STATUS.RESOLVED
            ? calculateTime(alert?.resolved_at, timezone.value)
            : calculateTime(alert?.created_at, timezone.value),
        created_at: iso8601Formatter(alert.created_at, timezone.value),
        resolved_at: iso8601Formatter(alert.resolved_at, timezone.value) || '-',
    })));
    const alertListTotalCount = computed<number>(() => queryData.value?.total_count ?? 0);

    return {
        alertListData,
        alertListTotalCount,
        alertListFetching,
        alertListQueryKey,
    };
};
