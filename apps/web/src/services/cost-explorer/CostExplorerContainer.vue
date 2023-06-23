<template>
    <fragment>
        <vertical-page-layout v-if="$route.meta.lnbVisible"
                              :breadcrumbs="breadcrumbs"
        >
            <template #sidebar>
                <cost-explorer-l-n-b />
            </template>
            <template #default>
                <router-view />
            </template>
        </vertical-page-layout>
        <general-page-layout v-else
                             :breadcrumbs="breadcrumbs"
        >
            <router-view />
        </general-page-layout>
    </fragment>
</template>

<script lang="ts">
import { computed } from 'vue';

import { LocalStorageAccessor } from '@cloudforet/core-lib/local-storage-accessor';

import { store } from '@/store';

import { useBreadcrumbs } from '@/common/composables/breadcrumbs';
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';
import VerticalPageLayout from '@/common/modules/page-layouts/VerticalPageLayout.vue';

import CostExplorerLNB from '@/services/cost-explorer/CostExplorerLNB.vue';
import { useCostExplorerSettingsStore } from '@/services/cost-explorer/store/cost-explorer-settings-store';

export default {
    name: 'CostExplorerContainer',
    components: {
        GeneralPageLayout,
        CostExplorerLNB,
        VerticalPageLayout,
    },
    setup() {
        const { breadcrumbs } = useBreadcrumbs();
        const userId = computed(() => store.state.user.userId);
        const costExplorerSettings = useCostExplorerSettingsStore();
        costExplorerSettings.$onAction((action) => {
            action.after(() => {
                if (window) {
                    const settings = LocalStorageAccessor.getItem(userId.value) ?? {};
                    settings.costExplorer = action.store.$state;
                    LocalStorageAccessor.setItem(userId.value, settings);
                }
            });
        });

        /* Init */
        (async () => {
            await store.dispatch('settings/initSettings');
        })();

        return {
            breadcrumbs,
        };
    },
};
</script>
