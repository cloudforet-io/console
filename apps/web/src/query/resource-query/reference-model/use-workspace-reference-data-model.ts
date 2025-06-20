import { useWorkspaceApi } from '@/api-clients/identity/workspace/composables/use-workspace-api';
import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';
import { useReferenceDataModel } from '@/query/resource-query/reference-model/composables/use-reference-data-model';
import type {
    ReferenceDataModelFetchConfig,
    ReferenceItem, ReferenceMap,
} from '@/query/resource-query/reference-model/types/reference-type';
import { RESOURCE_CONFIG_MAP } from '@/query/resource-query/shared/contants/resource-config-map';


export type WorkspaceReferenceItem = ReferenceItem<WorkspaceModel>;
export type WorkspaceReferenceMap = ReferenceMap<WorkspaceReferenceItem>;

export const useWorkspaceReferenceDataModel = () => {
    const { workspaceAPI } = useWorkspaceApi();
    const fetchConfig: ReferenceDataModelFetchConfig<WorkspaceModel> = {
        listFetcher: workspaceAPI.list,
        query: {
            only: ['name', 'workspace_id', 'state', 'tags', 'cost_info', 'service_account_count', 'created_at', 'user_count', 'packages'],
        },
    };

    const {
        referenceMap,
    } = useReferenceDataModel<WorkspaceModel, WorkspaceReferenceItem>(
        RESOURCE_CONFIG_MAP.workspace.resourceKey,
        (workspaceInfo: WorkspaceModel) => ({
            key: workspaceInfo.workspace_id,
            label: workspaceInfo.name,
            name: workspaceInfo.name,
            data: {
                state: workspaceInfo.state,
                tags: workspaceInfo.tags,
                cost_info: workspaceInfo.cost_info,
                service_account_count: workspaceInfo.service_account_count,
                created_at: workspaceInfo.created_at,
                user_count: workspaceInfo.user_count,
                packages: workspaceInfo.packages,
            },
        }),
        fetchConfig,
    );

    return {
        map: referenceMap,
    };
};
