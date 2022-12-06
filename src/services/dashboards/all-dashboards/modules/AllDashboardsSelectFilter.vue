<template>
    <div class="all-dashboards-select-filter">
        <span class="filter-header">Viewers</span>
        <p-select-status v-for="(view, idx) in viewerFilterList"
                         :key="`view-${idx}`"
                         v-model="viewersStatus"
                         class="select-desktop"
                         :value="view.name"
        >
            {{ view.label }}
        </p-select-status>
        <p-select-dropdown class="select-tablet"
                           :items="viewerFilterList"
                           :selected.sync="viewersStatus"
                           style-type="transparent"
        />
        <p-divider class="divider"
                   vertical
        />
        <span class="filter-header">Scope</span>
        <p-select-status v-for="(scope, idx) in scopeFilterList"
                         :key="`scope-${idx}`"
                         v-model="scopeStatus"
                         class="select-desktop"
                         :value="scope.name"
        >
            {{ scope.label }}
        </p-select-status>
        <p-select-dropdown class="select-tablet"
                           :items="scopeFilterList"
                           :selected.sync="scopeStatus"
                           style-type="transparent"
        />
    </div>
</template>

<script lang="ts">
import {
    computed, defineComponent,
    reactive, toRefs, watch,
} from 'vue';

import { PSelectDropdown, PSelectStatus, PDivider } from '@spaceone/design-system';

import { store } from '@/store';
import { i18n } from '@/translations';

import { SCOPE_TYPE, VIEWERS_TYPE } from '@/services/dashboards/all-dashboards/type';

export default defineComponent({
    name: 'AllDashboardsSelectFilter',
    components: { PSelectStatus, PSelectDropdown, PDivider },
    setup() {
        const state = reactive({
            viewerFilterList: computed(() => [
                { label: i18n.t('All'), name: VIEWERS_TYPE.ALL },
                { label: i18n.t('Pubilc'), name: VIEWERS_TYPE.PUBLIC },
                { label: i18n.t('Private'), name: VIEWERS_TYPE.PRIVATE },
            ]),
            scopeFilterList: computed(() => [
                { label: i18n.t('All'), name: SCOPE_TYPE.ALL },
                { label: i18n.t('Entire Workspace'), name: SCOPE_TYPE.DOMAIN },
                { label: i18n.t('Single Project'), name: SCOPE_TYPE.PROJECT },
            ]),
            viewersStatus: store.state.dashboard.viewers,
            scopeStatus: store.state.dashboard.scope,
        });

        watch(() => state.viewersStatus, (selectedViewers) => {
            store.dispatch('dashboard/setSelectedViewers', selectedViewers);
        });
        watch(() => state.scopeStatus, (selectedScope) => {
            store.dispatch('dashboard/setSelectedScope', selectedScope);
        });

        return {
            ...toRefs(state),
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
