import { computed } from 'vue';

import { defineStore } from 'pinia';

import type { ProjectGroupModel } from '@/api-clients/identity/project-group/schema/model';
import type { ProjectModel } from '@/api-clients/identity/project/schema/model';

import { useProjectGroupListQuery } from '@/services/project/v2/composables/queries/use-project-group-list-query';
import { useProjectListQuery } from '@/services/project/v2/composables/queries/use-project-list-query';

export interface ProjectData extends ProjectModel {
    type: 'PROJECT';
    key: string;
}

export interface ProjectGroupData extends ProjectGroupModel {
    type: 'PROJECT_GROUP';
    key: string;
}

export const useProjectListStore = defineStore('project-list', () => {
    const { data: projectList, isFetching: isFetchingProjectList } = useProjectListQuery();
    const { data: projectGroupList, isFetching: isFetchingProjectGroupList } = useProjectGroupListQuery();
    /* loading state */
    const isLoading = computed(() => isFetchingProjectList.value || isFetchingProjectGroupList.value);

    /* filtered data by parent group */
    const getItemsByParentGroupId = computed(() => {
        const pgList = projectGroupList.value ?? [];
        const prjList = projectList.value ?? [];
        return (parentGroupId?: string) => {
            const items: Array<ProjectData|ProjectGroupData> = [];

            pgList.forEach((group) => {
                const parentId = group.parent_group_id;
                if (parentId !== parentGroupId) return;
                items.push({
                    ...group,
                    type: 'PROJECT_GROUP',
                    key: group.project_group_id,
                });
            });

            prjList.forEach((project) => {
                const groupId = project.project_group_id;
                if (groupId !== parentGroupId) return;
                items.push({
                    ...project,
                    type: 'PROJECT',
                    key: project.project_id,
                });
            });

            return items;
        };
    });

    /* filtered projects by group */
    const getProjectsByGroupId = computed(() => {
        const prjList = projectList.value ?? [];
        return (groupId?: string) => {
            if (!groupId) return prjList;
            return prjList.filter((project) => project.project_group_id === groupId);
        };
    });

    /* filtered project groups by parent */
    const getProjectGroupsByParentId = computed(() => {
        const pgList = projectGroupList.value ?? [];
        return (parentId?: string) => {
            if (!parentId) return pgList;
            return pgList.filter((group) => group.parent_group_id === parentId);
        };
    });

    return {
        isLoading,
        projectGroups: computed(() => projectGroupList.value ?? []),
        projects: computed(() => projectList.value ?? []),
        getItemsByParentGroupId,
        getProjectsByGroupId,
        getProjectGroupsByParentId,
    };
});
