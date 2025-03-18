import type { ComputedRef } from 'vue';

import { usePublicDashboardApi } from '@/api-clients/dashboard/public-dashboard/composables/use-public-dashboard-api';
import type { PublicDashboardModel } from '@/api-clients/dashboard/public-dashboard/schema/model';
import { useReferenceQuery } from '@/query/_composables/use-reference-query';
import { useReferenceQueryKey } from '@/query/reference/_composables/use-reference-query-key';
import type { ReferenceItem, ReferenceMap } from '@/query/reference/_types/reference-query-type';

interface PublicDashboardResourceItemData {
    resourceGroup?: PublicDashboardModel['resource_group'];
    projectId?: string;
    folderId?: string;
    shared?: boolean;
    scope?: string;
}
export type PublicDashboardReferenceItem = Required<Pick<ReferenceItem<PublicDashboardResourceItemData>, 'key'|'label'|'name'|'data'>>;
export type PublicDashboardReferenceMap = ReferenceMap<PublicDashboardReferenceItem>;



export const usePublicDashboardReferenceQuery = () => {
    const queryKey = useReferenceQueryKey();
    const { publicDashboardAPI } = usePublicDashboardApi();

    const queryFn = () => publicDashboardAPI.list({
        query: {
            only: ['dashboard_id', 'name', 'project_id', 'resource_group', 'shared', 'scope', 'folder_id'],
        },
    });

    return useReferenceQuery({
        queryKey: queryKey.value.publicDashboard,
        queryFn,
        select: (data) => {
            const referenceMap: PublicDashboardReferenceMap = {};
            data.results?.forEach((dashboard) => {
                referenceMap[dashboard.dashboard_id] = {
                    key: dashboard.dashboard_id,
                    label: dashboard.name,
                    name: dashboard.name,
                    data: {
                        resourceGroup: dashboard.resource_group,
                        projectId: dashboard.project_id,
                        folderId: dashboard.folder_id,
                        shared: dashboard.shared,
                        scope: dashboard.scope,
                    },
                };
            });
            return {
                type: 'public_dashboard',
                key: 'dashboard_id',
                name: 'Public Dashboard',
                referenceMap,
            };
        },
    });
};
