<script setup lang="ts">
import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import LSBContainer from '@/common/modules/navigations/new-lsb/LSBContainer.vue';
import LSBDivider from '@/common/modules/navigations/new-lsb/LSBDivider.vue';
import LSBRouterButton from '@/common/modules/navigations/new-lsb/LSBRouterButton.vue';
import LSBRouterItem from '@/common/modules/navigations/new-lsb/LSBRouterItem.vue';
import LSBTopTitle from '@/common/modules/navigations/new-lsb/LSBTopTitle.vue';

import { OPS_FLOW_ROUTE } from '@/services/ops-flow/routes/route-constant';
import { useTaskCategoryStore } from '@/services/ops-flow/stores/admin/task-category-store';

const taskCategoryStore = useTaskCategoryStore();
const taskCategoryGetters = taskCategoryStore.getters;
const { getProperRouteLocation } = useProperRouteLocation();
</script>

<template>
    <l-s-b-container>
        <l-s-b-router-button icon="ic_dots-4-square"
                             :to="getProperRouteLocation({
                                 name: OPS_FLOW_ROUTE.BOARD._NAME
                             })"
        >
            All Categories
        </l-s-b-router-button>
        <l-s-b-divider />
        <l-s-b-top-title>Category</l-s-b-top-title>
        <l-s-b-router-item v-for="(category, idx) in taskCategoryGetters.taskCategories"
                           :id="category.category_id"
                           :key="category.category_id"
                           :index="idx"
                           :to="getProperRouteLocation({
                               name: OPS_FLOW_ROUTE.BOARD._NAME,
                               params: { categoryId: category.category_id }
                           })"
        >
            {{ category.name }}
        </l-s-b-router-item>
    </l-s-b-container>
</template>
