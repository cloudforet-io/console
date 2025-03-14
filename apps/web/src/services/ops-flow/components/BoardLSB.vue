<script setup lang="ts">
import { PIconButton } from '@cloudforet/mirinae';

import LSBContainer from '@/common/modules/navigations/new-lsb/LSBContainer.vue';
import LSBDivider from '@/common/modules/navigations/new-lsb/LSBDivider.vue';
import LSBLoadingSpinner from '@/common/modules/navigations/new-lsb/LSBLoadingSpinner.vue';
import LSBRouterButton from '@/common/modules/navigations/new-lsb/LSBRouterButton.vue';
import LSBRouterItem from '@/common/modules/navigations/new-lsb/LSBRouterItem.vue';
import LSBTopTitle from '@/common/modules/navigations/new-lsb/LSBTopTitle.vue';
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
        <l-s-b-router-button id="all-categories"
                             icon="ic_dots-4-square"
                             :to="{
                                 name: OPS_FLOW_ROUTE.BOARD._NAME
                             }"
                             :predicate="predicate"
        >
            <span class="capitalize">{{ $t('OPSFLOW.ALL_TASKS', {
                tasks: taskManagementTemplateStore.templates.tasks
            }) }}</span>
        </l-s-b-router-button>
        <l-s-b-divider />
        <l-s-b-top-title>
            {{ taskManagementTemplateStore.templates.TaskCategory }}
            <template #right-end>
                <p-icon-button name="ic_refresh"
                               size="sm"
                               shape="square"
                               @click="refetch"
                />
            </template>
        </l-s-b-top-title>
        <l-s-b-loading-spinner :loading="isLoading" />
        <l-s-b-router-item v-for="(category, idx) in availableCategories"
                           :id="`${category.category_id}-${idx}`"
                           :key="`${category.category_id}-${idx}`"
                           :index="idx"
                           :to="{
                               name: OPS_FLOW_ROUTE.BOARD._NAME,
                               query: { categoryId: category.category_id }
                           }"
                           :predicate="predicate"
        >
            {{ category.name }}
        </l-s-b-router-item>
    </l-s-b-container>
</template>
