<template>
    <section class="dashboard-scope-form">
        <p-pane-layout>
            <p-panel-top :title="$t('DASHBOARDS.CREATE.LABEL_SCOPE')" />
            <div class="dashboard-scope-wrapper">
                <p-radio-group direction="vertical">
                    <p-radio :selected="isDomainScope"
                             :disabled="!hasManageWorkspacePermission"
                             @change="handleSelectScope(DASHBOARD_SCOPE.DOMAIN)"
                    >
                        {{ $t('DASHBOARDS.CREATE.ENTIRE_WORKSPACES') }}
                    </p-radio>
                    <p-radio :selected="!isDomainScope"
                             :disabled="!hasManageProjectPermission"
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
        </p-pane-layout>
    </section>
</template>

<script lang="ts">
import type { SetupContext } from 'vue';
import {
    defineComponent, onMounted, reactive, toRefs,
} from 'vue';

import {
    PPaneLayout, PPanelTop, PRadio, PRadioGroup,
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
        ProjectSelectDropdown,
        PRadioGroup,
        PRadio,
        PPanelTop,
        PPaneLayout,
    },
    setup(props, { emit }: SetupContext) {
        const state = reactive({
            isDomainScope: true,
            hasManageProjectPermission: useManagePermissionState(MENU_ID.DASHBOARDS_PROJECT),
            hasManageWorkspacePermission: useManagePermissionState(MENU_ID.DASHBOARDS_WORKSPACE),
        });

        const handleSelectScope = (scopeType: DashboardScope) => {
            state.isDomainScope = scopeType === DASHBOARD_SCOPE.DOMAIN;
            emit('update:dashboardScope', scopeType);
        };

        const handleSelectProjects = (projects: Array<ProjectItemResp>) => {
            // Emit projects as project.
            emit('set-project', projects[0]);
        };

        // LOAD REFERENCE STORE
        (async () => {
            await store.dispatch('reference/project/load');
        })();

        onMounted(() => {
            if (!(state.hasManageProjectPermission || state.hasManageWorkspacePermission)) return;
            if (!state.hasManageProjectPermission) handleSelectScope(DASHBOARD_SCOPE.DOMAIN);
            if (!state.hasManageWorkspacePermission) handleSelectScope(DASHBOARD_SCOPE.PROJECT);
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
    .dashboard-scope-wrapper {
        .p-radio-group {
            display: grid;
            grid-gap: 0.875rem;
        }
        .project-select-dropdown {
            max-width: 30rem;
            width: 50%;
            margin: 0.375rem 0 0 1.125rem;
        }

        @screen tablet {
            .project-select-dropdown {
                width: 100%;
            }
        }
        margin: 0.5rem 1rem 2.25rem;
    }
}
</style>
