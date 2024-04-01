<script setup lang="ts">
import { onUnmounted } from 'vue';

import { useGnbStore } from '@/common/modules/navigations/stores/gnb-store';
import CenteredPageLayout from '@/common/modules/page-layouts/CenteredPageLayout.vue';
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';
import VerticalPageLayout from '@/common/modules/page-layouts/VerticalPageLayout.vue';

import ProjectLSB from '@/services/project/ProjectLSB.vue';
import { useProjectPageStore } from '@/services/project/stores/project-page-store';

const gnbStore = useGnbStore();
const projectPageStore = useProjectPageStore();

onUnmounted(() => {
    gnbStore.initState();
    projectPageStore.reset();
});
</script>

<template>
    <fragment>
        <vertical-page-layout v-if="$route.meta.lsbVisible">
            <template #sidebar>
                <project-l-s-b />
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
