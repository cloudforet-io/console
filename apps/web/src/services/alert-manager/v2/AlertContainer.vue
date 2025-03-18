<script lang="ts" setup>
import { onUnmounted } from 'vue';

import { useAlertPageStore } from '@/services/alert-manager/v2/stores/alert-page-store';

const alertPageStore = useAlertPageStore();

onUnmounted(() => {
    alertPageStore.init();
    alertPageStore.$dispose();
});
</script>

<template>
    <fragment>
        <router-view />
    </fragment>
</template>
