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
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';
import VerticalPageLayout from '@/common/modules/page-layouts/VerticalPageLayout.vue';

import AlertManagerLNB from '@/services/alert-manager/AlertManagerLNB.vue';

export default {
    name: 'AlertManagerContainer',
    components: {
        AlertManagerLNB,
        VerticalPageLayout,
        GeneralPageLayout,
    },
    setup() {
        const { breadcrumbs } = useBreadcrumbs();
        return {
            breadcrumbs,
        };
    },
};
</script>
