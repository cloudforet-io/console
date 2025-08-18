import { useProjectGroupApi } from '@/api-clients/identity/project-group/composables/use-project-group-api';
import type { ProjectGroupModel } from '@/api-clients/identity/project-group/schema/model';
import { useReferenceDataModel } from '@/query/resource-query/reference-data-model/composables/use-reference-data-model';
import type { ReferenceDataModelImplementationAdaptor } from '@/query/resource-query/reference-data-model/types/reference-data-model.adaptor';
import type { ReferenceDataModelFetchConfig, ReferenceItem, ReferenceMap } from '@/query/resource-query/reference-data-model/types/reference-type';
import { RESOURCE_CONFIG_MAP } from '@/query/resource-query/shared/contants/resource-config-map';
import { makeResourceProxy } from '@/query/resource-query/shared/utils/resource-proxy-helper';


interface ProjectGroupResourceItemData {
    parentGroupInfo?: {
        id: string;
        name: string;
    };
    users?: string[];
    parentGroupId?: string;
}
export type ProjectGroupReferenceItem = Required<Pick<ReferenceItem<ProjectGroupResourceItemData>, 'key'|'label'|'name'|'data'>>;
export type ProjectGroupReferenceMap = ReferenceMap<ProjectGroupReferenceItem>;

export const useProjectGroupReferenceDataModel: ReferenceDataModelImplementationAdaptor<ProjectGroupReferenceItem> = () => {
    const { projectGroupAPI } = useProjectGroupApi();
    const fetchConfig: ReferenceDataModelFetchConfig<ProjectGroupModel> = {
        listFetcher: projectGroupAPI.list,
        query: {
            only: ['project_group_id', 'name', 'parent_group_id', 'workspace_id', 'users'],
        },
    };


    const { referenceMap } = useReferenceDataModel<ProjectGroupModel, ProjectGroupReferenceItem>(
        RESOURCE_CONFIG_MAP.projectGroup.resourceKey,
        (projectGroupInfo: ProjectGroupModel): ProjectGroupReferenceItem => ({
            key: projectGroupInfo.project_group_id,
            name: projectGroupInfo.name,
            label: projectGroupInfo.name,
            data: {
                users: projectGroupInfo.users,
                parentGroupId: projectGroupInfo.parent_group_id,
            },
        }),
        fetchConfig,
    );

    const projectGroupReferenceProxyMap = makeResourceProxy<ProjectGroupReferenceMap>({} as ProjectGroupReferenceMap, (_, id: string) => {
        const projectGroup = referenceMap[id];
        if (!projectGroup) return projectGroup;

        const parentGroupId = projectGroup?.data?.parentGroupId;
        const parentGroup = parentGroupId ? referenceMap[parentGroupId] : undefined;
        if (!parentGroup) return projectGroup;

        return {
            ...projectGroup,
            label: (parentGroup)
                ? `${parentGroup.name} > ${projectGroup.name}` : projectGroup.name,
            data: {
                ...projectGroup.data,
                parentGroupInfo: (parentGroup) ? {
                    id: parentGroup.key,
                    name: parentGroup.name,
                } : undefined,
            },
        };
    });

    return {
        map: projectGroupReferenceProxyMap,
    };
};
