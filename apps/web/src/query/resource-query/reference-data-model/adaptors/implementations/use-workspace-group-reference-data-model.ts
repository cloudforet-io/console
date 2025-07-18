import { useWorkspaceGroupApi } from '@/api-clients/identity/workspace-group/composables/use-workspace-group-api';
import type { WorkspaceGroupModel } from '@/api-clients/identity/workspace-group/schema/model';
import { useReferenceDataModel } from '@/query/resource-query/reference-data-model/composables/use-reference-data-model';
import type { ReferenceDataModelImplementationAdaptor } from '@/query/resource-query/reference-data-model/types/reference-data-model.adaptor';
import type {
    ReferenceDataModelFetchConfig,
    ReferenceItem, ReferenceMap,
} from '@/query/resource-query/reference-data-model/types/reference-type';
import { RESOURCE_CONFIG_MAP } from '@/query/resource-query/shared/contants/resource-config-map';


export type WorkspaceGroupReferenceItem = ReferenceItem<WorkspaceGroupModel>;
export type WorkspaceGroupReferenceMap = ReferenceMap<WorkspaceGroupReferenceItem>;

export const useWorkspaceGroupReferenceDataModel: ReferenceDataModelImplementationAdaptor<WorkspaceGroupReferenceItem> = () => {
    const { workspaceGroupAPI } = useWorkspaceGroupApi();
    const fetchConfig: ReferenceDataModelFetchConfig<WorkspaceGroupModel> = {
        listFetcher: workspaceGroupAPI.list,
        query: {
            only: ['name', 'workspace_group_id', 'tags'],
        },
    };

    const {
        referenceMap,
    } = useReferenceDataModel<WorkspaceGroupModel, WorkspaceGroupReferenceItem>(
        RESOURCE_CONFIG_MAP.workspaceGroup.resourceKey,
        (workspaceGroupInfo: WorkspaceGroupModel) => ({
            key: workspaceGroupInfo.workspace_group_id,
            label: workspaceGroupInfo.name,
            name: workspaceGroupInfo.name,
            data: {
                tags: workspaceGroupInfo.tags,
            },
        }),
        fetchConfig,
    );

    return {
        map: referenceMap,
    };
};
