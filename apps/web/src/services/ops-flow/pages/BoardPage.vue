<script setup lang="ts">
import {
    PHeadingLayout, PHeading, PButton,
} from '@cloudforet/mirinae';

import BoardTaskTable from '@/services/ops-flow/components/BoardTaskTable.vue';

// const props = defineProps<{
//     categoryId?: string;
// }>();
</script>

<template>
    <div>
        <p-heading-layout class="mb-6">
            <template #heading>
                <p-heading>Board</p-heading>
            </template>
            <template #extra>
                <p-button icon-left="ic_plus_bold">
                    Create Ticket
                </p-button>
            </template>
        </p-heading-layout>
        <board-task-table />
    </div>
</template>

