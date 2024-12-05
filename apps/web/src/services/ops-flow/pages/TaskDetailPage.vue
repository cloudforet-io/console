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
    computed, onBeforeMount, onUnmounted, defineAsyncComponent, ref,
    // eslint-disable-next-line import/no-duplicates
} from 'vue';
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router/composables';

import {
    PHeadingLayout, PHeading, PButton, PTab, PSkeleton,
} from '@cloudforet/mirinae';
import type { TabItem } from '@cloudforet/mirinae/types/hooks/use-tab/type';

import type { TaskModel } from '@/schema/opsflow/task/model';

import { queryStringToString } from '@/lib/router-query-string';

import ConfirmBackModal from '@/common/components/modals/ConfirmBackModal.vue';
import { useConfirmRouteLeave } from '@/common/composables/confirm-route-leave';
import { useGoBack } from '@/common/composables/go-back';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';

import BoardTaskComment from '@/services/ops-flow/components/BoardTaskComment.vue';
import CommentDeleteModal from '@/services/ops-flow/components/CommentDeleteModal.vue';
import { OPS_FLOW_ROUTE } from '@/services/ops-flow/routes/route-constant';
import { useTaskContentFormStore } from '@/services/ops-flow/stores/task-content-form-store';
import { useTaskDetailPageStore } from '@/services/ops-flow/stores/task-detail-page-store';
import { useTaskStore } from '@/services/ops-flow/stores/task-store';
import type { BoardPageQuery } from '@/services/ops-flow/types/board-page-type';
import type { TaskCreatePageQueryValue } from '@/services/ops-flow/types/task-create-page-type';

const TaskContentTab = defineAsyncComponent(() => import('@/services/ops-flow/components/TaskContentTab.vue'));
const TaskProgressTab = defineAsyncComponent(() => import('@/services/ops-flow/components/TaskProgressTab.vue'));


const props = defineProps<{
    taskId: string;
}>();

const taskDetailPageStore = useTaskDetailPageStore();
const taskContentFormStore = useTaskContentFormStore();
const taskContentFormState = taskContentFormStore.state;
const taskContentFormGetters = taskContentFormStore.getters;
const taskStore = useTaskStore();

/* task */
const task = ref<TaskModel|undefined>();

/* route and query */
const router = useRouter();
const route = useRoute();
const categoryId = computed<TaskCreatePageQueryValue['categoryId']>(() => queryStringToString(route.query.categoryId));
const { getProperRouteLocation } = useProperRouteLocation();


/* header and back button */
const loading = false; // computed<boolean>(() => taskCategoryStore.getters.loading);
const headerTitle = computed<string>(() => task?.value?.name ?? 'Inquiry Service Request'); // TODO: i18n
const {
    setPathFrom,
    goBack,
} = useGoBack(getProperRouteLocation({
    name: OPS_FLOW_ROUTE.BOARD._NAME,
    query: { categoryId: categoryId.value } as BoardPageQuery,
}));

/* confirm leave modal */
const {
    isConfirmLeaveModalVisible,
    handleBeforeRouteLeave,
    confirmRouteLeave,
    stopRouteLeave,
} = useConfirmRouteLeave({
    passConfirmation: computed(() => !taskContentFormState.hasUnsavedChanges),
});
onBeforeRouteLeave(handleBeforeRouteLeave);

/* tabs */
const tabs = computed<TabItem<object>[]>(() => [
    {
        name: 'content',
        label: 'Content', // TODO: i18n
        keepAlive: true,
    },
    {
        name: 'progress',
        label: 'Progress', // TODO: i18n & template
        keepAlive: true,
    },
]);
const activeTab = ref<'content'|'progress'>('content');
const handleUpdateActiveTab = (tab: 'content'|'progress') => {
    activeTab.value = tab;
    router.replace({
        hash: `#${tab}`,
    });
};

/* form button handling */
const handleSaveChanges = async () => {
    if (!taskContentFormGetters.isAllValid) return;
    const result = await taskContentFormStore.createTask();
    if (result) goBack();
};

/* lifecycle */
onBeforeMount(async () => {
    taskDetailPageStore.setCurrentTaskId(props.taskId);
    if (route.hash === '#progress') {
        activeTab.value = 'progress';
    }
    taskContentFormStore.setMode('view'); // TODO: differentiate by user permission
    task.value = await taskStore.get(props.taskId);
    taskContentFormStore.setCurrentTask(task.value);
});
onUnmounted(() => {
    taskContentFormStore.$reset();
    taskContentFormStore.$dispose();
});

/* expose */
defineExpose({ setPathFrom });
</script>

<template>
    <div>
        <p-heading-layout class="mb-6">
            <template #heading>
                <p-heading show-back-button
                           @click-back-button="goBack"
                >
                    <p-skeleton v-if="loading"
                                height="1.75rem"
                                width="12rem"
                    />
                    <template v-else>
                        {{ headerTitle }}
                    </template>
                </p-heading>
            </template>
            <template #extra>
                <p-button style-type="negative-secondary">
                    Delete
                </p-button>
            </template>
        </p-heading-layout>
        <div class="mr-auto flex flex-wrap w-full gap-4">
            <div class="flex-1 w-full min-w-[600px] tablet:min-w-full">
                <p-tab class="w-full"
                       :tabs="tabs"
                       :active-tab="activeTab"
                       @update:active-tab="handleUpdateActiveTab"
                >
                    <template #content>
                        <task-content-tab />
                    </template>
                    <template #progress>
                        <task-progress-tab />
                    </template>
                </p-tab>
                <div v-if="taskContentFormState.mode === 'edit'"
                     class="py-3 flex flex-wrap gap-1 justify-end"
                >
                    <p-button style-type="transparent"
                              @click="goBack()"
                    >
                        Cancel
                    </p-button>
                    <p-button style-type="primary"
                              :disabled="!taskContentFormGetters.isAllValid"
                              @click="handleSaveChanges"
                    >
                        Confirm
                    </p-button>
                </div>
            </div>
            <board-task-comment class="flex-1 w-full h-fit min-w-[360px] lg:max-w-[528px] tablet:min-w-full"
                                :task-id="props.taskId"
            />
        </div>
        <!-- modals -->
        <confirm-back-modal :visible="isConfirmLeaveModalVisible"
                            @confirm="confirmRouteLeave"
                            @cancel="stopRouteLeave"
        />
        <comment-delete-modal :visible="taskDetailPageStore.state.visibleCommentDeleteModal" />
    </div>
</template>

