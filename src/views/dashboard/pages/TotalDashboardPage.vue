<template>
    <general-page-layout class="dashboard">
        <p class="text-xl font-bold">
            ROOT DOMAIN - TOTAL DASHBOARD
        </p>
    </general-page-layout>
</template>

<script lang="ts">
import {
    ComponentRenderProxy, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';

import GeneralPageLayout from '@/common/components/layouts/GeneralPageLayout.vue';


export default {
    name: 'TotalDashboardPage',
    components: {
        GeneralPageLayout,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
        });

        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>
.total-dashboard {
}

</style>
