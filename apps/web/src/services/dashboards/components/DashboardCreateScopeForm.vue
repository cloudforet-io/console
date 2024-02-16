<script lang="ts" setup>
import { computed, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PFieldTitle, PI, PBoardItem, PButtonModal,
} from '@spaceone/design-system';
import type { IconSet } from '@spaceone/design-system/src/data-display/board-item/type';

import { ROLE_TYPE } from '@/schema/identity/role/constant';
import type { WorkspaceModel } from '@/schema/identity/workspace/model';
import { store } from '@/store';
import { i18n } from '@/translations';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProjectReferenceMap } from '@/store/reference/project-reference-store';

import WorkspaceLogoIcon from '@/common/modules/navigations/gnb/modules/gnb-header/WorkspaceLogoIcon.vue';
import ProjectSelectDropdown from '@/common/modules/project/ProjectSelectDropdown.vue';

import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';
import type { DashboardScope } from '@/services/dashboards/types/dashboard-view-type';
import type { ProjectTreeNodeData } from '@/services/project/types/project-tree-type';


interface BoardSet {
    value: DashboardScope;
    title: TranslateResult;
    leftIcon: string;
    description: TranslateResult;
    iconButtonSets?: IconSet[];
}
const emit = defineEmits<{(event: 'set-project', project: ProjectTreeNodeData): void;
}>();

const allReferenceStore = useAllReferenceStore();
const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;
const userWorkspaceStore = useUserWorkspaceStore();
const userWorkspaceState = userWorkspaceStore.$state;
const storeState = reactive({
    isWorkspaceOwner: computed(() => store.getters['user/getCurrentRoleInfo']?.roleType === ROLE_TYPE.WORKSPACE_OWNER),
    selectedWorkspace: computed<WorkspaceModel|undefined>(() => userWorkspaceState.getters.currentWorkspace),
    projects: computed<ProjectReferenceMap>(() => allReferenceStore.getters.project),
});
const state = reactive({
    dashboardScopeBoardSets: computed(() => {
        const boardSets: BoardSet[] = [
            {
                value: 'PROJECT',
                title: i18n.t('DASHBOARDS.CREATE.SINGLE_PROJECT'),
                description: (state.selectedProject && dashboardDetailState.dashboardScope === 'PROJECT')
                    ? storeState.projects[state.selectedProject.id]?.label
                    : i18n.t('DASHBOARDS.CREATE.NO_SELECTED_PROJECT'),
                leftIcon: 'ic_document-filled',
                iconButtonSets: dashboardDetailState.dashboardScope === 'PROJECT' ? [
                    {
                        iconName: 'ic_edit',
                        eventAction: () => {
                            state.projectModalVisible = true;
                        },
                    },
                ] : [],
            },
            {
                value: 'PRIVATE',
                title: i18n.t('DASHBOARDS.CREATE.PRIVATE'),
                description: i18n.t('DASHBOARDS.CREATE.ONLY_ME'),
                leftIcon: 'ic_lock-filled',
            },
        ];
        if (storeState.isWorkspaceOwner) {
            boardSets.unshift({
                value: 'WORKSPACE',
                title: i18n.t('DASHBOARDS.CREATE.CURRENT_WORKSPACE'),
                description: storeState.selectedWorkspace?.name || '',
                leftIcon: 'ic_dashboard-template_blank',
            });
        }
        return boardSets;
    }),
    selectedProject: undefined as undefined|ProjectTreeNodeData,
    projectModalVisible: false,
});

/* Event */
const handleSelectDashboardScope = (scopeType: DashboardScope) => {
    if (scopeType === 'PROJECT') {
        if (dashboardDetailState.dashboardScope === 'PROJECT') return;
        state.projectModalVisible = true;
        return;
    }
    state.selectedProject = undefined;
    dashboardDetailStore.setDashboardScope(scopeType);
    dashboardDetailStore.setDashboardType(scopeType === 'PRIVATE' ? 'PRIVATE' : 'PUBLIC');
};
const handleSelectProject = (selectedProjects: ProjectTreeNodeData[]) => {
    state.selectedProject = selectedProjects[0];
};
const handleConfirmProject = () => {
    if (!state.selectedProject) return;
    emit('set-project', state.selectedProject);
    dashboardDetailStore.setDashboardScope('PROJECT');
    dashboardDetailStore.setDashboardType('PUBLIC');
    state.projectModalVisible = false;
};
</script>

