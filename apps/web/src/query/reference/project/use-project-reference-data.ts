import { computed, reactive } from 'vue';

import { useProjectApi } from '@/api-clients/identity/project/composables/use-project-api';
import type { ProjectListParameters } from '@/api-clients/identity/project/schema/api-verbs/list';
import type { ProjectModel } from '@/api-clients/identity/project/schema/model';

import type { ProjectGroupReferenceMap } from '@/store/reference/project-group-reference-store';
import { useProjectGroupReferenceStore } from '@/store/reference/project-group-reference-store';
import type { ProjectReferenceItem } from '@/store/reference/project-reference-store';

import { useReferenceData } from '../_core/use-reference-data';

export const useProjectReferenceData = () => {
    const { projectAPI } = useProjectApi();
    const projectGroupReferenceStore = useProjectGroupReferenceStore();

    const _getters = reactive({
        projectGroup: computed<ProjectGroupReferenceMap>(() => projectGroupReferenceStore.getters.projectGroupItems),
    });

    // transform
    const setProjectReferenceData = (projectInfo: ProjectModel): ProjectReferenceItem => {
        const projectGroup = Object.values(_getters.projectGroup ?? {}).find((d) => d.key === projectInfo.project_group_id);

        return {
            key: projectInfo.project_id,
            label: (projectGroup)
                ? `${projectGroup.name} > ${projectInfo.name}` : projectInfo.name,
            name: projectInfo.name,
            data: {
                groupInfo: (projectGroup) ? {
                    id: projectGroup.key,
                    name: projectGroup.name,
                } : undefined,
                users: projectInfo.users || [],
                projectType: projectInfo.project_type,
                workspaceId: projectInfo.workspace_id,
            },
        };
    };

    // listFetchFn
    const listProject = async (params: ProjectListParameters): Promise<ProjectModel[]> => {
        const response = await projectAPI.list(params);
        return response.results || [];
    };

    return useReferenceData<ProjectModel, ProjectReferenceItem>(
        'project',
        listProject,
        setProjectReferenceData,
    );
};
