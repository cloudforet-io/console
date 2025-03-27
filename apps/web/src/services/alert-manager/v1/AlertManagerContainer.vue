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

import { useUserStore } from '@/store/user/user-store';

import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';

import { useAlertManagerSettingsStore } from '@/services/alert-manager/v1/stores/alert-manager-settings-store';

export default {
    name: 'AlertManagerContainer',
    components: {
        GeneralPageLayout,
    },
    setup() {
        const userStore = useUserStore();
        const userId = computed(() => userStore.state.userId || '');
        const alertManagerSettings = useAlertManagerSettingsStore();
        alertManagerSettings.initState(userId.value);
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
    },
};
</script>
