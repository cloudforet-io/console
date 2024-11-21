<script lang="ts">
// eslint-disable-next-line import/order,import/no-duplicates
import { defineComponent, type ComponentPublicInstance } from 'vue';

interface IInstance extends ComponentPublicInstance {
    setPathFrom(from: any): void
}

export default defineComponent({
    beforeRouteEnter(to, from, next) {
        next((vm) => {
            const instance = vm as unknown as IInstance;
            instance.setPathFrom(from);
        });
    },
});
</script>
<script setup lang="ts">
/* eslint-disable import/first */
// eslint-disable-next-line import/no-duplicates,import/order
import type { DeepReadonly } from 'vue';
// eslint-disable-next-line import/no-duplicates
import { computed } from 'vue';
import { useRoute } from 'vue-router/composables';

import { PHeading } from '@cloudforet/mirinae';

import type { TaskCategoryModel } from '@/schema/opsflow/task-category/model';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

import { useGoBack } from '@/common/composables/go-back';

import { OPS_FLOW_ROUTE } from '@/services/ops-flow/routes/route-constant';
import { useTaskManagementPageStore } from '@/services/ops-flow/stores/admin/task-management-page-store';

const route = useRoute();

const taskManagementPageStore = useTaskManagementPageStore();
const taskCategoryStore = taskManagementPageStore.taskCategoryStore;

const category = computed<DeepReadonly<TaskCategoryModel|undefined>>(() => taskCategoryStore.getters.taskCategories.find((c) => c.category_id === route.params.taskCategoryId));
const headerTitle = computed(() => category.value?.name);

const {
    setPathFrom,
    handleClickBackButton,
} = useGoBack({
    name: makeAdminRouteName(OPS_FLOW_ROUTE.TASK_MANAGEMENT._NAME),
});

defineExpose({ setPathFrom });
</script>

<template>
    <p-heading show-back-button
               @click-back-button="handleClickBackButton"
    >
        {{ headerTitle }}
    </p-heading>
</template>
