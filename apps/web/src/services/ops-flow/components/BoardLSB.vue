<script setup lang="ts">
import { PIconButton } from '@cloudforet/mirinae';

import LSBContainer from '@/common/modules/navigations/new-lsb/LSBContainer.vue';
import LSBDivider from '@/common/modules/navigations/new-lsb/LSBDivider.vue';
import LSBItem from '@/common/modules/navigations/new-lsb/LSBItem.vue';
import LSBLoadingSpinner from '@/common/modules/navigations/new-lsb/LSBLoadingSpinner.vue';
import LSBTitle from '@/common/modules/navigations/new-lsb/LSBTitle.vue';
import type { LSBRouterPredicate } from '@/common/modules/navigations/new-lsb/type';

import { useAvailableCategories } from '@/services/ops-flow/composables/use-available-categories';
import { OPS_FLOW_ROUTE } from '@/services/ops-flow/routes/route-constant';
import {
    useTaskManagementTemplateStore,
} from '@/services/ops-flow/task-management-templates/stores/use-task-management-template-store';

const taskManagementTemplateStore = useTaskManagementTemplateStore();
const predicate: LSBRouterPredicate = (to, currentRoute) => to.query?.categoryId === currentRoute.query.categoryId;

/* categories */
const { availableCategories, isLoading, refetch } = useAvailableCategories();
</script>

<template>
    <l-s-b-container>
        <l-s-b-title id="all-tasks"
                     icon="ic_dots-4-square"
                     selectable
                     :link="{
                         to: {
                             name: OPS_FLOW_ROUTE.BOARD._NAME
                         },
                         predicate,
                     }"
        >
            <span class="capitalize font-normal">{{ $t('OPSFLOW.ALL_TASKS', {
                tasks: taskManagementTemplateStore.templates.tasks
            }) }}</span>
        </l-s-b-title>
        <l-s-b-divider />
        <l-s-b-title id="categories">
            <span class="capitalize">{{ taskManagementTemplateStore.templates.TaskCategory }}</span>
            <template #outer-right>
                <p-icon-button name="ic_refresh"
                               size="sm"
                               shape="square"
                               @click="refetch"
                />
            </template>
        </l-s-b-title>
        <l-s-b-loading-spinner :loading="isLoading" />
        <l-s-b-item v-for="(category, idx) in availableCategories"
                    :id="`${category.category_id}-${idx}`"
                    :key="`${category.category_id}-${idx}`"
                    :name="category.name"
                    :link="{
                        to: {
                            name: OPS_FLOW_ROUTE.BOARD._NAME,
                            query: { categoryId: category.category_id }
                        },
                        predicate,
                    }"
        />
    </l-s-b-container>
</template>
