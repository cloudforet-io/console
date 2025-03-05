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
    computed, onBeforeMount, onUnmounted,
    // eslint-disable-next-line import/no-duplicates
} from 'vue';
import { useRouter, useRoute, onBeforeRouteLeave } from 'vue-router/composables';

import { QueryClient, useMutation } from '@tanstack/vue-query';
import { isEmpty } from 'lodash';

import type { APIError } from '@cloudforet/core-lib/space-connector/error';
import {
    PHeadingLayout, PHeading, PButton, PPaneLayout, PSkeleton,
} from '@cloudforet/mirinae';

import { useTaskApi } from '@/api-clients/opsflow/task/composables/use-task-api';
import type { TaskModel } from '@/api-clients/opsflow/task/schema/model';
import { i18n as _i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { queryStringToString } from '@/lib/router-query-string';

import ConfirmBackModal from '@/common/components/modals/ConfirmBackModal.vue';
import { useConfirmRouteLeave } from '@/common/composables/confirm-route-leave';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useGoBack } from '@/common/composables/go-back';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';

import TaskContentBaseForm from '@/services/ops-flow/components/TaskContentBaseForm.vue';
import { OPS_FLOW_ROUTE } from '@/services/ops-flow/routes/route-constant';
import { useTaskContentFormStore } from '@/services/ops-flow/stores/task-content-form-store';
import { DEFAULT_FIELD_ID_MAP } from '@/services/ops-flow/task-fields-configuration/constants/default-field-constant';
import TaskFieldsForm from '@/services/ops-flow/task-fields-form/TaskFieldsForm.vue';
import {
    useTaskManagementTemplateStore,
} from '@/services/ops-flow/task-management-templates/stores/use-task-management-template-store';
import type { BoardPageQuery } from '@/services/ops-flow/types/board-page-type';
import type { TaskCreatePageQueryValue } from '@/services/ops-flow/types/task-create-page-type';




const taskContentFormStore = useTaskContentFormStore();
const taskContentFormState = taskContentFormStore.state;
const taskContentFormGetters = taskContentFormStore.getters;
const taskManagementTemplateStore = useTaskManagementTemplateStore();

/* route and query */
const router = useRouter();
const route = useRoute();
const { getProperRouteLocation } = useProperRouteLocation();
const categoryId = computed<TaskCreatePageQueryValue['categoryId']>(() => queryStringToString(route.query.categoryId));
const taskTypeId = computed<TaskCreatePageQueryValue['taskTypeId']>(() => queryStringToString(route.query.taskTypeId));

/* header and back button */
const loading = false; // computed<boolean>(() => taskCategoryStore.getters.loading);
const headerTitle = computed<string>(() => _i18n.t('OPSFLOW.CREATE_TARGET', { target: taskManagementTemplateStore.templates.Task }) as string);
const {
    pathFrom,
    setPathFrom,
    goBack,
} = useGoBack(getProperRouteLocation({
    name: OPS_FLOW_ROUTE.BOARD._NAME,
    query: { categoryId: categoryId.value } as BoardPageQuery,
}));
const handleClickBack = () => {
    if (pathFrom.value?.name === OPS_FLOW_ROUTE.LANDING._NAME) {
        router.back();
        return;
    }
    goBack();
};

/* create task */
const { taskAPI, taskListQueryKey } = useTaskApi();
const queryClient = new QueryClient();
const { data: createdTask, mutateAsync: createTaskMutation, isPending: isCreating } = useMutation<TaskModel, APIError>({
    mutationFn: async () => {
        if (!taskContentFormState.currentTaskType) throw new Error('Task type is not selected');
        const res = await taskAPI.create({
            task_type_id: taskContentFormState.currentTaskType.task_type_id,
            name: taskContentFormState.defaultData[DEFAULT_FIELD_ID_MAP.title],
            status_id: taskContentFormState.statusId as string,
            description: taskContentFormState.defaultData[DEFAULT_FIELD_ID_MAP.description] || undefined,
            assignee: taskContentFormState.assignee || undefined,
            data: isEmpty(taskContentFormState.data) ? undefined : taskContentFormState.data,
            files: taskContentFormState.fileIds,
            project_id: taskContentFormState.currentTaskType.require_project ? taskContentFormState.defaultData[DEFAULT_FIELD_ID_MAP.project] : '*',
        });
        return res;
    },
    onSuccess: () => {
        // Invalidate task list query to avoid using stale data
        queryClient.invalidateQueries({ queryKey: taskListQueryKey });
        showSuccessMessage(_i18n.t('OPSFLOW.ALT_S_CREATE_TARGET', { target: taskManagementTemplateStore.templates.task }), '');
    },
    onError: (error) => {
        ErrorHandler.handleRequestError(error, _i18n.t('OPSFLOW.ALT_E_CREATE_TARGET', { target: taskManagementTemplateStore.templates.task }));
    },
});

/* confirm leave modal */
const {
    isConfirmLeaveModalVisible,
    handleBeforeRouteLeave,
    confirmRouteLeave,
    stopRouteLeave,
} = useConfirmRouteLeave({
    passConfirmation: computed(() => !taskContentFormState.hasUnsavedChanges || !!createdTask.value),
});
onBeforeRouteLeave(handleBeforeRouteLeave);

/* form button handling */
const handleConfirm = async () => {
    if (!taskContentFormGetters.isAllValid) return;
    await createTaskMutation();
    if (createdTask.value) {
        goBack();
    }
};

/* lifecycle */
onBeforeMount(() => {
    taskContentFormStore.setCurrentCategoryId(categoryId.value);
    taskContentFormStore.setCurrentTaskType(taskTypeId.value);
    taskContentFormStore.setMode(taskTypeId.value ? 'create-minimal' : 'create');
});
onUnmounted(() => {
    taskContentFormStore.$reset();
    taskContentFormStore.$dispose();
});

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
                    <p-skeleton v-if="loading"
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

