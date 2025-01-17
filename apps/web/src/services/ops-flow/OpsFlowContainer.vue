<template>
    <fragment>
        <vertical-page-layout v-if="route.meta?.lsbVisible"
                              class="ops-flow-container"
        >
            <template #sidebar>
                <ops-flow-l-s-b />
            </template>
            <template #default>
                <router-view />
            </template>
        </vertical-page-layout>
        <general-page-layout v-else-if="!isLanding">
            <router-view />
        </general-page-layout>
        <router-view v-else />
    </fragment>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router/composables';

import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';
import VerticalPageLayout from '@/common/modules/page-layouts/VerticalPageLayout.vue';

import OpsFlowLSB from '@/services/ops-flow/OpsFlowLSB.vue';
import { OPS_FLOW_ROUTE } from '@/services/ops-flow/routes/route-constant';

const route = useRoute();
const isLanding = computed(() => route.name === OPS_FLOW_ROUTE.LANDING._NAME);
</script>
