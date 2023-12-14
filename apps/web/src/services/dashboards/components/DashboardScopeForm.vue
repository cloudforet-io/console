<script lang="ts" setup>
import {
    onMounted, reactive,
} from 'vue';

import {
    PRadio, PRadioGroup, PFieldTitle,
} from '@spaceone/design-system';

import type { DashboardScope } from '@/schema/dashboard/_types/dashboard-type';
import { store } from '@/store';

import { MENU_ID } from '@/lib/menu/config';

import { useManagePermissionState } from '@/common/composables/page-manage-permission';
import { useProxyValue } from '@/common/composables/proxy-state';
import ProjectSelectDropdown from '@/common/modules/project/ProjectSelectDropdown.vue';

import type { ProjectTreeNodeData } from '@/services/project/types/project-tree-type';


interface Props {
    dashboardScope?: DashboardScope;
}
const props = withDefaults(defineProps<Props>(), {
    dashboardScope: undefined,
});
const emit = defineEmits<{(event: 'set-project', project: ProjectTreeNodeData): void;
    (event: 'update:dashboard-scope', scopeType: DashboardScope): void;
}>();

const state = reactive({
    isWorkspaceScope: true,
    dashboardScope: useProxyValue('dashboardScope', props, emit),
    projectManagePermission: useManagePermissionState(MENU_ID.PROJECT_DASHBOARDS),
    workspaceManagePermission: useManagePermissionState(MENU_ID.WORKSPACE_DASHBOARDS),
});

const handleSelectScope = (scopeType: DashboardScope) => {
    updateScope(scopeType);
};

const handleSelectProjects = (projects: Array<ProjectTreeNodeData>) => {
    // Emit projects as project.
    emit('set-project', projects[0]);
};

const updateScope = (scopeType: DashboardScope) => {
    state.isWorkspaceScope = scopeType === 'WORKSPACE';
    state.dashboardScope = scopeType;
};

// LOAD REFERENCE STORE
(async () => {
    await store.dispatch('reference/project/load');
})();

onMounted(() => {
    if (!(state.projectManagePermission || state.workspaceManagePermission)) return;
    if (!state.projectManagePermission) updateScope('WORKSPACE');
    if (!state.workspaceManagePermission) updateScope('PROJECT');
});
</script>

<template>
    <section class="dashboard-scope-form">
        <p-field-title>{{ $t('DASHBOARDS.CREATE.LABEL_SCOPE') }}</p-field-title>
        <div class="dashboard-scope-wrapper">
            <p-radio-group direction="vertical"
                           class="dashboard-scope-radio-group"
            >
                <p-radio :selected="state.isWorkspaceScope"
                         :disabled="!state.workspaceManagePermission"
                         @change="handleSelectScope('WORKSPACE')"
                >
                    {{ $t('DASHBOARDS.CREATE.WORKSPACE') }}
                </p-radio>
                <p-radio :selected="!state.isWorkspaceScope"
                         :disabled="!state.projectManagePermission"
                         @change="handleSelectScope('PROJECT')"
                >
                    {{ $t('DASHBOARDS.CREATE.SINGLE_PROJECT') }}
                </p-radio>
            </p-radio-group>
            <project-select-dropdown v-show="!state.isWorkspaceScope"
                                     project-selectable
                                     :project-group-selectable="false"
                                     @select="handleSelectProjects"
            />
        </div>
    </section>
</template>

<style lang="postcss" scoped>
.dashboard-scope-form {
    @apply flex flex-col mt-8;
    gap: 0.5rem;
    .dashboard-scope-wrapper {
        .dashboard-scope-radio-group {
            @apply flex flex-col;
            gap: 0.5rem;
        }
        .project-select-dropdown {
            @apply mt-1 ml-6;
        }

        @screen tablet {
            .project-select-dropdown {
                width: 100%;
            }
        }
    }
}
</style>
