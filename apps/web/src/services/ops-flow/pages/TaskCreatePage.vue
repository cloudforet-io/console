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
    computed, onBeforeMount, onUnmounted, watch,
    // eslint-disable-next-line import/no-duplicates
} from 'vue';
import { useRouter, useRoute, onBeforeRouteLeave } from 'vue-router/composables';


import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { isEmpty } from 'lodash';

import {
    PHeadingLayout, PHeading, PButton, PPaneLayout, PSkeleton,
} from '@cloudforet/mirinae';

import { useTaskApi } from '@/api-clients/opsflow/task/composables/use-task-api';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';
import { i18n as _i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { queryStringToString } from '@/lib/router-query-string';

import ConfirmBackModal from '@/common/components/modals/ConfirmBackModal.vue';
import { useConfirmRouteLeave } from '@/common/composables/confirm-route-leave';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useGoBack } from '@/common/composables/go-back';

import TaskContentBaseForm from '@/services/ops-flow/components/TaskContentBaseForm.vue';
import { useCurrentTaskType } from '@/services/ops-flow/composables/use-current-task-type';
import { OPS_FLOW_ROUTE } from '@/services/ops-flow/routes/route-constant';
import { useTaskContentFormStore } from '@/services/ops-flow/stores/task-content-form-store';
import { DEFAULT_FIELD_ID_MAP } from '@/services/ops-flow/task-fields-configuration/constants/default-field-constant';
import TaskFieldsForm from '@/services/ops-flow/task-fields-form/TaskFieldsForm.vue';
import {
    useTaskManagementTemplateStore,
} from '@/services/ops-flow/task-management-templates/stores/use-task-management-template-store';
import type { BoardPageQuery } from '@/services/ops-flow/types/board-page-type';
import type { TaskCreatePageQueryValue } from '@/services/ops-flow/types/task-create-page-type';


/* glob stores */
const taskManagementTemplateStore = useTaskManagementTemplateStore();

/* scoped stores */
const taskContentFormStore = useTaskContentFormStore();
const taskContentFormState = taskContentFormStore.state;
const taskContentFormGetters = taskContentFormStore.getters;
onBeforeMount(() => {
    const categoryId: TaskCreatePageQueryValue['categoryId'] = queryStringToString(route.query.categoryId);
    const taskTypeId: TaskCreatePageQueryValue['taskTypeId'] = queryStringToString(route.query.taskTypeId);
    taskContentFormStore.setCurrentCategoryId(categoryId);
    taskContentFormStore.setCurrentTaskTypeId(taskTypeId);
    taskContentFormStore.setMode(taskTypeId ? 'create-minimal' : 'create');
});
onUnmounted(() => {
    taskContentFormStore.$reset();
    taskContentFormStore.$dispose();
});

/* route and query */
const router = useRouter();
const route = useRoute();

/* header and back button */
const headerTitle = computed<string>(() => _i18n.t('OPSFLOW.CREATE_TARGET', { target: taskManagementTemplateStore.templates.Task }) as string);
const {
    pathFrom,
    setPathFrom,
    goBack,
} = useGoBack({
    name: OPS_FLOW_ROUTE.BOARD._NAME,
    query: { categoryId: route.query.categoryId } as BoardPageQuery,
});
const handleClickBack = () => {
    if (pathFrom.value?.name === OPS_FLOW_ROUTE.LANDING._NAME) {
        router.back();
        return;
    }
    goBack();
};

/* task type */
const { currentTaskType, isLoading } = useCurrentTaskType({
    taskTypeId: computed(() => taskContentFormState.currentTaskTypeId),
});

