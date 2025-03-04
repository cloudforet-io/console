<script lang="ts">
// eslint-disable-next-line import/order,import/no-duplicates
import { defineComponent, type ComponentPublicInstance } from 'vue';

interface IInstance extends ComponentPublicInstance {
    setPathFrom(from: any): void;
}

export default defineComponent({
    beforeRouteEnter(to, from, next) {
        next((vm) => {
            const instance = vm as unknown as IInstance;
            if (!instance.setPathFrom) {
                console.error('setPathFrom is not defined');
                return;
            }
            instance.setPathFrom(from);
        });
    },
});
</script>

<script setup lang="ts">
/* eslint-disable import/first */
// eslint-disable-next-line import/no-duplicates,import/order
import {
    computed, watch, onUnmounted, defineAsyncComponent, ref,
    // eslint-disable-next-line import/no-duplicates
} from 'vue';
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router/composables';

import type { QueryKey } from '@tanstack/vue-query';
import { useQuery } from '@tanstack/vue-query';

import type { APIError } from '@cloudforet/core-lib/space-connector/error';
import {
    PHeadingLayout, PHeading, PButton, PTab, PSkeleton,
} from '@cloudforet/mirinae';
import type { TabItem } from '@cloudforet/mirinae/types/hooks/use-tab/type';

import { useTaskApi } from '@/api-clients/opsflow/task/composables/use-task-api';
import type { TaskModel } from '@/api-clients/opsflow/task/schema/model';
import { getParticle, i18n as _i18n } from '@/translations';

import { useUserStore } from '@/store/user/user-store';

import { queryStringToString } from '@/lib/router-query-string';

import ConfirmBackModal from '@/common/components/modals/ConfirmBackModal.vue';
import { useConfirmRouteLeave } from '@/common/composables/confirm-route-leave';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useGoBack } from '@/common/composables/go-back';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';

import BoardTaskComment from '@/services/ops-flow/components/BoardTaskComment.vue';
import CommentDeleteModal from '@/services/ops-flow/components/CommentDeleteModal.vue';
import TaskAssignModal from '@/services/ops-flow/components/TaskAssignModal.vue';
import TaskDeleteModal from '@/services/ops-flow/components/TaskDeleteModal.vue';
import { OPS_FLOW_ROUTE } from '@/services/ops-flow/routes/route-constant';
import { useTaskDetailPageStore } from '@/services/ops-flow/stores/task-detail-page-store';
import {
    useTaskManagementTemplateStore,
} from '@/services/ops-flow/task-management-templates/stores/use-task-management-template-store';
import type { BoardPageQuery } from '@/services/ops-flow/types/board-page-type';
import type { TaskCreatePageQueryValue } from '@/services/ops-flow/types/task-create-page-type';

const TaskContentTab = defineAsyncComponent(() => import('@/services/ops-flow/components/TaskContentTab.vue'));
const TaskProgressTab = defineAsyncComponent(() => import('@/services/ops-flow/components/TaskProgressTab.vue'));


const props = defineProps<{
    taskId: string;
}>();

const taskDetailPageStore = useTaskDetailPageStore();
const taskManagementTemplateStore = useTaskManagementTemplateStore();
const userStore = useUserStore();

/* route */
const router = useRouter();
const route = useRoute();
const { getProperRouteLocation } = useProperRouteLocation();
const categoryId = computed<TaskCreatePageQueryValue['categoryId']>(() => queryStringToString(route.query.categoryId));
const error = ref<APIError | null>(null);
const {
    pathFrom,
    setPathFrom,
    goBack,
} = useGoBack(getProperRouteLocation({
    name: OPS_FLOW_ROUTE.BOARD._NAME,
    query: { categoryId: categoryId.value } as BoardPageQuery,
}));
watch(error, (err) => {
    if (err) {
        goBack();
        ErrorHandler.handleRequestError(err, 'Failed to get task');
    }
});

