<script lang="ts" setup>
import { LocalStorageAccessor } from '@cloudforet/core-lib/local-storage-accessor';
import { computed, onUnmounted } from 'vue';
import { useStore } from 'vuex';

import { useBreadcrumbs } from '@/common/composables/breadcrumbs';
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';
import VerticalPageLayout from '@/common/modules/page-layouts/VerticalPageLayout.vue';

import CostExplorerLNB from '@/services/cost-explorer/CostExplorerLNB.vue';
import { useCostExplorerSettingsStore } from '@/services/cost-explorer/store/cost-explorer-settings-store';

const store = useStore();

const { breadcrumbs } = useBreadcrumbs();
const userId = computed(() => store.state.user.userId);
const costExplorerSettingsStore = useCostExplorerSettingsStore();
costExplorerSettingsStore.initState();
costExplorerSettingsStore.$onAction((action) => {
    action.after(() => {
        if (window) {
            const settings = LocalStorageAccessor.getItem(userId.value) ?? {};
            settings.costExplorer = action.store.$state;
            LocalStorageAccessor.setItem(userId.value, settings);
        }
    });
});

onUnmounted(() => {
    costExplorerSettingsStore.$dispose();
    costExplorerSettingsStore.$reset();
});

</script>

<template>
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
</template>
