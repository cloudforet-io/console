<script lang="ts" setup>

import { useRoute } from 'vue-router';

import { useBreadcrumbs } from '@/common/composables/breadcrumbs';
import CenteredPageLayout from '@/common/modules/page-layouts/CenteredPageLayout.vue';
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';
import VerticalPageLayout from '@/common/modules/page-layouts/VerticalPageLayout.vue';

import DashboardsLNB from '@/services/dashboards/DashboardsLNB.vue';

const route = useRoute();

const { breadcrumbs } = useBreadcrumbs();

</script>

<template>
    <vertical-page-layout v-if="route.meta.lnbVisible"
                          :breadcrumbs="breadcrumbs"
    >
        <template #sidebar>
            <dashboards-l-n-b />
        </template>
        <template #default>
            <router-view />
        </template>
    </vertical-page-layout>
    <centered-page-layout v-else-if="$route.meta.centeredLayout"
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
