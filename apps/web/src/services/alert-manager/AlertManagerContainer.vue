<template>
    <fragment>
        <general-page-layout>
            <router-view />
        </general-page-layout>
    </fragment>
</template>

<script lang="ts">
import { computed, onUnmounted } from 'vue';

import { LocalStorageAccessor } from '@cloudforet/core-lib/local-storage-accessor';

import { store } from '@/store';

import { useBreadcrumbs } from '@/common/composables/breadcrumbs';
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';

import { useAlertManagerSettingsStore } from '@/services/alert-manager/stores/alert-manager-settings-store';

export default {
    name: 'AlertManagerContainer',
    components: {
        GeneralPageLayout,
    },
    setup() {
        const { breadcrumbs } = useBreadcrumbs();
        const userId = computed(() => store.state.user.userId);
        const alertManagerSettings = useAlertManagerSettingsStore();
        alertManagerSettings.initState();
        alertManagerSettings.$onAction((action) => {
            action.after(() => {
                if (window) {
                    const settings = LocalStorageAccessor.getItem(userId.value) ?? {};
                    settings.alertManager = action.store.$state;
                    LocalStorageAccessor.setItem(userId.value, settings);
                }
            });
        });

        onUnmounted(() => {
            alertManagerSettings.$reset();
            alertManagerSettings.$dispose();
        });
        return {
            breadcrumbs,
        };
    },
};
</script>
