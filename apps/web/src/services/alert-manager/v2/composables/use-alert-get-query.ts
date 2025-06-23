import type { Ref } from 'vue';
import { computed } from 'vue';

import { useAlertApi } from '@/api-clients/alert-manager/alert/composables/use-alert-api';
import type { AlertModel } from '@/api-clients/alert-manager/alert/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

interface UseAlertGetQueryReturn {
    alertData: Ref<AlertModel | undefined>;
}

export const useAlertGetQuery = (alertId: string): UseAlertGetQueryReturn => {
    const { alertAPI } = useAlertApi();

    const { key: alertQueryKey, params: alertQueryParams } = useServiceQueryKey('alert-manager', 'alert', 'get', {
        params: computed(() => ({
            alert_id: alertId,
        })),
    });

    const { data: alertData } = useScopedQuery({
        queryKey: alertQueryKey,
        queryFn: () => alertAPI.get(alertQueryParams.value),
        gcTime: 1000 * 60 * 2,
        staleTime: 1000 * 30,
    }, ['WORKSPACE']);

    return {
        alertData,
    };
};
