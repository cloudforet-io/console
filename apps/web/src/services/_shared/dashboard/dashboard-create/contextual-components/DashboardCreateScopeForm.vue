<script lang="ts" setup>
import {
    computed, onMounted, reactive,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PFieldTitle, PI, PBoardItem,
} from '@cloudforet/mirinae';
import type { IconSet } from '@cloudforet/mirinae/types/data-display/board-item/type';

import { ROLE_TYPE } from '@/api-clients/identity/role/constant';
import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';
import { i18n } from '@/translations';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAuthorizationStore } from '@/store/authorization/authorization-store';

import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { useDashboardSharedContext } from '@/services/_shared/dashboard/core/composables/_internal/use-dashboard-shared-context';
import { useDashboardCreatePageStore } from '@/services/_shared/dashboard/dashboard-create/stores/dashboard-create-page-store';


interface BoardSet {
    value: 'WORKSPACE' | 'PRIVATE';
    title: TranslateResult;
    leftIcon: string;
    description: TranslateResult;
    iconButtonSets?: IconSet[];
}

const dashboardCreatePageStore = useDashboardCreatePageStore();
const dashboardCreatePageState = dashboardCreatePageStore.state;
const userWorkspaceStore = useUserWorkspaceStore();
const userWorkspaceState = userWorkspaceStore.$state;
const authorizationStore = useAuthorizationStore();
const storeState = reactive({
    isWorkspaceOwner: computed(() => authorizationStore.state.currentRoleInfo?.roleType === ROLE_TYPE.WORKSPACE_OWNER),
    selectedWorkspace: computed<WorkspaceModel|undefined>(() => userWorkspaceState.getters.currentWorkspace),
});

const {
    isAdminMode,
    entryPoint,
} = useDashboardSharedContext();

const state = reactive({
    dashboardScopeBoardSets: computed(() => {
        const boardSets: BoardSet[] = [
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
                title: i18n.t('DASHBOARDS.CREATE.WORKSPACE'),
                description: storeState.selectedWorkspace?.name || '',
                leftIcon: 'ic_dashboard-template_blank',
            });
        }
        return boardSets;
    }),
});

/* Event */
const handleSelectDashboardScope = (scopeType: 'WORKSPACE'|'PRIVATE') => {
    dashboardCreatePageStore.setDashboardScope(scopeType);
};

onMounted(() => {
    if (entryPoint.value === 'DASHBOARDS') {
        if (storeState.isWorkspaceOwner) {
            dashboardCreatePageStore.setDashboardScope('PRIVATE');
        } else {
            dashboardCreatePageStore.setDashboardScope('WORKSPACE');
        }
    }
});
</script>

<template>
    <section>
        <div class="dashboard-create-scope-form-wrapper">
            <p-field-title class="field-title">
                {{ $t('DASHBOARDS.CREATE.DASHBOARD_SCOPE') }}
            </p-field-title>
            <div v-if="!isAdminMode && entryPoint !== 'PROJECT'"
                 class="grid gap-2"
            >
                <p-board-item v-for="dashboardScopeItem in state.dashboardScopeBoardSets"
                              :key="`dashboard-scope-${dashboardScopeItem.value}`"
                              class="dashboard-scope-board-item"
                              :class="{
                                  'selected': dashboardCreatePageState.dashboardScope === dashboardScopeItem.value,
                              }"
                              :left-icon="dashboardScopeItem.leftIcon"
                              :icon-button-sets="dashboardScopeItem.iconButtonSets"
                              :value="dashboardScopeItem.value"
                              rounded
                              :selected="dashboardCreatePageState.dashboardScope"
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
            <div v-else
                 class="flex items-center gap-1 pt-1"
            >
                <p-i name="ic_info-circle"
                     width="0.875rem"
                     height="0.875rem"
                />
                <span class="text-paragraph-sm text-gray-700">
                    <strong>Only Public</strong>
                    {{ $t('(Everyone in this workspace)') }}
                </span>
            </div>
        </div>
    </section>
</template>

<style lang="postcss" scoped>
.dashboard-scope-board-item {
    height: 4.375rem;
    cursor: pointer;
    padding-top: 0.75rem;

    &.selected {
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
