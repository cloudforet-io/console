<script setup lang="ts">
import {
    onUnmounted,
} from 'vue';

import { useProjectDetailPageStore } from '@/services/project/v1/stores/project-detail-page-store';


const projectDetailPageStore = useProjectDetailPageStore();

onUnmounted(() => {
    projectDetailPageStore.reset();
});

</script>

<template>
    <div class="project-detail-page">
        <router-view />
    </div>
</template>
