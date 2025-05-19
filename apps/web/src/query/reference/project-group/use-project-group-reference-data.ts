import { computed, reactive } from 'vue';

import { useProjectGroupApi } from '@/api-clients/identity/project-group/composables/use-project-group-api';
import type { ProjectGroupModel } from '@/api-clients/identity/project-group/schema/model';
import { useProjectApi } from '@/api-clients/identity/project/composables/use-project-api';
import type { ProjectModel } from '@/api-clients/identity/project/schema/model';
import { useReferenceQueryKey } from '@/query/query-key/use-reference-query-key';

import type { ProjectGroupReferenceItem, ProjectGroupReferenceMap } from '@/store/reference/project-group-reference-store';
import { useProjectGroupReferenceStore } from '@/store/reference/project-group-reference-store';
import type { ProjectReferenceItem } from '@/store/reference/project-reference-store';

import { useBatchedReferenceMap } from '../_core/reference-map/use-batched-reference-map';

export const useProjectGroupReferenceData = () => {
    const projectGroupReferenceQueryKey = useReferenceQueryKey('project-group');
    const { projectGroupAPI } = useProjectGroupApi();

    const setProjectGroupReferenceData = (projectGroupInfo: ProjectGroupModel): ProjectGroupReferenceItem => {
        const parentGroup = res.results?.find((d) => d.project_group_id === projectGroupInfo.parent_group_id);
        return {
            key: projectGroupInfo.project_group_id,
            label: (parentGroup)
                ? `${parentGroup.name} > ${projectGroupInfo.name}` : projectGroupInfo.name,
            name: projectGroupInfo.name,
            data: {
                parentGroupInfo: parentGroup ? {
                    id: parentGroup.project_group_id,
                    name: parentGroup.name,
                } : undefined,
                users: projectGroupInfo.users,
            },
        };
    };

    const listProject = async (ids: string[]): Promise<ProjectGroupModel[]> => {
        const response = await projectGroupAPI.list({
            query: {
                filter: [
                    {
                        k: 'project_group_id',
                        o: 'in',
                        v: ids,
                    },
                ],
            },
        });
        return response.results || [];
    };

    return useBatchedReferenceMap(
        projectReferenceQueryKey.value,
        listProject,
        (item) => item.project_id,
        setProjectReferenceData,
    );
};
