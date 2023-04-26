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
                    const settings = window.localStorage.getItem(userId.value);
                    if (settings) {
                        const settingsObj = JSON.parse(settings);
                        settingsObj.costExplorer = action.store.$state;
                        window.localStorage.setItem(userId.value, JSON.stringify(settingsObj));
                    }
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
