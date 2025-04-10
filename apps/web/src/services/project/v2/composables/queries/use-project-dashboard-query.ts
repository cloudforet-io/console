import {
    computed, type ComputedRef,
} from 'vue';

import { useScopedQuery } from '@/api-clients/_common/composables/use-scoped-query';
import { usePublicDashboardApi } from '@/api-clients/dashboard/public-dashboard/composables/use-public-dashboard-api';
import type { PublicDashboardListParameters } from '@/api-clients/dashboard/public-dashboard/schema/api-verbs/list';
import type { PublicDashboardModel } from '@/api-clients/dashboard/public-dashboard/schema/model';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

import type { ProjectPageContextType } from '@/services/project/v2/types/project-page-context-type';

const STALE_TIME = 1000 * 60 * 5;
const GC_TIME = 1000 * 60 * 5;




export const useProjectDashboardQuery = (options: {
    projectId: ComputedRef<string|undefined>,
    projectGroupId?: ComputedRef<string|undefined>,
}) => {
    const { publicDashboardAPI } = usePublicDashboardApi();

    const projectPageContext = computed<ProjectPageContextType>(() => {
        if (options.projectGroupId?.value) {
            return 'PROJECT_GROUP';
        }
        if (options.projectId?.value) {
            return 'PROJECT';
        }
        return undefined;
    });


    /* Query Keys */
    const { key: dashboardSharedListQueryKey, params: dashboardSharedListParams } = useServiceQueryKey('dashboard', 'public-dashboard', 'list', {
        contextKey: projectPageContext.value,
        params: computed<PublicDashboardListParameters>(() => ({
            project_id: '*',
            // project_group_id: '*',
            query: {
                filter: [
                    { k: 'version', v: '1.0', o: 'not' },
                    { k: 'scope', v: 'PROJECT', o: 'eq' },
                    { k: 'shared', v: true, o: 'eq' },
                ],
            },
        })),
    });
    const { key: dashboardListQueryKey, params: dashboardListParams } = useServiceQueryKey('dashboard', 'public-dashboard', 'list', {
        contextKey: projectPageContext.value,
        params: computed<PublicDashboardListParameters>(() => ({
            project_id: options.projectId?.value,
            project_group_id: options.projectGroupId?.value,
            query: {
                filter: [
                    { k: 'version', v: '1.0', o: 'not' },
                ],
            },
        })),
    });

    /* Querys */
    const dashboardSharedListQuery = useScopedQuery({
        queryKey: dashboardSharedListQueryKey,
        queryFn: () => publicDashboardAPI.list(dashboardSharedListParams.value),
        select: (data) => data?.results ?? [],
        enabled: computed(() => !!projectPageContext.value),
        staleTime: STALE_TIME,
        gcTime: GC_TIME,
    }, ['WORKSPACE']);


    const dashboardListQuery = useScopedQuery({
        queryKey: dashboardListQueryKey,
        queryFn: () => publicDashboardAPI.list(dashboardListParams.value),
        select: (data) => data?.results ?? [],
        enabled: computed(() => !!projectPageContext.value),
        staleTime: STALE_TIME,
        gcTime: GC_TIME,
    }, ['WORKSPACE']);

    const isLoading = computed<boolean>(() => dashboardSharedListQuery.isFetching.value || dashboardListQuery.isFetching.value);

    return {
        dashboardSharedList: computed<PublicDashboardModel[]>(() => dashboardSharedListQuery.data.value ?? []),
        dashboardList: computed<PublicDashboardModel[]>(() => dashboardListQuery.data.value ?? []),
        isLoading,
    };
};

