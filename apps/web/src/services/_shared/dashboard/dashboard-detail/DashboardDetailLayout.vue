<script setup lang="ts">

import { computed } from 'vue';

import type { DashboardFolderModel, DashboardModel } from '@/api-clients/dashboard/_types/dashboard-type';

import { provideDashboardEntryPoint } from '@/services/_shared/dashboard/core/composables/_internal/dashboard-shared-entry-context';
import type { DashboardSharedEntryPoint } from '@/services/_shared/dashboard/core/types/dashboard-shared-type';
import DashboardDetailBody from '@/services/_shared/dashboard/dashboard-detail/contextual-components/DashboardDetailBody.vue';

interface Props {
    dashboardId: string;
    dashboardItems?: Array<DashboardModel>;
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
    <dashboard-detail-body :dashboard-id="props.dashboardId"
                           :dashboard-items="props.dashboardItems"
                           :folder-items="props.folderItems"
                           @select-toolset="emit('select-toolset', $event)"
    />
</template>
