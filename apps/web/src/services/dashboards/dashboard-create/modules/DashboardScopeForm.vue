<template>
    <section class="dashboard-scope-form">
        <p-field-title>{{ $t('DASHBOARDS.CREATE.LABEL_SCOPE') }}</p-field-title>
        <div class="dashboard-scope-wrapper">
            <p-radio-group direction="vertical">
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

import { store } from '@/store';

import { MENU_ID } from '@/lib/menu/config';

import { useManagePermissionState } from '@/common/composables/page-manage-permission';
import ProjectSelectDropdown from '@/common/modules/project/ProjectSelectDropdown.vue';

import { DASHBOARD_SCOPE } from '@/services/dashboards/config';
import type { DashboardScope } from '@/services/dashboards/config';
import type { ProjectItemResp } from '@/services/project/type';

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

        const handleSelectProjects = (projects: Array<ProjectItemResp>) => {
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
    @apply mt-8;
    .dashboard-scope-wrapper {
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
