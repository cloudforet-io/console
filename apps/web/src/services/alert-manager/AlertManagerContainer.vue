<script lang="ts" setup>
import { LocalStorageAccessor } from '@cloudforet/core-lib/local-storage-accessor';
import { computed, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';

import { useBreadcrumbs } from '@/common/composables/breadcrumbs';
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';
import VerticalPageLayout from '@/common/modules/page-layouts/VerticalPageLayout.vue';

import AlertManagerLNB from '@/services/alert-manager/AlertManagerLNB.vue';
import { useAlertManagerSettingsStore } from '@/services/alert-manager/store/alert-manager-settings-store';

const route = useRoute();
const store = useStore();

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

</script>

<template>
    <vertical-page-layout v-if="route.meta.lnbVisible"
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
</template>
