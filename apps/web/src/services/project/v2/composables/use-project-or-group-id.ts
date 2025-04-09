import { computed, type Ref } from 'vue';

export const useProjectOrGroupId = (projectGroupOrProjectId: Ref<string|undefined>) => {
    const projectGroupId = computed(() => {
        if (projectGroupOrProjectId.value && projectGroupOrProjectId.value.startsWith('pg-')) {
            return projectGroupOrProjectId.value;
        }
        return undefined;
    });
    const projectId = computed(() => {
        if (projectGroupOrProjectId.value && projectGroupOrProjectId.value.startsWith('project-')) {
            return projectGroupOrProjectId.value;
        }
        return undefined;
    });
    return {
        projectGroupId,
        projectId,
    };
};
