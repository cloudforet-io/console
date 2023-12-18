<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';

import { PSelectDropdown, PSelectStatus, PDivider } from '@spaceone/design-system';

import { store } from '@/store';
import { i18n } from '@/translations';

import { useDashboardStore } from '@/store/dashboard/dashboard-store';


const VIEWERS_TYPE = {
    ALL: 'ALL',
    PUBLIC: 'PUBLIC',
    PRIVATE: 'PRIVATE',
} as const;

const dashboardStore = useDashboardStore();
const dashboardState = dashboardStore.state;
const state = reactive({
    viewerFilterList: computed(() => [
        { label: i18n.t('DASHBOARDS.ALL_DASHBOARDS.FILTER_ALL'), name: VIEWERS_TYPE.ALL },
        { label: i18n.t('DASHBOARDS.ALL_DASHBOARDS.FILTER_PUBLIC'), name: VIEWERS_TYPE.PUBLIC },
        { label: i18n.t('DASHBOARDS.ALL_DASHBOARDS.FILTER_PRIVATE'), name: VIEWERS_TYPE.PRIVATE },
    ]),
    scopeFilterList: computed(() => [
        { label: i18n.t('DASHBOARDS.ALL_DASHBOARDS.FILTER_ALL'), name: 'ALL' },
        { label: i18n.t('DASHBOARDS.ALL_DASHBOARDS.WORKSPACE'), name: 'WORKSPACE' },
        { label: i18n.t('DASHBOARDS.ALL_DASHBOARDS.FILTER_SINGLE_PROJECT'), name: 'PROJECT' },
    ]),
    viewersStatus: computed(() => dashboardState.dashboardType || VIEWERS_TYPE.ALL),
    scopeStatus: computed(() => dashboardState.scope || 'ALL'),
    pagePermission: computed(() => store.getters['user/pageAccessPermissionMap']),
});

const handleChangeViewers = (selected) => {
    if (selected === state.viewersStatus) return;
    dashboardStore.setDashboardType(selected === VIEWERS_TYPE.ALL ? undefined : selected);
};
const handleChangeScope = (selected) => {
    if (selected === state.scopeStatus) return;
    dashboardStore.setScope(selected === 'ALL' ? undefined : selected);
};
</script>

<template>
    <div class="dashboard-main-select-filter">
        <span class="filter-header">{{ $t('DASHBOARDS.ALL_DASHBOARDS.LABEL_VIWERS') }}</span>
        <p-select-status v-for="(view, idx) in state.viewerFilterList"
                         :key="`view-${idx}`"
                         :selected="state.viewersStatus"
                         class="select-desktop"
                         :value="view.name"
                         @change="handleChangeViewers"
        >
            {{ view.label }}
        </p-select-status>
        <p-select-dropdown class="select-tablet"
                           :menu="state.viewerFilterList"
                           :selected="state.viewersStatus"
                           style-type="transparent"
                           @update:selected="handleChangeViewers"
        />
        <p-divider class="divider"
                   vertical
        />
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

    .divider {
        height: 0.875rem;
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
