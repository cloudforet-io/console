import type { ProjectGroupModel } from '@/api-clients/identity/project-group/schema/model';
import { useReferenceDataModel } from '@/query/resource-query/reference-model/composables/use-reference-data-model';
import type { ReferenceItem, ReferenceMap } from '@/query/resource-query/reference-model/types/reference-type';
import { makeReferenceProxy } from '@/query/resource-query/reference-model/utils/reference-proxy-helper';
import { RESOURCE_CONFIG_MAP } from '@/query/resource-query/shared/contants/resource-config-map';


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

export const useProjectGroupReferenceModel = () => {
    const fetchOptions = {
        only: ['project_group_id', 'name', 'parent_group_id', 'workspace_id', 'users'],
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
        fetchOptions,
    );

    const projectGroupReferenceProxyMap = makeReferenceProxy<ProjectGroupReferenceMap>({} as ProjectGroupReferenceMap, (_, id: string) => {
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
