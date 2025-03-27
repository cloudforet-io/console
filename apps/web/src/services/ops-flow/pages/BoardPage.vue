<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router/composables';

import {
    PHeadingLayout, PHeading, PButton,
} from '@cloudforet/mirinae';

import { queryStringToString } from '@/lib/router-query-string';

import { usePageEditableStatus } from '@/common/composables/page-editable-status';

import BoardTaskTable from '@/services/ops-flow/components/BoardTaskTable.vue';
import { OPS_FLOW_ROUTE } from '@/services/ops-flow/routes/route-constant';
import {
    useTaskManagementTemplateStore,
} from '@/services/ops-flow/task-management-templates/stores/use-task-management-template-store';
import type { TaskCreatePageQuery } from '@/services/ops-flow/types/task-create-page-type';

const route = useRoute();


const taskManagementTemplateStore = useTaskManagementTemplateStore();

const { hasReadWriteAccess } = usePageEditableStatus();

const taskCreatePageLink = computed(() => ({
    name: OPS_FLOW_ROUTE.BOARD.TASK_CREATE._NAME,
    query: { categoryId: route.query.categoryId } as TaskCreatePageQuery,
}));


const categoryId = computed(() => queryStringToString(route.query.categoryId));

</script>

<template>
    <div>
        <p-heading-layout class="mb-6">
            <template #heading>
                <p-heading>{{ taskManagementTemplateStore.templates.TaskBoard }}</p-heading>
            </template>
            <template #extra>
                <router-link v-if="hasReadWriteAccess"
                             v-slot="{ navigate }"
                             :to="taskCreatePageLink"
                             custom
                >
                    <p-button icon-left="ic_plus_bold"
                              @click="navigate"
                    >
                        {{ $t('OPSFLOW.ADD_TARGET', {target: taskManagementTemplateStore.templates.Task}) }}
                    </p-button>
                </router-link>
            </template>
        </p-heading-layout>
        <board-task-table :category-id="categoryId" />
    </div>
</template>

