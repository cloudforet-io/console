<template>
    <vertical-page-layout :min-width="0" :init-width="260" :max-width="400">
        <template #sidebar>
            <div @click="goToSpotDashboard">
                spot automation dashboard page
            </div>
            <div @click="goToSpotGroup">
                spot automation group page
            </div>
        </template>
        <template #default>
            <router-view />
        </template>
    </vertical-page-layout>
</template>

<script lang="ts">
import { ComponentRenderProxy, getCurrentInstance } from '@vue/composition-api';
import VerticalPageLayout from '@/views/common/components/page-layout/VerticalPageLayout.vue';

export default {
    name: 'SpotAutomationMainPage',
    components: { VerticalPageLayout },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const goToSpotDashboard = () => {
            vm.$router.replace({ name: 'spotDashboard' }).catch(() => {});
        };
        const goToSpotGroup = () => {
            vm.$router.replace({ name: 'spotGroup' }).catch(() => {});
        };
        return {
            goToSpotDashboard,
            goToSpotGroup,
        };
    },
};
</script>

<style lang="postcss" scoped>

</style>
