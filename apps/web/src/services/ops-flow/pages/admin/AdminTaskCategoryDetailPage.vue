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
import {
    computed, onBeforeMount, onUnmounted, toRef,
// eslint-disable-next-line import/no-duplicates
} from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import { PHeading, PTab, PSkeleton } from '@cloudforet/mirinae';
import type { TabItem } from '@cloudforet/mirinae/types/hooks/use-tab/type';


import { i18n } from '@/translations';


import { useGoBack } from '@/common/composables/go-back';

import TaskStatusDeleteModal from '@/services/ops-flow/components/TaskStatusDeleteModal.vue';
import TaskStatusForm from '@/services/ops-flow/components/TaskStatusForm.vue';
import TaskStatusSetDefaultModal from '@/services/ops-flow/components/TaskStatusSetDefaultModal.vue';
import TaskTypeDeleteModal from '@/services/ops-flow/components/TaskTypeDeleteModal.vue';
import TaskTypeForm from '@/services/ops-flow/components/TaskTypeForm.vue';
import { useCategoryQuery } from '@/services/ops-flow/composables/use-current-category';
import { ADMIN_OPS_FLOW_ROUTE } from '@/services/ops-flow/routes/admin/route-constant';
import { useTaskCategoryPageStore } from '@/services/ops-flow/stores/admin/task-category-page-store';
import {
    useTaskManagementTemplateStore,
} from '@/services/ops-flow/task-management-templates/stores/use-task-management-template-store';

const props = defineProps<{
    taskCategoryId: string;
}>();
const router = useRouter();
const route = useRoute();

const taskCategoryPageStore = useTaskCategoryPageStore();
const taskManagementTemplateStore = useTaskManagementTemplateStore();

/* category */
const { data: currentCategory, isLoading } = useCategoryQuery({
    categoryId: toRef(props, 'taskCategoryId'),
});
/* header and back button */
const headerTitle = computed<string>(() => currentCategory.value?.name ?? 'No Category');
const {
    setPathFrom,
    handleClickBackButton,
} = useGoBack({
    name: ADMIN_OPS_FLOW_ROUTE.TASK_MANAGEMENT._NAME,
});

/* tabs */
const tabs = computed<TabItem<object>[]>(() => [
    {
        name: 'status',
        label: i18n.t('OPSFLOW.STATUS'),
        keepAlive: true,
    },
    {
        name: 'taskType',
        label: taskManagementTemplateStore.templates.TaskType,
        keepAlive: true,
    },
]);
const activeTab = computed(() => {
    if (route.name === ADMIN_OPS_FLOW_ROUTE.TASK_MANAGEMENT.TASK_CATEGORY.DETAIL.TASK_TYPE._NAME) return 'taskType';
    return 'status';
});
const handleUpdateActiveTab = (tab: string) => {
    if (tab === 'taskType') {
        router.replace({
            name: ADMIN_OPS_FLOW_ROUTE.TASK_MANAGEMENT.TASK_CATEGORY.DETAIL.TASK_TYPE._NAME,
            params: {
                taskCategoryId: props.taskCategoryId,
            },
        });
    } else {
        router.replace({
            name: ADMIN_OPS_FLOW_ROUTE.TASK_MANAGEMENT.TASK_CATEGORY.DETAIL.STATUS._NAME,
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
onUnmounted(() => {
    taskCategoryPageStore.$dispose();
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
            <p-skeleton v-if="isLoading"
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

        <!-- task status -->
        <task-status-form />
        <task-status-delete-modal />
        <task-status-set-default-modal />

        <!-- task type -->
        <task-type-form />
        <task-type-delete-modal />
    </div>
</template>