<template>
    <section>
        <div class="dashboard-create-scope-form-wrapper">
            <p-field-title class="field-title">
                {{ $t('DASHBOARDS.CREATE.DASHBOARD_SCOPE') }}
            </p-field-title>
            <div class="grid gap-2">
                <p-board-item v-for="dashboardScopeItem in state.dashboardScopeBoardSets"
                              :key="`dashboard-scope-${dashboardScopeItem.value}`"
                              class="dashboard-scope-board-item"
                              :class="{
                                  'selected': dashboardDetailState.dashboardScope === dashboardScopeItem.value,
                                  'project': dashboardScopeItem.value === 'PROJECT',
                              }"
                              :left-icon="dashboardScopeItem.leftIcon"
                              :icon-button-sets="dashboardScopeItem.iconButtonSets"
                              :value="dashboardScopeItem.value"
                              rounded
                              :selected="dashboardDetailState.dashboardScope"
                              @click="handleSelectDashboardScope(dashboardScopeItem.value)"
                >
                    <template #left-content>
                        <workspace-logo-icon v-if="dashboardScopeItem.value === 'WORKSPACE'"
                                             :text="storeState.selectedWorkspace?.name || ''"
                                             :theme="storeState.selectedWorkspace?.tags?.theme"
                                             class="workspace-logo-icon"
                        />
                        <div v-else
                             class="icon-box"
                        >
                            <p-i :name="dashboardScopeItem.leftIcon"
                                 width="1rem"
                                 height="1rem"
                                 color="inherit"
                            />
                        </div>
                    </template>
                    <template #content>
                        <p class="dashboard-scope-title">
                            {{ dashboardScopeItem.title }}
                        </p>
                        <p class="board-description">
                            {{ dashboardScopeItem.description }}
                        </p>
                    </template>
                </p-board-item>
            </div>
        </div>
        <p-button-modal v-if="state.projectModalVisible"
                        :header-title="$t('DASHBOARDS.CREATE.SELECT_PROJECT')"
                        :visible="state.projectModalVisible"
                        size="sm"
                        :disabled="!state.selectedProject"
                        @close="state.projectModalVisible = false"
                        @cancel="state.projectModalVisible = false"
                        @confirm="handleConfirmProject"
        >
            <template #body>
                <div class="pb-8">
                    <p-field-title class="pb-1">
                        {{ $t('DASHBOARDS.CREATE.SELECT_PROJECT') }}
                    </p-field-title>
                    <project-select-dropdown project-selectable
                                             :project-group-selectable="false"
                                             @select="handleSelectProject"
                    />
                </div>
            </template>
        </p-button-modal>
    </section>
</template>

<style lang="postcss" scoped>
.field-title {
    padding-bottom: 0.75rem;
}
.dashboard-scope-board-item {
    height: 4.375rem;
    cursor: pointer;
    &.selected {
        &.project {
            cursor: default;
        }
        .dashboard-scope-title {
            font-weight: 700;
        }
        .board-description {
            @apply text-label-md text-gray-900;
        }
        /* custom design-system component - p-board-item */
        :deep(&.p-board-item) {
            .right-overlay-wrapper {
                display: inline-block;
            }
        }
    }
    .workspace-logo-icon {
        width: 1.75rem;
        height: 1.75rem;
        margin-right: 0.75rem;
    }
    .icon-box {
        @apply rounded-md bg-gray-200 text-gray-900;
        width: 1.75rem;
        height: 1.75rem;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 0.75rem;
    }
    .dashboard-scope-title {
        @apply text-label-md;
        font-weight: 400;
    }
    .board-description {
        @apply text-label-sm text-gray-500;
        font-weight: 400;
    }
}
</style>
