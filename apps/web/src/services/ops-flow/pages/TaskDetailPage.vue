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
    onBeforeMount,
    // eslint-disable-next-line import/no-duplicates
} from 'vue';
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router/composables';


import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { isEqual } from 'lodash';

import type { APIError } from '@cloudforet/core-lib/space-connector/error';
import {
    PHeadingLayout, PHeading, PButton, PTab, PSkeleton,
} from '@cloudforet/mirinae';
import type { TabItem } from '@cloudforet/mirinae/types/hooks/use-tab/type';

import { useTaskApi } from '@/api-clients/opsflow/task/composables/use-task-api';
import type { TaskModel } from '@/api-clients/opsflow/task/schema/model';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';
import { getParticle, i18n as _i18n } from '@/translations';

import { useUserStore } from '@/store/user/user-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { queryStringToString } from '@/lib/router-query-string';

import ConfirmBackModal from '@/common/components/modals/ConfirmBackModal.vue';
import { useConfirmRouteLeave } from '@/common/composables/confirm-route-leave';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useGoBack } from '@/common/composables/go-back';

import BoardTaskComment from '@/services/ops-flow/components/BoardTaskComment.vue';
import CommentDeleteModal from '@/services/ops-flow/components/CommentDeleteModal.vue';
import TaskAssignModal from '@/services/ops-flow/components/TaskAssignModal.vue';
import TaskDeleteModal from '@/services/ops-flow/components/TaskDeleteModal.vue';
import { useTaskEventsQuery } from '@/services/ops-flow/composables/use-task-events-query';
import { useTaskQuery } from '@/services/ops-flow/composables/use-task-query';
import { OPS_FLOW_ROUTE } from '@/services/ops-flow/routes/route-constant';
import { useTaskContentFormStore } from '@/services/ops-flow/stores/task-content-form-store';
import { useTaskDetailPageStore } from '@/services/ops-flow/stores/task-detail-page-store';
import { DEFAULT_FIELD_ID_MAP } from '@/services/ops-flow/task-fields-configuration/constants/default-field-constant';
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

/* glob stores */
const userStore = useUserStore();
const taskManagementTemplateStore = useTaskManagementTemplateStore();

/* route */
const router = useRouter();
const route = useRoute();

/* go back */
const categoryId = computed<TaskCreatePageQueryValue['categoryId']>(() => queryStringToString(route.query.categoryId));
const {
    pathFrom,
    setPathFrom,
    goBack,
} = useGoBack({
    name: OPS_FLOW_ROUTE.BOARD._NAME,
    query: { categoryId: categoryId.value } as BoardPageQuery,
});

/* task */
const { taskAPI } = useTaskApi();
const { key: taskListQueryKey } = useServiceQueryKey('opsflow', 'task', 'list');
const {
    data: task, queryKey: taskDetailQueryKey, isLoading: isLoadingTask, error: errorOnTask,
} = useTaskQuery({
    taskId: computed(() => props.taskId),
    enabled: computed(() => !!props.taskId && !!pathFrom.value),
});
watch(errorOnTask, (err) => {
    if (err) {
        goBack();
        ErrorHandler.handleRequestError(err, 'Failed to get task');
    }
});

/* scoped stores */
const taskDetailPageStore = useTaskDetailPageStore();
const taskContentFormStore = useTaskContentFormStore();
watch(task, (t) => {
    if (t) taskContentFormStore.reset(t);
}, { immediate: true });
watch(() => props.taskId, (id) => {
    if (!id) return;
    taskDetailPageStore.setTargetTaskId(id);
}, { immediate: true });
onBeforeMount(() => {
    taskContentFormStore.setMode('view');
});
onUnmounted(() => {
    taskDetailPageStore.$reset();
    taskDetailPageStore.$dispose();
    taskContentFormStore.$reset();
    taskContentFormStore.$dispose();
});


/* header and back button */
const headerTitle = computed<string>(() => task.value?.name ?? '');

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
watch(task, (t) => {
    if (!t) return; // route guard will get task and go back if task is not found
    if (route.hash === '#progress') {
        activeTab.value = 'progress';
    }
});

/* events */
const { refetch: refetchEvents } = useTaskEventsQuery({
    taskId: computed(() => props.taskId),
    fetchOnCreation: false,
});

