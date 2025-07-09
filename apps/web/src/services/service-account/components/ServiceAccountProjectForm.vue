<script lang="ts" setup>
import {
    reactive, watch,
} from 'vue';

import { useProxyValue } from '@/common/composables/proxy-state';
import ProjectSelectDropdown from '@/common/modules/project/ProjectSelectDropdown.vue';

import type { ProjectForm } from '@/services/service-account/types/service-account-page-type';


const props = defineProps<{
    isValid?: boolean;
    projectId?: string;
}>();

const emit = defineEmits<{(e: 'update:is-valid', isValid: boolean): void;
    (e: 'change', formData: Partial<ProjectForm>): void;}>();

const state = reactive({
    selectedProjects: [] as Array<string>,
    formData: { selectedProjectId: undefined } as Partial<ProjectForm>,
    proxyIsValid: useProxyValue('is-valid', props, emit),
});

/* Event */
const handleSelectedProject = (selectedProject: string[]) => {
    state.selectedProjects = selectedProject;
    state.formData = { selectedProjectId: selectedProject.length ? selectedProject[0] : undefined };
    state.proxyIsValid = !!selectedProject.length;
};

/* Watcher */
watch(() => props.projectId, (projectId) => {
    if (projectId) {
        state.formData = { selectedProjectId: projectId };
        state.selectedProjects = [projectId];
    }
}, { immediate: true });
watch(() => state.formData, (formData: Partial<ProjectForm>) => {
    emit('change', formData);
});

</script>

<template>
    <div class="service-account-project-form">
        <project-select-dropdown
            class="project-select-dropdown"
            :selected-project-ids="state.selectedProjects"
            :use-fixed-menu-style="false"
            :invalid="state.proxyIsValid === false"
            project-selectable
            :project-group-selectable="false"
            @update:selected-project-ids="handleSelectedProject"
        />
    </div>
</template>

<style lang="postcss" scoped>
.service-account-project-form {
    .project-select-dropdown {
        max-width: 30rem;
        width: 100%;
    }

    @screen tablet {
        .project-select-dropdown {
            width: 100%;
        }
    }
}
</style>
