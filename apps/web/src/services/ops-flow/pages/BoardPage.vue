<script setup lang="ts">
import { watch, computed } from 'vue';
import { useRoute } from 'vue-router/composables';

import {
    PHeadingLayout, PHeading, PButton,
} from '@cloudforet/mirinae';

import { useProperRouteLocation } from '@/common/composables/proper-route-location';

import BoardTaskTable from '@/services/ops-flow/components/BoardTaskTable.vue';
import { OPS_FLOW_ROUTE } from '@/services/ops-flow/routes/route-constant';
import { useBoardPageStore } from '@/services/ops-flow/stores/board-page-store';
import type { TaskCreatePageQuery } from '@/services/ops-flow/types/task-create-page-type';

const route = useRoute();

const { getProperRouteLocation } = useProperRouteLocation();

const boardPageStore = useBoardPageStore();

const taskCreatePageLink = computed(() => getProperRouteLocation({
    name: OPS_FLOW_ROUTE.BOARD.TASK_CREATE._NAME,
    query: { categoryId: route.query.categoryId } as TaskCreatePageQuery,
}));

watch(() => route.query.categoryId, (categoryId) => {
    boardPageStore.setCurrentCategoryId(categoryId as string);
}, { immediate: true });

</script>

<template>
    <div>
        <p-heading-layout class="mb-6">
            <template #heading>
                <p-heading>Board</p-heading>
            </template>
            <template #extra>
                <router-link v-slot="{ navigate }"
                             :to="taskCreatePageLink"
                             custom
                >
                    <p-button icon-left="ic_plus_bold"
                              @click="navigate"
                    >
                        Create Ticket
                    </p-button>
                </router-link>
            </template>
        </p-heading-layout>
        <board-task-table />
    </div>
</template>

