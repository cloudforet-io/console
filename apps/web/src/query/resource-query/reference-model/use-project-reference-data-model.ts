import { useProjectApi } from '@/api-clients/identity/project/composables/use-project-api';
import type { ProjectModel } from '@/api-clients/identity/project/schema/model';
import type { ProjectType } from '@/api-clients/identity/project/schema/type';
import { useReferenceDataModel } from '@/query/resource-query/reference-model/composables/use-reference-data-model';
import type {
    ReferenceDataModelFetchConfig,
    ReferenceItem, ReferenceMap,
} from '@/query/resource-query/reference-model/types/reference-type';
import { useProjectGroupReferenceDataModel } from '@/query/resource-query/reference-model/use-project-group-reference-data-model';
import { makeReferenceProxy } from '@/query/resource-query/reference-model/utils/reference-proxy-helper';
import { RESOURCE_CONFIG_MAP } from '@/query/resource-query/shared/contants/resource-config-map';


interface ProjectResourceItemData {
    groupInfo?: {
        id: string;
        name: string;
    };
    users: string[];
    projectType: ProjectType;
    workspaceId: string;
    projectGroupId?: string;
}
export type ProjectReferenceItem = ReferenceItem<ProjectResourceItemData>;
export type ProjectReferenceMap = ReferenceMap<ProjectReferenceItem>;

export const useProjectReferenceDataModel = () => {
    const { map: projectGroupReferenceMap } = useProjectGroupReferenceDataModel();
    const { projectAPI } = useProjectApi();
    const fetchConfig: ReferenceDataModelFetchConfig<ProjectModel> = {
        listFetcher: projectAPI.list,
        query: {
            only: ['project_id', 'name', 'project_group_id', 'users', 'project_type', 'workspace_id'],
        },
    };

    const {
        referenceMap,
    } = useReferenceDataModel<ProjectModel, ProjectReferenceItem>(
        RESOURCE_CONFIG_MAP.project.resourceKey,
        (projectInfo: ProjectModel) => ({
            key: projectInfo.project_id,
            label: projectInfo.name,
            name: projectInfo.name,
            data: {
                users: projectInfo.users || [],
                projectType: projectInfo.project_type,
                workspaceId: projectInfo.workspace_id,
                projectGroupId: projectInfo.project_group_id,
            },
        }),
        fetchConfig,
    );


    const projectReferenceProxyMap = makeReferenceProxy<ProjectReferenceMap>({} as ProjectReferenceMap, (_, id: string) => {
        const project = referenceMap[id];
        if (!project) return project;
        const projectGroupId = project.data?.projectGroupId;
        if (!projectGroupId) return project;
        const group = projectGroupReferenceMap[project?.data?.projectGroupId ?? ''];
        if (!group) return project;

        return {
            ...project,
            label: group ? `${group.name} > ${project.name}` : project.name,
            data: {
                ...project.data,
                groupInfo: group
                    ? { id: group.key, name: group.name }
                    : undefined,
            },
        };
    });

    return {
        map: projectReferenceProxyMap,
    };
};
