import { computed } from 'vue';

import { useCostReportConfigApi } from '@/api-clients/cost-analysis/cost-report-config/composables/use-cost-report-config-api';
import { ROLE_TYPE } from '@/api-clients/identity/role/constant';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

import { useAuthorizationStore } from '@/store/authorization/authorization-store';


export const useServiceAccountCostReportConfig = () => {
    const authorizationStore = useAuthorizationStore();
    const isWorkspaceMember = computed(() => authorizationStore.state.currentRoleInfo?.roleType === ROLE_TYPE.WORKSPACE_MEMBER);
    const { costReportConfigAPI } = useCostReportConfigApi();
    const { key, params } = useServiceQueryKey('cost-analysis', 'cost-report-config', 'list', {
        params: {
            query: { sort: [{ key: 'created_at', desc: false }] },
        },
    });
    return useScopedQuery({
        queryKey: key,
        queryFn: () => costReportConfigAPI.list(params.value),
        select: (data) => data.results?.[0],
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 1, // 1 minute
        enabled: isWorkspaceMember,
    }, ['DOMAIN', 'WORKSPACE']);
};
