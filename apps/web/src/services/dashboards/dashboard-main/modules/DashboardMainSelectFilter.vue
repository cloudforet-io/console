<script lang="ts" setup>
import { PSelectDropdown, PSelectStatus, PDivider } from '@spaceone/design-system';
import {
    computed,
    reactive,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import { MENU_ID } from '@/lib/menu/config';

import { SCOPE_TYPE, VIEWERS_TYPE } from '@/services/dashboards/dashboard-main/type';


const store = useStore();
const { t } = useI18n();

const state = reactive({
    viewerFilterList: computed(() => [
        { label: t('DASHBOARDS.ALL_DASHBOARDS.FILTER_ALL'), name: VIEWERS_TYPE.ALL },
        { label: t('DASHBOARDS.ALL_DASHBOARDS.FILTER_PUBLIC'), name: VIEWERS_TYPE.PUBLIC },
        { label: t('DASHBOARDS.ALL_DASHBOARDS.FILTER_PRIVATE'), name: VIEWERS_TYPE.PRIVATE },
    ]),
    scopeFilterList: computed(() => [
        { label: t('DASHBOARDS.ALL_DASHBOARDS.FILTER_ALL'), name: SCOPE_TYPE.ALL },
        { label: t('DASHBOARDS.ALL_DASHBOARDS.FILTER_ENTIRE_WORKSPACE'), name: SCOPE_TYPE.DOMAIN },
        { label: t('DASHBOARDS.ALL_DASHBOARDS.FILTER_SINGLE_PROJECT'), name: SCOPE_TYPE.PROJECT },
    ]),
    viewersStatus: computed(() => store.state.dashboard.viewers),
    scopeStatus: computed(() => store.state.dashboard.scope),
    pagePermission: computed(() => store.getters['user/pagePermissionMap']),
});

const handleChangeViewers = (selected) => {
    if (selected === state.viewersStatus) return;
    store.dispatch('dashboard/setSelectedViewers', selected);
};
const handleChangeScope = (selected) => {
    if (selected === state.scopeStatus) return;
    store.dispatch('dashboard/setSelectedScope', selected);
};

</script>

<template>
    <div class="all-dashboards-select-filter">
        <span class="filter-header">{{ t('DASHBOARDS.ALL_DASHBOARDS.LABEL_VIWERS') }}</span>
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
                           :items="state.viewerFilterList"
                           :selected="state.viewersStatus"
                           style-type="transparent"
                           @update:selected="handleChangeViewers"
        />
        <template v-if="state.pagePermission[MENU_ID.DASHBOARDS_WORKSPACE] && state.pagePermission[MENU_ID.DASHBOARDS_PROJECT]">
            <p-divider class="divider"
                       vertical
            />
            <span class="filter-header">{{ t('DASHBOARDS.ALL_DASHBOARDS.LABEL_SCOPE') }}</span>
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
                               :items="state.scopeFilterList"
                               :selected="state.scopeStatus"
                               style-type="transparent"
                               @update:selected="handleChangeScope"
            />
        </template>
    </div>
</template>

<style lang="postcss" scoped>
.all-dashboards-select-filter {
    @apply flex items-center;
    height: 2rem;
    margin: 1.125rem 0 0.625rem;
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