/* task */
const { taskQueryKey, taskAPI } = useTaskApi();
const taskDetailQueryKey = computed<QueryKey>(() => [
    taskQueryKey.value,
    props.taskId,
]);
const {
    data: task,
    isLoading: loading,
} = useQuery<TaskModel, APIError>({
    queryKey: taskDetailQueryKey,
    queryFn: async ({ queryKey }) => {
        const taskId = queryKey[1] as string;
        try {
            const result = await taskAPI.get({ task_id: taskId });
            return result;
        } catch (e) {
            error.value = e as APIError;
            throw e;
        }
    },
    enabled: computed(() => !!props.taskId && !!pathFrom.value),
    retry: false,
    gcTime: 0,
    staleTime: 0,
});

/* header and back button */
const headerTitle = computed<string>(() => task.value?.name ?? '');

/* confirm leave modal */
const hasUpdated = ref(false);
const {
    isConfirmLeaveModalVisible,
    handleBeforeRouteLeave,
    confirmRouteLeave,
    stopRouteLeave,
} = useConfirmRouteLeave({
    passConfirmation: computed(() => !taskDetailPageStore.getters.hasUnsavedChanges || hasUpdated.value),
});
onBeforeRouteLeave(handleBeforeRouteLeave);

/* tabs */
const tabs = computed<TabItem<object>[]>(() => [
    {
        name: 'content',
        label: _i18n.t('OPSFLOW.TASK_BOARD.TASK_CONTENT') as string,
        keepAlive: true,
    },
    {
        name: 'progress',
        label: _i18n.t('OPSFLOW.TASK_BOARD.TASK_PROGRESS', { task: taskManagementTemplateStore.templates.Task }),
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
    if (!taskDetailPageStore.getters.isFormValid) return;
    hasUpdated.value = await taskDetailPageStore.updateTask();
    // if (hasUpdated.value) goBack();
};

/* lifecycle */
onUnmounted(() => {
    taskDetailPageStore.$reset();
    taskDetailPageStore.$dispose();
});
watch(task, (t) => {
    if (!t) return; // route guard will get task and go back if task is not found
    if (route.hash === '#progress') {
        activeTab.value = 'progress';
    }
    taskDetailPageStore.setCurrentTask(t);
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
                <p-button v-if="userStore.getters.isDomainAdmin"
                          style-type="negative-secondary"
                          @click="taskDetailPageStore.openTaskDeleteModal()"
                >
                    {{ $t('COMMON.BUTTONS.DELETE') }}
                </p-button>
            </template>
        </p-heading-layout>
        <p v-if="taskDetailPageStore.getters.isArchivedTask"
           class="px-4 mb-6 text-label-md text-gray-600"
        >
            {{ $t('OPSFLOW.TASK_BOARD.ARCHIVED_TASK_DESC', {
                taskCategory: taskManagementTemplateStore.templates.TaskCategory,
                taskType: taskManagementTemplateStore.templates.TaskType,
                particle: getParticle(taskManagementTemplateStore.templates.TaskType, 'topic')
            }) }}
        </p>
        <div class="mr-auto flex flex-wrap w-full gap-4">
            <div class="flex-1 w-full min-w-[600px] tablet:min-w-full">
                <p-tab class="w-full"
                       :tabs="tabs"
                       :active-tab="activeTab"
                       @update:active-tab="handleUpdateActiveTab"
                >
                    <template #content>
                        <task-content-tab :task-id="props.taskId" />
                    </template>
                    <template #progress>
                        <task-progress-tab :task-id="props.taskId" />
                    </template>
                </p-tab>
                <div v-if="activeTab === 'content' && taskDetailPageStore.getters.isEditable"
                     class="py-3 flex flex-wrap gap-1 justify-end"
                >
                    <p-button style-type="transparent"
                              @click="goBack()"
                    >
                        {{ $t('COMMON.BUTTONS.CANCEL') }}
                    </p-button>
                    <p-button style-type="primary"
                              :disabled="!taskDetailPageStore.getters.hasUnsavedChanges || !taskDetailPageStore.getters.isFormValid"
                              @click="handleSaveChanges"
                    >
                        {{ $t('COMMON.BUTTONS.CONFIRM') }}
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
        <comment-delete-modal />
        <task-assign-modal />
        <task-delete-modal @deleted="goBack()" />
    </div>
</template>

