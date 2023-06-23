<template>
    <fragment>
        <vertical-page-layout v-if="$route.meta.lnbVisible"
                              :breadcrumbs="breadcrumbs"
        >
            <template #sidebar>
                <alert-manager-l-n-b />
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
import { computed, onUnmounted } from 'vue';

import { LocalStorageAccessor } from '@cloudforet/core-lib/local-storage-accessor';

import { store } from '@/store';

import { useBreadcrumbs } from '@/common/composables/breadcrumbs';
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';
import VerticalPageLayout from '@/common/modules/page-layouts/VerticalPageLayout.vue';

import AlertManagerLNB from '@/services/alert-manager/AlertManagerLNB.vue';
import { useAlertManagerSettingsStore } from '@/services/alert-manager/store/alert-manager-settings-store';

export default {
    name: 'AlertManagerContainer',
    components: {
        AlertManagerLNB,
        VerticalPageLayout,
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
                    const settings = LocalStorageAccessor.getItem(userId.value);
                    if (settings) {
                        settings.alertManager = action.store.$state;
                        LocalStorageAccessor.setItem(userId.value, settings);
                    }
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
