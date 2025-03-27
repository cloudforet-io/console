<script setup lang="ts">
import { onMounted } from 'vue';

import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import LSBContainer from '@/common/modules/navigations/new-lsb/LSBContainer.vue';
import LSBDivider from '@/common/modules/navigations/new-lsb/LSBDivider.vue';
import LSBLoadingSpinner from '@/common/modules/navigations/new-lsb/LSBLoadingSpinner.vue';
import LSBRouterButton from '@/common/modules/navigations/new-lsb/LSBRouterButton.vue';
import LSBRouterItem from '@/common/modules/navigations/new-lsb/LSBRouterItem.vue';
import LSBTopTitle from '@/common/modules/navigations/new-lsb/LSBTopTitle.vue';
import type { LSBRouterPredicate } from '@/common/modules/navigations/new-lsb/type';

import { OPS_FLOW_ROUTE } from '@/services/ops-flow/routes/route-constant';
import { useTaskCategoryStore } from '@/services/ops-flow/stores/task-category-store';
import {
    useTaskManagementTemplateStore,
} from '@/services/ops-flow/task-management-templates/stores/use-task-management-template-store';

const taskCategoryStore = useTaskCategoryStore();
const taskCategoryGetters = taskCategoryStore.getters;
const taskManagementTemplateStore = useTaskManagementTemplateStore();
const { getProperRouteLocation } = useProperRouteLocation();
const predicate: LSBRouterPredicate = (to, currentRoute) => to.query?.categoryId === currentRoute.query.categoryId;

onMounted(() => {
    taskCategoryStore.list();
});
</script>

<template>
    <l-s-b-container>
        <l-s-b-router-button id="all-categories"
                             icon="ic_dots-4-square"
                             :to="getProperRouteLocation({
                                 name: OPS_FLOW_ROUTE.BOARD._NAME
                             })"
                             :predicate="predicate"
        >
            <span class="capitalize">{{ $t('OPSFLOW.ALL_TASKS', {
                tasks: taskManagementTemplateStore.templates.tasks
            }) }}</span>
        </l-s-b-router-button>
        <l-s-b-divider />
        <l-s-b-top-title>{{ taskManagementTemplateStore.templates.TaskCategory }}</l-s-b-top-title>
        <l-s-b-loading-spinner :loading="taskCategoryGetters.loading" />
        <l-s-b-router-item v-for="(category, idx) in taskCategoryGetters.taskCategories"
                           :id="`${category.category_id}-${idx}`"
                           :key="`${category.category_id}-${idx}`"
                           :index="idx"
                           :to="getProperRouteLocation({
                               name: OPS_FLOW_ROUTE.BOARD._NAME,
                               query: { categoryId: category.category_id }
                           })"
                           :predicate="predicate"
        >
            {{ category.name }}
        </l-s-b-router-item>
    </l-s-b-container>
</template>