/* update task */
const queryClient = useQueryClient();
const { isSuccess, mutateAsync: updateTaskMutation, isPending: isUpdating } = useMutation<TaskModel, APIError>({
    mutationFn: async () => {
        if (!task.value) throw new Error('Origin task is not defined');
        const res = await taskAPI.update({
            task_id: task.value.task_id,
            name: taskContentFormStore.getters.defaultData[DEFAULT_FIELD_ID_MAP.title],
            project_id: taskContentFormStore.getters.defaultData[DEFAULT_FIELD_ID_MAP.project],
            data: taskContentFormStore.getters.data,
        });
        return res;
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: taskListQueryKey.value });
        queryClient.invalidateQueries({ queryKey: taskDetailQueryKey.value });
        showSuccessMessage(_i18n.t('OPSFLOW.ALT_S_UPDATE_TARGET', { target: taskManagementTemplateStore.templates.task }), '');
        taskContentFormStore.resetUnsavedChanges();
        refetchEvents();
    },
    onError: (error) => {
        ErrorHandler.handleRequestError(error, _i18n.t('OPSFLOW.ALT_E_UPDATE_TARGET', { target: taskManagementTemplateStore.templates.task }));
    },
});

/* update task description */
const { isSuccess: isSuccessUpdateDescription, mutateAsync: updateDescriptionMutation, isPending: isUpdatingDescription } = useMutation<TaskModel, APIError>({
    mutationFn: async () => {
        if (!task.value) throw new Error('Origin task is not defined');
        const res = await taskAPI.updateDescription({
            task_id: task.value.task_id,
            description: taskContentFormStore.getters.defaultData[DEFAULT_FIELD_ID_MAP.description],
        });
        return res;
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: taskDetailQueryKey.value });
        showSuccessMessage(_i18n.t('OPSFLOW.ALT_S_UPDATE_TARGET', { target: taskManagementTemplateStore.templates.task }), '');
        refetchEvents();
    },
    onError: (error) => {
        ErrorHandler.handleRequestError(error, _i18n.t('OPSFLOW.ALT_E_UPDATE_TARGET', { target: taskManagementTemplateStore.templates.task }));
    },
});




/* form button handling */
const handleSaveChanges = async () => {
    if (!taskContentFormStore.getters.isAllValid) return;

    const currentDescription = taskContentFormStore.getters.defaultData[DEFAULT_FIELD_ID_MAP.description];
    const isDescriptionChanged = task.value?.description !== currentDescription;
    if (isDescriptionChanged) {
        await updateDescriptionMutation();
    }

    const isDataChanged = !isEqual(task.value?.data, taskContentFormStore.getters.data);
    const otherFields = Object.entries(taskContentFormStore.getters.defaultData).filter(([k]) => k !== DEFAULT_FIELD_ID_MAP.description);
    const isOtherFieldsChanged = otherFields.some(([k, v]) => {
        if (k === DEFAULT_FIELD_ID_MAP.description) return false;
        return task.value?.[k] !== v;
    });
    if (isDataChanged || isOtherFieldsChanged) {
        await updateTaskMutation();
    }
};

/* confirm leave modal */
const {
    isConfirmLeaveModalVisible,
    handleBeforeRouteLeave,
    confirmRouteLeave,
    stopRouteLeave,
} = useConfirmRouteLeave({
    passConfirmation: computed(() => !taskContentFormStore.getters.hasUnsavedChanges || isSuccess.value || isSuccessUpdateDescription.value),
});
onBeforeRouteLeave(handleBeforeRouteLeave);


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
                    <p-skeleton v-if="isLoadingTask"
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
        <p v-if="taskContentFormStore.getters.isArchivedTask"
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
                <div v-if="activeTab === 'content' && taskContentFormStore.getters.isEditable"
                     class="py-3 flex flex-wrap gap-1 justify-end"
                >
                    <p-button style-type="transparent"
                              :disabled="isUpdating || isUpdatingDescription"
                              @click="goBack()"
                    >
                        {{ $t('COMMON.BUTTONS.CANCEL') }}
                    </p-button>
                    <p-button style-type="primary"
                              :loading="isUpdating || isUpdatingDescription"
                              :disabled="!taskContentFormStore.getters.hasUnsavedChanges || !taskContentFormStore.getters.isAllValid"
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
