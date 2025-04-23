import type { Ref } from 'vue';
import { computed } from 'vue';

import type { ProjectReferenceItem } from '@/store/reference/project-reference-store';
import { useProjectReferenceStore } from '@/store/reference/project-reference-store';

export const useProjectIdsFromGroup = (groupId: Ref<string|undefined>) => {
    const projectReferenceStore = useProjectReferenceStore();
    const projects = computed<ProjectReferenceItem[]>(() => Object.values(projectReferenceStore.getters.projectItems));
    const projectIds = computed(() => {
        if (groupId.value === undefined) return [];
        return projects.value.filter((p) => p.data.groupInfo?.id === groupId.value)
            .map(((p) => p.key));
    });

    return projectIds;
};
