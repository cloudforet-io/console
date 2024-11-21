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
// eslint-disable-next-line import/no-duplicates
import { computed, onBeforeMount } from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import { PHeading, PTab, PSkeleton } from '@cloudforet/mirinae';
import type { TabItem } from '@cloudforet/mirinae/types/hooks/use-tab/type';


import { makeAdminRouteName } from '@/router/helpers/route-helper';

import { useGoBack } from '@/common/composables/go-back';

import TaskStatusDeleteModal from '@/services/ops-flow/components/TaskStatusDeleteModal.vue';
import TaskStatusForm from '@/services/ops-flow/components/TaskStatusForm.vue';
import TaskTypeForm from '@/services/ops-flow/components/TaskTypeForm.vue';
import { OPS_FLOW_ROUTE } from '@/services/ops-flow/routes/route-constant';
import { useTaskCategoryPageStore } from '@/services/ops-flow/stores/admin/task-category-page-store';

const props = defineProps<{
    taskCategoryId: string;
}>();
const router = useRouter();
const route = useRoute();

const taskCategoryPageStore = useTaskCategoryPageStore();
const taskCategoryPageGetters = taskCategoryPageStore.getters;
const taskCategoryStore = taskCategoryPageStore.taskCategoryStore;


/* header and back button */
const loading = computed<boolean>(() => taskCategoryStore.state.loading);
const headerTitle = computed<string>(() => taskCategoryPageGetters.currentCategory?.name ?? 'No Category');
const {
    setPathFrom,
    handleClickBackButton,
} = useGoBack({
    name: makeAdminRouteName(OPS_FLOW_ROUTE.TASK_MANAGEMENT._NAME),
});

/* tabs */
const tabs = computed<TabItem<object>[]>(() => [
    {
        name: 'status',
        label: 'Status', // TODO: i18n
        keepAlive: true,
    },
    {
        name: 'taskType',
        label: 'Ticket Topic', // TODO: i18n & template
        keepAlive: true,
    },
]);
const activeTab = computed(() => {
    if (route.name === makeAdminRouteName(OPS_FLOW_ROUTE.TASK_MANAGEMENT.TASK_CATEGORY.DETAIL.TASK_TYPE._NAME)) return 'taskType';
    return 'status';
});
const handleUpdateActiveTab = (tab: string) => {
    if (tab === 'taskType') {
        router.replace({
            name: makeAdminRouteName(OPS_FLOW_ROUTE.TASK_MANAGEMENT.TASK_CATEGORY.DETAIL.TASK_TYPE._NAME),
            params: {
                taskCategoryId: props.taskCategoryId,
            },
        });
    } else {
        router.replace({
            name: makeAdminRouteName(OPS_FLOW_ROUTE.TASK_MANAGEMENT.TASK_CATEGORY.DETAIL.STATUS._NAME),
            params: {
                taskCategoryId: props.taskCategoryId,
            },
        });
    }
};

/* lifecycle */
onBeforeMount(() => {
    taskCategoryPageStore.setCurrentCategoryId(props.taskCategoryId);
});

/* expose */
defineExpose({ setPathFrom });
</script>

<template>
    <div>
        <p-heading class="mb-6"
                   show-back-button
                   @click-back-button="handleClickBackButton"
        >
            <p-skeleton v-if="loading"
                        height="1.75rem"
                        width="12rem"
            />
            <template v-else>
                {{ headerTitle }}
            </template>
        </p-heading>
        <p-tab :tabs="tabs"
               :active-tab="activeTab"
               @update:active-tab="handleUpdateActiveTab"
        >
            <router-view />
        </p-tab>
        <!-- modals -->
        <task-status-form />
        <task-status-delete-modal />
        <task-type-form />
    </div>
</template>
