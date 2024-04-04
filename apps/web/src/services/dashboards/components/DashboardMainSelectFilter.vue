<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';

import { PSelectDropdown, PSelectStatus } from '@spaceone/design-system';

import { ROLE_TYPE } from '@/schema/identity/role/constant';
import { store } from '@/store';
import { i18n } from '@/translations';

import { useDashboardStore } from '@/store/dashboard/dashboard-store';


const dashboardStore = useDashboardStore();
const dashboardState = dashboardStore.state;
const storeState = reactive({
    isWorkspaceOwner: computed(() => store.getters['user/getCurrentRoleInfo']?.roleType === ROLE_TYPE.WORKSPACE_OWNER),
});
const state = reactive({
    scopeFilterList: computed(() => {
        const results = [
            { label: i18n.t('DASHBOARDS.ALL_DASHBOARDS.FILTER_ALL'), name: 'ALL' },
            { label: i18n.t('DASHBOARDS.ALL_DASHBOARDS.WORKSPACE'), name: 'WORKSPACE' },
            { label: i18n.t('DASHBOARDS.ALL_DASHBOARDS.FILTER_SINGLE_PROJECT'), name: 'PROJECT' },
            { label: i18n.t('DASHBOARDS.ALL_DASHBOARDS.FILTER_PRIVATE'), name: 'PRIVATE' },
        ];
        if (!storeState.isWorkspaceOwner) {
            return results.filter((d) => d.name !== 'WORKSPACE');
        }
        return results;
    }),
    scopeStatus: computed(() => dashboardState.scope || 'ALL'),
    pagePermission: computed(() => store.getters['user/pageAccessPermissionMap']),
});

const handleChangeScope = (selected) => {
    if (selected === state.scopeStatus) return;
    dashboardStore.setScope(selected === 'ALL' ? undefined : selected);
};
</script>

<template>
    <div class="dashboard-main-select-filter">
        <span class="filter-header">{{ $t('DASHBOARDS.ALL_DASHBOARDS.LABEL_SCOPE') }}</span>
        <p-select-status v-for="(scope, idx) in state.scopeFilterList"
                         :key="`scope-${idx}`"
                         :selected="state.scopeStatus"
                         class="select-desktop"
                         :value="scope.name"
                         @change="handleChangeScope"
        >
            {{ scope.label }}
        </p-select-status>
        <p-select-dropdown class="select-tablet"
                           :menu="state.scopeFilterList"
                           :selected="state.scopeStatus"
                           style-type="transparent"
                           @update:selected="handleChangeScope"
        />
    </div>
</template>

<style lang="postcss" scoped>
.dashboard-main-select-filter {
    @apply flex items-center;
    height: 2rem;
    margin: 1.125rem 0 0.625rem 0;
    gap: 1rem;

    .filter-header {
        @apply text-gray-500;
        font-size: 0.875rem;
        line-height: 1.25;
    }
    .select-tablet {
        display: none;
    }

    @screen tablet {
        .select-tablet {
            display: block;
        }
        .select-desktop {
            display: none;
        }
    }
}
</style>
