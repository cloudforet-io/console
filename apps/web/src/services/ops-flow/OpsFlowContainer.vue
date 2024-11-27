<template>
    <fragment>
        <vertical-page-layout v-if="$route.meta.lsbVisible"
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

<script lang="ts">
import {
    defineComponent,
} from 'vue';

import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';
import VerticalPageLayout from '@/common/modules/page-layouts/VerticalPageLayout.vue';

import OpsFlowLSB from '@/services/ops-flow/OpsFlowLSB.vue';

export default defineComponent({
    name: 'OpsFlowContainer',
    components: {
        VerticalPageLayout,
        GeneralPageLayout,
        OpsFlowLSB,
    },
    setup() {
        return {
        };
    },
});
</script>
