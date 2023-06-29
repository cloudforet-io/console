<script lang="ts" setup>
import {
    reactive, watch,
} from 'vue';
import { useStore } from 'vuex';

import { useProxyValue } from '@/common/composables/proxy-state';
import ProjectSelectDropdown from '@/common/modules/project/ProjectSelectDropdown.vue';

import type { ProjectForm } from '@/services/asset-inventory/service-account/type';

interface Props {
    isValid?: boolean;
    projectId?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{(e: 'update:is-valid', value: boolean): void;
    (e: 'change', value: ProjectForm): void;
}>();
const store = useStore();

const state = reactive({
    selectedProjects: [] as Array<string>,
    formData: { selectedProjectId: null } as ProjectForm,
    proxyIsValid: useProxyValue('is-valid', props, emit),
});

/* Event */
const handleSelectedProject = (selectedProject: string[]) => {
    state.selectedProjects = selectedProject;
    state.formData = { selectedProjectId: selectedProject.length ? selectedProject[0] : null };
    state.proxyIsValid = !!selectedProject.length;
};

/* Init */
(async () => {
    await Promise.allSettled([
        store.dispatch('reference/project/load'),
    ]);
})();

/* Watcher */
watch(() => props.projectId, (projectId) => {
    if (projectId) {
        state.formData = { selectedProjectId: projectId };
        state.selectedProjects = [projectId];
    }
}, { immediate: true });
watch(() => state.formData, (formData: ProjectForm) => {
    emit('change', formData);
});

</script>

<template>
    <div class="service-account-project-form">
        <project-select-dropdown
            class="project-select-dropdown"
            project-selectable
            :selected-project-ids="state.selectedProjects"
            :use-fixed-menu-style="false"
            :invalid="state.proxyIsValid === false"
            @update:selected-project-ids="handleSelectedProject"
        />
    </div>
</template>

<style lang="postcss" scoped>
.service-account-project-form {
    .project-select-dropdown {
        max-width: 30rem;
        width: 50%;
    }

    @screen tablet {
        .project-select-dropdown {
            width: 100%;
        }
    }
}
</style>
