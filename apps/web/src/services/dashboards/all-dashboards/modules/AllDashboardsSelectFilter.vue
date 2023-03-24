<template>
    <div class="all-dashboards-select-filter">
        <span class="filter-header">{{ $t('DASHBOARDS.ALL_DASHBOARDS.LABEL_VIWERS') }}</span>
        <p-select-status v-for="(view, idx) in viewerFilterList"
                         :key="`view-${idx}`"
                         :selected="viewersStatus"
                         class="select-desktop"
                         :value="view.name"
                         @change="handleChangeViewers"
        >
            {{ view.label }}
        </p-select-status>
        <p-select-dropdown class="select-tablet"
                           :items="viewerFilterList"
                           :selected="viewersStatus"
                           style-type="transparent"
                           @update:selected="handleChangeViewers"
        />
        <template v-if="pagePermission[MENU_ID.DASHBOARDS_WORKSPACE] && pagePermission[MENU_ID.DASHBOARDS_PROJECT]">
            <p-divider class="divider"
                       vertical
            />
            <span class="filter-header">{{ $t('DASHBOARDS.ALL_DASHBOARDS.LABEL_SCOPE') }}</span>
            <p-select-status v-for="(scope, idx) in scopeFilterList"
                             :key="`scope-${idx}`"
                             :selected="scopeStatus"
                             class="select-desktop"
                             :value="scope.name"
                             @change="handleChangeScope"
            >
                {{ scope.label }}
            </p-select-status>
            <p-select-dropdown class="select-tablet"
                               :items="scopeFilterList"
                               :selected="scopeStatus"
                               style-type="transparent"
                               @update:selected="handleChangeScope"
            />
        </template>
    </div>
</template>

<script lang="ts">
import {
    computed, defineComponent,
    reactive, toRefs,
} from 'vue';

import { PSelectDropdown, PSelectStatus, PDivider } from '@spaceone/design-system';

import { store } from '@/store';
import { i18n } from '@/translations';

import { MENU_ID } from '@/lib/menu/config';

import { SCOPE_TYPE, VIEWERS_TYPE } from '@/services/dashboards/all-dashboards/type';

export default defineComponent({
    name: 'AllDashboardsSelectFilter',
    components: { PSelectStatus, PSelectDropdown, PDivider },
    setup() {
        const state = reactive({
            viewerFilterList: computed(() => [
                { label: i18n.t('DASHBOARDS.ALL_DASHBOARDS.FILTER_ALL'), name: VIEWERS_TYPE.ALL },
                { label: i18n.t('DASHBOARDS.ALL_DASHBOARDS.FILTER_PUBLIC'), name: VIEWERS_TYPE.PUBLIC },
                { label: i18n.t('DASHBOARDS.ALL_DASHBOARDS.FILTER_PRIVATE'), name: VIEWERS_TYPE.PRIVATE },
            ]),
            scopeFilterList: computed(() => [
                { label: i18n.t('DASHBOARDS.ALL_DASHBOARDS.FILTER_ALL'), name: SCOPE_TYPE.ALL },
                { label: i18n.t('DASHBOARDS.ALL_DASHBOARDS.FILTER_ENTIRE_WORKSPACE'), name: SCOPE_TYPE.DOMAIN },
                { label: i18n.t('DASHBOARDS.ALL_DASHBOARDS.FILTER_SINGLE_PROJECT'), name: SCOPE_TYPE.PROJECT },
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

        return {
            ...toRefs(state),
            handleChangeViewers,
            handleChangeScope,
            MENU_ID,
        };
    },
});
</script>

<style lang="postcss" scoped>
.all-dashboards-select-filter {
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
