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
import { computed } from 'vue';

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
        alertManagerSettings.$onAction((action) => {
            action.after(() => {
                if (window) {
                    const settings = window.localStorage.getItem(userId.value);
                    if (settings) {
                        const settingsObj = JSON.parse(settings);
                        settingsObj.alertManager = action.store.$state;
                        window.localStorage.setItem(userId.value, JSON.stringify(settingsObj));
                    }
                }
            });
        });
        return {
            breadcrumbs,
        };
    },
};
</script>
