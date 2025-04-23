import { computed } from 'vue';

import { useDashboardTemplateApi } from '@/api-clients/repository/dashboard-template/composables/use-dashboard-template-api';
import type { DashboardTemplateListParameters } from '@/api-clients/repository/dashboard-template/schema/api-verbs/list';
import { useScopedQuery } from '@/query/composables/use-scoped-query';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

export const useDashboardTemplateQuery = () => {
    const { dashboardTemplateAPI } = useDashboardTemplateApi();
    const {
        key, params,
    } = useServiceQueryKey('repository', 'dashboard-template', 'list', {
        params: computed<DashboardTemplateListParameters>(() => ({})),
    });

    return useScopedQuery({
        queryKey: key,
        queryFn: () => dashboardTemplateAPI.list(params.value),
        select: (data) => data?.results || [],
        staleTime: 1000 * 60 * 5,
    }, ['DOMAIN', 'WORKSPACE']);
};
