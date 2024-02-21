<script setup lang="ts">
import { onUnmounted } from 'vue';

import { useTopBarHeaderStore } from '@/common/modules/navigations/top-bar/modules/top-bar-header/store';
import CenteredPageLayout from '@/common/modules/page-layouts/CenteredPageLayout.vue';
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';
import VerticalPageLayout from '@/common/modules/page-layouts/VerticalPageLayout.vue';

import ProjectLNB from '@/services/project/ProjectLNB.vue';

const topBarHeaderStore = useTopBarHeaderStore();

onUnmounted(() => {
    topBarHeaderStore.initState();
});
</script>

<template>
    <fragment>
        <vertical-page-layout v-if="$route.meta.lnbVisible">
            <template #sidebar>
                <project-l-n-b />
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
        <general-page-layout v-else>
            <router-view />
        </general-page-layout>
    </fragment>
</template>
