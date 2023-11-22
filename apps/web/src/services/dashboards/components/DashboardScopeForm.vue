<template>
    <section class="dashboard-scope-form">
        <p-field-title>{{ $t('DASHBOARDS.CREATE.LABEL_SCOPE') }}</p-field-title>
        <div class="dashboard-scope-wrapper">
            <p-radio-group direction="vertical"
                           class="dashboard-scope-radio-group"
            >
                <p-radio :selected="isDomainScope"
                         :disabled="!workspaceManagePermission"
                         @change="handleSelectScope(DASHBOARD_SCOPE.DOMAIN)"
                >
                    {{ $t('DASHBOARDS.CREATE.ENTIRE_WORKSPACES') }}
                </p-radio>
                <p-radio :selected="!isDomainScope"
                         :disabled="!projectManagePermission"
                         @change="handleSelectScope(DASHBOARD_SCOPE.PROJECT)"
                >
                    {{ $t('DASHBOARDS.CREATE.SINGLE_PROJECT') }}
                </p-radio>
            </p-radio-group>
            <project-select-dropdown v-show="!isDomainScope"
                                     project-selectable
                                     :project-group-selectable="false"
                                     @select="handleSelectProjects"
            />
        </div>
    </section>
</template>

<script lang="ts">
import type { SetupContext } from 'vue';
import {
    defineComponent, onMounted, reactive, toRefs,
} from 'vue';

import {
    PRadio, PRadioGroup, PFieldTitle,
} from '@spaceone/design-system';

import { DASHBOARD_SCOPE } from '@/schema/dashboard/_constants/dashboard-constant';
import type { DashboardScope } from '@/schema/dashboard/_types/dashboard-type';
import { store } from '@/store';

import { MENU_ID } from '@/lib/menu/config';

import { useManagePermissionState } from '@/common/composables/page-manage-permission';
import ProjectSelectDropdown from '@/common/modules/project/ProjectSelectDropdown.vue';

import type { ProjectTreeNodeData } from '@/services/project/types/project-tree-type';

export default defineComponent({
    name: 'DashboardScopeForm',
    components: {
        PFieldTitle,
        ProjectSelectDropdown,
        PRadioGroup,
        PRadio,
    },
    props: {
        dashboardProject: {
            type: String,
            default: '',
        },
    },
    setup(props, { emit }: SetupContext) {
        const state = reactive({
            isDomainScope: true,
            projectManagePermission: useManagePermissionState(MENU_ID.DASHBOARDS_PROJECT),
            workspaceManagePermission: useManagePermissionState(MENU_ID.DASHBOARDS_WORKSPACE),
        });

        const handleSelectScope = (scopeType: DashboardScope) => {
            updateScope(scopeType);
        };

        const handleSelectProjects = (projects: Array<ProjectTreeNodeData>) => {
            // Emit projects as project.
            emit('set-project', projects[0]);
        };

        const updateScope = (scopeType: DashboardScope) => {
            state.isDomainScope = scopeType === DASHBOARD_SCOPE.DOMAIN;
            emit('update:dashboardScope', scopeType);
        };

        // LOAD REFERENCE STORE
        (async () => {
            await store.dispatch('reference/project/load');
        })();

        onMounted(() => {
            if (!(state.projectManagePermission || state.workspaceManagePermission)) return;
            if (!state.projectManagePermission) updateScope(DASHBOARD_SCOPE.DOMAIN);
            if (!state.workspaceManagePermission) updateScope(DASHBOARD_SCOPE.PROJECT);
        });

        return {
            ...toRefs(state),
            handleSelectScope,
            handleSelectProjects,
            DASHBOARD_SCOPE,
        };
    },
});
</script>

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
