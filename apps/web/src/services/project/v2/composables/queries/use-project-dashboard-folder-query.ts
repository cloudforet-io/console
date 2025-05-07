import {
    computed, type ComputedRef,
} from 'vue';

import { useQueryClient } from '@tanstack/vue-query';

import { usePublicFolderApi } from '@/api-clients/dashboard/public-folder/composables/use-public-folder-api';
import type { PublicFolderListParameters } from '@/api-clients/dashboard/public-folder/schema/api-verbs/list';
import type { PublicFolderModel } from '@/api-clients/dashboard/public-folder/schema/model';
import { useScopedQuery } from '@/query/composables/use-scoped-query';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

import { useProjectPageContext } from '@/services/project/v2/composables/use-proejct-page-context';

const STALE_TIME = 1000 * 60 * 5;
const GC_TIME = 1000 * 60 * 5;




export const useProjectDashboardFolderQuery = (options: {
    projectId?: ComputedRef<string|undefined>,
    projectGroupId?: ComputedRef<string|undefined>,
}) => {
    const { publicFolderAPI } = usePublicFolderApi();
    const queryClient = useQueryClient();

    const projectPageContext = useProjectPageContext({
        projectGroupId: options.projectGroupId,
        projectId: options.projectId,
    });

    /* Query Keys */
    const { key: dashboardFolderSharedListQueryKey, params: dashboardFolderSharedListParams } = useServiceQueryKey('dashboard', 'public-folder', 'list', {
        contextKey: projectPageContext.value,
        params: computed<PublicFolderListParameters>(() => ({
            project_id: '*',
            // project_group_id: '*',
            query: {
                filter: [
                    { k: 'scope', v: 'PROJECT', o: 'eq' },
                    { k: 'shared', v: true, o: 'eq' },
                ],
            },
        })),
    });
    const { key: dashboardFolderListQueryKey, params: dashboardFolderListParams } = useServiceQueryKey('dashboard', 'public-folder', 'list', {
        contextKey: projectPageContext.value,
        params: computed<PublicFolderListParameters>(() => ({
            project_id: options.projectId?.value,
            project_group_id: options.projectGroupId?.value,
        })),
    });

    /* Querys */
    const dashboardFolderSharedListQuery = useScopedQuery({
        queryKey: dashboardFolderSharedListQueryKey,
        queryFn: () => publicFolderAPI.list(dashboardFolderSharedListParams.value),
        select: (data) => data?.results ?? [],
        enabled: computed(() => !!projectPageContext.value),
        staleTime: STALE_TIME,
        gcTime: GC_TIME,
    }, ['WORKSPACE']);


    const dashboardFolderListQuery = useScopedQuery({
        queryKey: dashboardFolderListQueryKey,
        queryFn: () => publicFolderAPI.list(dashboardFolderListParams.value),
        select: (data) => data?.results ?? [],
        enabled: computed(() => !!projectPageContext.value),
        staleTime: STALE_TIME,
        gcTime: GC_TIME,
    }, ['WORKSPACE']);

    const isLoading = computed<boolean>(() => dashboardFolderSharedListQuery.isFetching.value || dashboardFolderListQuery.isFetching.value);

    const setQueryData = (newData: PublicFolderModel[]) => {
        queryClient.setQueryData(dashboardFolderListQueryKey.value, {
            results: [...(dashboardFolderListQuery.data.value ?? []), ...newData],
        });
    };

    const invalidateAllQueries = () => {
        queryClient.invalidateQueries({ queryKey: dashboardFolderListQueryKey.value });
    };

    return {
        dashboardFolderSharedList: computed<PublicFolderModel[]>(() => dashboardFolderSharedListQuery.data.value ?? []),
        dashboardFolderList: computed<PublicFolderModel[]>(() => dashboardFolderListQuery.data.value ?? []),
        isLoading,
        setQueryData,
        invalidateAllQueries,
    };
};

