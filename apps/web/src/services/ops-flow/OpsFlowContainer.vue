<template>
    <fragment>
        <vertical-page-layout v-if="route.meta.lsbVisible"
                              class="ops-flow-container"
        >
            <template #sidebar>
                <ops-flow-l-s-b />
            </template>
            <template #default>
                <router-view />
            </template>
        </vertical-page-layout>
        <general-page-layout v-else>
            <router-view />
        </general-page-layout>
    </fragment>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router/composables';

import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';
import VerticalPageLayout from '@/common/modules/page-layouts/VerticalPageLayout.vue';

import OpsFlowLSB from '@/services/ops-flow/OpsFlowLSB.vue';

const route = useRoute();
</script>
