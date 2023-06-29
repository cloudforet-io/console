<script lang="ts" setup>
import {
    onUnmounted,
} from 'vue';
import { useRoute } from 'vue-router';

import { useBreadcrumbs } from '@/common/composables/breadcrumbs';
import CenteredPageLayout from '@/common/modules/page-layouts/CenteredPageLayout.vue';
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';
import VerticalPageLayout from '@/common/modules/page-layouts/VerticalPageLayout.vue';

import AssetInventoryLNB from '@/services/asset-inventory/AssetInventoryLNB.vue';
import { useCloudServiceDetailPageStore } from '@/services/asset-inventory/store/cloud-service-detail-page-store';
import { useCloudServicePageStore } from '@/services/asset-inventory/store/cloud-service-page-store';

const route = useRoute();

const cloudServicePageStore = useCloudServicePageStore();
const cloudServiceDetailPageStore = useCloudServiceDetailPageStore();

const { breadcrumbs } = useBreadcrumbs();

onUnmounted(() => {
    cloudServicePageStore.$dispose();
    cloudServicePageStore.$reset();
    cloudServiceDetailPageStore.$dispose();
    cloudServiceDetailPageStore.$reset();
});

</script>

<template>
    <vertical-page-layout v-if="route.meta.lnbVisible"
                          :breadcrumbs="breadcrumbs"
    >
        <template #sidebar>
            <asset-inventory-l-n-b />
        </template>
        <template #default>
            <router-view />
        </template>
    </vertical-page-layout>
    <centered-page-layout v-else-if="route.meta.centeredLayout"
                          has-nav-bar
    >
        <router-view />
    </centered-page-layout>
    <general-page-layout v-else
                         :breadcrumbs="breadcrumbs"
    >
        <router-view />
    </general-page-layout>
</template>
