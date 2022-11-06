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
import { useBreadcrumbs } from '@/common/composables/breadcrumbs';
import { registerServiceStore } from '@/common/composables/register-service-store';
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';
import VerticalPageLayout from '@/common/modules/page-layouts/VerticalPageLayout.vue';

import AlertManagerLNB from '@/services/alert-manager/AlertManagerLNB.vue';
import { alertManagerStoreModule, alertManagerStore } from '@/services/alert-manager/store';

export default {
    name: 'AlertManagerContainer',
    components: {
        AlertManagerLNB,
        VerticalPageLayout,
        GeneralPageLayout,
    },
    setup() {
        registerServiceStore<any>('alertManager', alertManagerStoreModule, alertManagerStore);
        const { breadcrumbs } = useBreadcrumbs();
        return {
            breadcrumbs,
        };
    },
};
</script>
