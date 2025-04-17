import { computed } from 'vue';

import { defineStore } from 'pinia';

import type { ProjectModel } from '@/api-clients/identity/project/schema/model';

import type { ProjectGroupReferenceItem } from '@/store/reference/project-group-reference-store';
import { useProjectGroupReferenceStore } from '@/store/reference/project-group-reference-store';
import type { ProjectReferenceItem } from '@/store/reference/project-reference-store';
import { useProjectReferenceStore } from '@/store/reference/project-reference-store';

export interface ProjectData extends ProjectReferenceItem {
    type: 'PROJECT';
}

export interface ProjectGroupData extends ProjectGroupReferenceItem {
    type: 'PROJECT_GROUP';
}

export const useProjectListStore = defineStore('project-list', () => {
    const projectGroupReferenceStore = useProjectGroupReferenceStore();
    const projectReferenceStore = useProjectReferenceStore();

    /* loading state */
    const isLoading = computed(() => !projectGroupReferenceStore.state.items || !projectReferenceStore.state.items);

    /* cached data */
    const projectGroupMap = computed(() => projectGroupReferenceStore.getters.projectGroupItems);
    const projectGroups = computed<ProjectGroupReferenceItem[]>(() => Object.values(projectGroupMap.value));
    const projectMap = computed(() => projectReferenceStore.getters.projectItems);
    const projects = computed<ProjectReferenceItem[]>(() => Object.values(projectMap.value));

    /* filtered data by parent group */
    const getItemsByParentGroupId = computed(() => {
        const pgList = projectGroups.value;
        const prjList = projects.value;
        return (parentGroupId?: string) => {
            const items: Array<ProjectData|ProjectGroupData> = [];

            pgList.forEach((group) => {
                const parentId = group.data.parentGroupInfo?.id;
                if (parentId !== parentGroupId) return;
                items.push({
                    ...group,
                    type: 'PROJECT_GROUP',
                });
            });

            prjList.forEach((project) => {
                const groupId = project.data.groupInfo?.id;
                if (groupId !== parentGroupId) return;
                items.push({
                    ...project,
                    type: 'PROJECT',
                });
            });

            return items;
        };
    });

    /* filtered projects by group */
    const getProjectsByGroupId = computed(() => {
        const prjList = projects.value;
        return (groupId?: string) => {
            if (!groupId) return prjList;
            return prjList.filter((project) => project.data.groupInfo?.id === groupId);
        };
    });

    /* filtered project groups by parent */
    const getProjectGroupsByParentId = computed(() => {
        const pgList = projectGroups.value;
        return (parentId?: string) => {
            if (!parentId) return pgList;
            return pgList.filter((group) => group.data.parentGroupInfo?.id === parentId);
        };
    });

    const syncProject = (project: ProjectModel) => {
        projectReferenceStore.sync(project);
    };

    return {
        isLoading,
        projectGroups,
        projects,
        projectMap,
        projectGroupMap,
        getItemsByParentGroupId,
        getProjectsByGroupId,
        getProjectGroupsByParentId,
        syncProject,
    };
});
