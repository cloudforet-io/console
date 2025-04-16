<script setup lang="ts">

import { computed } from 'vue';

import type { DashboardFolderModel, DashboardModel } from '@/api-clients/dashboard/_types/dashboard-type';

import { provideDashboardEntryPoint } from '@/services/_shared/dashboard/core/composables/_internal/dashboard-shared-entry-context';
import type { DashboardSharedEntryPoint } from '@/services/_shared/dashboard/core/types/dashboard-shared-type';
import DashboardCreateBody from '@/services/_shared/dashboard/dashboard-create/contextual-components/DashboardCreateBody.vue';


interface Props {
    dashboardItems: Array<DashboardModel>;
    folderItems: Array<DashboardFolderModel>;
    entryPoint: DashboardSharedEntryPoint;
}

const props = defineProps<Props>();
const emit = defineEmits<{(e: 'select-toolset', toolsetId: string|undefined): void;
}>();
/* Provide Dashboard Entry Point */
provideDashboardEntryPoint(computed(() => props.entryPoint));

</script>

<template>
    <dashboard-create-body :dashboard-items="props.dashboardItems"
                           :folder-items="props.folderItems"
                           @select-toolset="emit('select-toolset', $event)"
    />
</template>
