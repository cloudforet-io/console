<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';

import {
    PRadio, PRadioGroup, PFieldTitle, PI,
} from '@spaceone/design-system';

import { ROLE_TYPE } from '@/schema/identity/role/constant';
import { store } from '@/store';

import ProjectSelectDropdown from '@/common/modules/project/ProjectSelectDropdown.vue';

import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';
import type { DashboardScope } from '@/services/dashboards/types/dashboard-view-type';
import type { ProjectTreeNodeData } from '@/services/project/types/project-tree-type';


const emit = defineEmits<{(event: 'set-project', project: ProjectTreeNodeData): void;
}>();

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;
const storeState = reactive({
    isWorkspaceOwner: computed(() => store.getters['user/getCurrentRoleInfo']?.roleType === ROLE_TYPE.WORKSPACE_OWNER),
});

/* Event */
const handleSelectScope = (scopeType: DashboardScope) => {
    dashboardDetailStore.setDashboardScope(scopeType);
    if (scopeType === 'PRIVATE') {
        dashboardDetailStore.setDashboardType('PRIVATE');
    } else {
        dashboardDetailStore.setDashboardType('PUBLIC');
    }
};

const handleSelectProjects = (projects: Array<ProjectTreeNodeData>) => {
    emit('set-project', projects[0]);
};

watch(() => storeState.isWorkspaceOwner, (val) => {
    if (!val) {
        dashboardDetailStore.setDashboardScope('PROJECT');
    }
}, { immediate: true });
</script>

<template>
    <section class="dashboard-scope-form">
        <p-field-title>{{ $t('DASHBOARDS.CREATE.LABEL_SCOPE') }}</p-field-title>
        <div class="dashboard-scope-wrapper">
            <p-radio-group direction="vertical"
                           class="dashboard-scope-radio-group"
            >
                <p-radio v-if="storeState.isWorkspaceOwner"
                         :selected="dashboardDetailState.dashboardScope"
                         value="WORKSPACE"
                         @change="handleSelectScope('WORKSPACE')"
                >
                    {{ $t('DASHBOARDS.CREATE.WORKSPACE') }}
                </p-radio>
                <p-radio :selected="dashboardDetailState.dashboardScope"
                         value="PROJECT"
                         @change="handleSelectScope('PROJECT')"
                >
                    {{ $t('DASHBOARDS.CREATE.SINGLE_PROJECT') }}
                </p-radio>
                <project-select-dropdown :disabled="dashboardDetailState.dashboardScope !== 'PROJECT'"
                                         project-selectable
                                         :project-group-selectable="false"
                                         @select="handleSelectProjects"
                />
                <p-radio :selected="dashboardDetailState.dashboardScope"
                         value="PRIVATE"
                         @change="handleSelectScope('PRIVATE')"
                >
                    <div class="private-radio">
                        <span>{{ $t('DASHBOARDS.CREATE.PRIVATE') }}</span>
                        <p-i name="ic_lock-filled"
                             width="0.875rem"
                             height="0.875rem"
                             color="inherit"
                        />
                    </div>
                    <p class="viewer-description">
                        {{ $t('DASHBOARDS.CREATE.PRIVATE_DESC') }}
                    </p>
                </p-radio>
            </p-radio-group>
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
        .private-radio {
            display: inline-flex;
            gap: 0.25rem;
            align-items: center;
            margin-left: 0.25rem;
        }
        .viewer-description {
            @apply text-xs text-gray-500;
            font-weight: 400;
            margin-left: 1.5rem;
        }
        .project-select-dropdown {
            @apply ml-6;
        }

        @screen tablet {
            .project-select-dropdown {
                width: 100%;
            }
        }
    }
}
</style>