/* create task */
const { taskAPI } = useTaskApi();
const { key: taskListQueryKey } = useServiceQueryKey('opsflow', 'task', 'list');
const queryClient = useQueryClient();
interface CreateTaskVariables {
    taskTypeId: string;
    name: string;
    description?: string;
    data?: Record<string, any>;
    files?: string[];
    projectId: string;
    statusId: string;
}
const { mutate: createTaskMutation, isPending: isCreating, isSuccess } = useMutation({
    mutationFn: (variables: CreateTaskVariables) => taskAPI.create({
        task_type_id: variables.taskTypeId,
        name: variables.name,
        status_id: variables.statusId,
        description: variables.description,
        data: variables.data,
        files: variables.files,
        project_id: variables.projectId,
    }),
    onSuccess: () => {
        showSuccessMessage(_i18n.t('OPSFLOW.ALT_S_CREATE_TARGET', { target: taskManagementTemplateStore.templates.task }), '');
    },
    onError: (error) => {
        ErrorHandler.handleRequestError(error, _i18n.t('OPSFLOW.ALT_E_CREATE_TARGET', { target: taskManagementTemplateStore.templates.task }));
    },
});
watch(isSuccess, async (val) => {
    if (val) {
        // Invalidate task list query to avoid using stale data
        await queryClient.invalidateQueries({ queryKey: taskListQueryKey.value });
        goBack();
    }
});

/* confirm leave modal */
const {
    isConfirmLeaveModalVisible,
    handleBeforeRouteLeave,
    confirmRouteLeave,
    stopRouteLeave,
} = useConfirmRouteLeave({
    passConfirmation: computed(() => !taskContentFormGetters.hasUnsavedChanges || isSuccess.value),
});
onBeforeRouteLeave(handleBeforeRouteLeave);

/* form button handling */
const handleConfirm = () => {
    if (!taskContentFormGetters.isAllValid) return;
    if (!currentTaskType.value) {
        ErrorHandler.handleRequestError(new Error('Task type is not defined'), 'Error occurred before creating task', true);
        return;
    }
    if (!taskContentFormState.statusId) {
        ErrorHandler.handleRequestError(new Error('Status is not defined'), 'Error occurred before creating task', true);
        return;
    }
    createTaskMutation({
        taskTypeId: currentTaskType.value.task_type_id,
        name: taskContentFormGetters.defaultData[DEFAULT_FIELD_ID_MAP.title],
        description: taskContentFormGetters.defaultData[DEFAULT_FIELD_ID_MAP.description],
        data: isEmpty(taskContentFormGetters.data) ? undefined : taskContentFormGetters.data,
        files: taskContentFormState.fileIds.length ? taskContentFormState.fileIds : undefined,
        projectId: currentTaskType.value.require_project ? taskContentFormGetters.defaultData[DEFAULT_FIELD_ID_MAP.project] : '*',
        statusId: taskContentFormState.statusId,
        // assignee: taskContentFormState.assignee || undefined,
    });
};

/* expose */
defineExpose({ setPathFrom });
</script>

<template>
    <div class="mr-auto max-w-tablet">
        <p-heading-layout class="mb-6">
            <template #heading>
                <p-heading show-back-button
                           @click-back-button="handleClickBack"
                >
                    <p-skeleton v-if="isLoading"
                                height="1.75rem"
                                width="12rem"
                    />
                    <template v-else>
                        {{ headerTitle }}
                    </template>
                </p-heading>
            </template>
        </p-heading-layout>
        <p-pane-layout class="pt-8 px-4 pb-10 mr-auto flex flex-wrap w-full gap-4">
            <p-heading class="mb-6"
                       :title="$t('OPSFLOW.TASK_BOARD.TYPE_INFO', {type: taskManagementTemplateStore.templates.TaskType})"
                       heading-type="sub"
            />
            <div class="w-full">
                <task-content-base-form class="mb-4" />
                <task-fields-form />
            </div>
        </p-pane-layout>
        <div class="py-3 flex flex-wrap gap-1 justify-end">
            <p-button style-type="transparent"
                      :disabled="isCreating"
                      @click="goBack()"
            >
                {{ $t('COMMON.BUTTONS.CANCEL') }}
            </p-button>
            <p-button style-type="primary"
                      :loading="isCreating"
                      :disabled="!taskContentFormGetters.isAllValid"
                      @click="handleConfirm"
            >
                {{ $t('COMMON.BUTTONS.CONFIRM') }}
            </p-button>
        </div>
        <!-- modals -->
        <confirm-back-modal :visible="isConfirmLeaveModalVisible"
                            @confirm="confirmRouteLeave"
                            @cancel="stopRouteLeave"
        />
    </div>
</template>

