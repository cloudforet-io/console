<script setup lang="ts">
import { computed, watch } from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { isEqual } from 'lodash';

import {
    PFieldTitle, PFieldGroup, PSelectDropdown, PPaneLayout, PButton, PBadge, PSkeleton,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import { useTaskApi } from '@/api-clients/opsflow/task/composables/use-task-api';
import type { TaskModel } from '@/api-clients/opsflow/task/schema/model';
import type { TaskStatusType } from '@/api-clients/opsflow/task/schema/type';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';
import { i18n } from '@/translations';

import { useUserReferenceStore } from '@/store/reference/user-reference-store';
import { useUserStore } from '@/store/user/user-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import { useCategoriesQuery } from '@/services/ops-flow/composables/use-categories-query';
import { useCategoryField } from '@/services/ops-flow/composables/use-category-field';
import { useCategoryStatusOptions } from '@/services/ops-flow/composables/use-category-status-options';
import { useCategoryQuery } from '@/services/ops-flow/composables/use-current-category';
import { useCurrentTaskType } from '@/services/ops-flow/composables/use-current-task-type';
import { useDefaultStatusOption } from '@/services/ops-flow/composables/use-default-status-option';
import { useTargetStatusOption } from '@/services/ops-flow/composables/use-target-status-option';
import { useTaskEventsQuery } from '@/services/ops-flow/composables/use-task-events-query';
import { useTaskQuery } from '@/services/ops-flow/composables/use-task-query';
import { useTaskStatusField } from '@/services/ops-flow/composables/use-task-status-field';
import { useTaskTypeField } from '@/services/ops-flow/composables/use-task-type-field';
import { TASK_STATUS_LABELS } from '@/services/ops-flow/constants/task-status-label-constant';
import { useTaskAssignStore } from '@/services/ops-flow/stores/task-assign-store';
import { useTaskContentFormStore } from '@/services/ops-flow/stores/task-content-form-store';
import {
    useTaskManagementTemplateStore,
} from '@/services/ops-flow/task-management-templates/stores/use-task-management-template-store';

/* glob stores */
const userStore = useUserStore();
const taskManagementTemplateStore = useTaskManagementTemplateStore();

/* scoped stores */
const taskContentFormStore = useTaskContentFormStore();
const taskContentFormState = taskContentFormStore.state;
const taskAssignStore = useTaskAssignStore();


/* mode */
const isCreateMode = computed(() => taskContentFormState.mode.startsWith('create'));
// const isMinimalCreateMode = computed(() => taskContentFormState.mode === 'create-minimal');

/* task */
const { data: originTask, isLoading: isOriginTaskLoading, setQueryData: setOriginTaskQueryData } = useTaskQuery({
    taskId: computed(() => taskContentFormState.currentTaskId),
});

/* events */
const { refetch: refetchEvents } = useTaskEventsQuery({
    taskId: computed(() => taskContentFormState.currentTaskId),
    fetchOnCreation: false,
});

/* category field */
const { categories } = useCategoriesQuery();
const {
    selectedCategoryItems,
    setSelectedCategoryItems,
    categoryValidator,
    categoryMenuItemsHandler,
    setInitialCategory,
} = useCategoryField({
    isRequired: true,
    hasTaskTypeOnly: true,
    categories,
});
const handleUpdateSelectedCategory = (items: typeof selectedCategoryItems.value) => {
    if (isEqual(items, selectedCategoryItems.value)) return;
    setSelectedCategoryItems(items);
};
watch(selectedCategoryItems, (items) => { // sync category id to store
    if (items[0]?.name === taskContentFormState.currentCategoryId) return;
    taskContentFormStore.setCurrentCategoryId(items[0]?.name);
});
const { data: currentCategory, isLoading: isCategoryLoading } = useCategoryQuery({
    categoryId: computed(() => taskContentFormState.currentCategoryId ?? originTask.value?.category_id),
});
const taskCategoryDesciprion = computed<string>(() => {
    if (!currentCategory.value) return '';
    return currentCategory.value.description;
});
watch([currentCategory, isCategoryLoading], ([category, loading]) => { // init selected category (both create and view mode)
    if (loading) return;
    if (category?.category_id !== selectedCategoryItems.value[0]?.name) {
        setInitialCategory(category);
    }
}, { immediate: true });


/* task type field */
const {
    selectedTaskTypeItems,
    setSelectedTaskTypeItems,
    taskTypeValidator,
    taskTypeMenuItemsHandler,
    setInitialTaskType,
    taskTypesDropdownKey,
} = useTaskTypeField({
    categoryId: computed(() => currentCategory.value?.category_id),
    isRequired: true,
});
const handleUpdateSelectedTaskType = async (items: SelectDropdownMenuItem[]) => {
    if (isEqual(items, selectedTaskTypeItems.value)) return;
    setSelectedTaskTypeItems(items);
};
const { currentTaskType, isLoading: isTaskTypeLoading } = useCurrentTaskType({
    taskTypeId: computed(() => taskContentFormState.currentTaskTypeId || originTask.value?.task_type_id),
});
const taskTypeDescription = computed<string>(() => {
    if (!currentTaskType.value) return '';
    return currentTaskType.value.description;
});
watch(selectedCategoryItems, () => { // reset task type when category is changed
    setInitialTaskType(undefined);
});
watch(selectedTaskTypeItems, (items) => { // sync task type id to store
    taskContentFormStore.setCurrentTaskTypeId(items[0]?.name);
});
watch([currentTaskType, isTaskTypeLoading], ([taskType, loading]) => { // init selected task type (both create and view mode)
    if (loading) return;
    if (taskType?.task_type_id !== selectedTaskTypeItems.value[0]?.name) {
        setInitialTaskType(taskType);
    }
}, { immediate: true });

/* status */
const {
    selectedStatusItems,
    taskStatusValidator,
    statusMenuItemsHandler,
    setSelectedStatusItems,
    setInitialStatus,
    taskStatusDropdownKey,
} = useTaskStatusField({
    categoryId: computed(() => currentCategory.value?.category_id),
});
const getStatusTypeLabel = (statusType?: TaskStatusType) => (statusType ? TASK_STATUS_LABELS[statusType] : '--');
const { taskAPI } = useTaskApi();
const { key: taskListQueryKey } = useServiceQueryKey('opsflow', 'task', 'list');
const queryClient = useQueryClient();
const { mutateAsync: changeStatus } = useMutation({
    mutationFn: ({ taskId, statusId }: {
        taskId: string;
        statusId: string;
    }) => taskAPI.changeStatus({
        task_id: taskId,
        status_id: statusId,
    }),
    onSuccess: (newTask: TaskModel) => {
        setOriginTaskQueryData(newTask);
        queryClient.invalidateQueries({ queryKey: taskListQueryKey.value });
        showSuccessMessage(i18n.t('OPSFLOW.ALT_S_UPDATE_TARGET', { target: i18n.t('OPSFLOW.STATUS') }), '');
        refetchEvents();
    },
    onError: (e) => {
        ErrorHandler.handleRequestError(e, i18n.t('OPSFLOW.ALT_E_UPDATE_TARGET', { target: i18n.t('OPSFLOW.STATUS') }), true);
    },
});
const handleUpdateSelectedStatus = (items: SelectDropdownMenuItem[]) => {
    const statusId = items[0].name;
    if (selectedStatusItems.value[0]?.name === statusId) return;
    setSelectedStatusItems(items);

    if (!taskContentFormState.currentTaskId) {
        ErrorHandler.handleRequestError(new Error('Task id is not defined'), 'Failed to update status', true);
        return;
    }
    changeStatus({
        taskId: taskContentFormState.currentTaskId as string,
        statusId,
    });
};
watch(selectedStatusItems, (items) => { // sync status id to store
    taskContentFormStore.setStatusId(items[0]?.name);
});
const { categoryStatusOptions } = useCategoryStatusOptions({
    categoryId: computed(() => taskContentFormState.currentCategoryId ?? originTask.value?.category_id),
});
const targetStatusType = computed(() => originTask.value?.status_type ?? 'TODO');
const { defaultStatusOption } = useDefaultStatusOption({ categoryStatusOptions, targetStatusType });
const { targetStatusOption } = useTargetStatusOption({
    categoryStatusOptions,
    targetStatusType,
    targetStatusId: computed(() => (isOriginTaskLoading.value ? undefined : originTask.value?.status_id)),
});
watch([isOriginTaskLoading, targetStatusOption, defaultStatusOption], ([loading, targetOp, defaultOp]) => { // init selected status by origin task (only for view mode)
    if (loading) return;
    const statusOp = targetOp ?? defaultOp;
    if (statusOp?.status_id === selectedStatusItems.value[0]?.name) return;
    setInitialStatus(statusOp);
}, { immediate: true });

/* assignee */
const userReferenceStore = useUserReferenceStore();
const handleClickAssign = () => {
    if (!currentTaskType.value) {
        ErrorHandler.handleError(new Error('Task type is not selected'));
        return;
    }
    if (!originTask.value) {
        ErrorHandler.handleError(new Error('Origin task is not defined'));
        return;
    }
    taskAssignStore.openAssignModal(originTask.value.task_id, originTask.value.assignee, currentTaskType.value.assignee_pool);
};
const assigneeName = computed<string>(() => {
    const userId = originTask.value?.assignee;
    if (!userId) return '--';
    const user = userReferenceStore.getters.userItems[userId];
    return user?.label || user?.name || userId;
});

/* form validator */
const {
    invalidState,
    invalidTexts,
    isAllValid,
} = useFormValidator({
    category: categoryValidator,
    taskType: taskTypeValidator,
    status: taskStatusValidator,
});
watch(isAllValid, (isValid) => {
    taskContentFormStore.setIsBaseFormValid(isValid);
}, { immediate: true });


</script>

<template>
    <component :is="isCreateMode ? 'div' : PPaneLayout"
               class="flex flex-wrap"
               :class="isCreateMode ? '' : 'py-6 px-4'"
    >
        <div v-if="!taskContentFormStore.getters.isArchivedTask"
             class="w-full"
        >
            <div class="base-form-top-wrapper">
                <div class="base-form-field-wrapper">
                    <p-field-group :label="taskManagementTemplateStore.templates.TaskCategory"
                                   :style-type="isCreateMode ? 'primary' : 'secondary'"
                                   required
                                   :invalid="isCreateMode && invalidState.category"
                                   :invalid-text="invalidTexts.category"
                    >
                        <template #default="{invalid}">
                            <p-select-dropdown :selected="selectedCategoryItems"
                                               :handler="categoryMenuItemsHandler"
                                               :page-size="10"
                                               :invalid="invalid"
                                               :readonly="!isCreateMode"
                                               block
                                               @update:selected="handleUpdateSelectedCategory"
                            />
                        </template>
                    </p-field-group>
                </div>
                <div class="base-form-field-wrapper">
                    <p-field-group :label="taskManagementTemplateStore.templates.TaskType"
                                   :style-type="isCreateMode ? 'primary' : 'secondary'"
                                   required
                                   :invalid="!isCreateMode && invalidState.taskType"
                                   :invalid-text="invalidTexts.taskType"
                    >
                        <template #default="{invalid}">
                            <p-select-dropdown :key="taskTypesDropdownKey"
                                               :selected="selectedTaskTypeItems"
                                               :handler="taskTypeMenuItemsHandler"
                                               :page-size="10"
                                               :invalid="invalid"
                                               :readonly="!isCreateMode || !currentCategory"
                                               block
                                               @update:selected="handleUpdateSelectedTaskType"
                            />
                        </template>
                    </p-field-group>
                </div>
            </div>
            <p class="min-h-5 text-label-md text-gray-600">
                {{ taskCategoryDesciprion }}
                {{ taskCategoryDesciprion && taskTypeDescription ? ' | ' : '' }}
                {{ taskTypeDescription }}
            </p>
        </div>
        <div v-if="!isCreateMode"
             class="base-form-top-wrapper"
        >
            <div class="base-form-field-wrapper">
                <p-field-group :label="$t('OPSFLOW.STATUS')"
                               style-type="secondary"
                               required
                               :invalid="invalidState.status"
                               :invalid-text="invalidTexts.status"
                >
                    <p-skeleton v-if="isTaskTypeLoading"
                                height="2rem"
                    />
                    <template v-else-if="taskContentFormStore.getters.isArchivedTask">
                        {{ getStatusTypeLabel(originTask?.status_type) }}
                    </template>
                    <p-select-dropdown v-else
                                       :key="taskStatusDropdownKey"
                                       :selected="selectedStatusItems"
                                       :handler="statusMenuItemsHandler"
                                       ::page-size="10"
                                       :invalid="invalidState.status"
                                       :readonly="!userStore.getters.isDomainAdmin || !currentCategory"
                                       block
                                       @update:selected="handleUpdateSelectedStatus"
                    >
                        <template #dropdown-button="item">
                            <p-badge v-if="item.label"
                                     badge-type="subtle"
                                     :style-type="item.color"
                            >
                                {{ item.label }}
                            </p-badge>
                        </template>
                        <template #menu-item--format="{ item }">
                            <p-badge badge-type="subtle"
                                     :style-type="item.color"
                            >
                                {{ item.label }}
                            </p-badge>
                        </template>
                    </p-select-dropdown>
                </p-field-group>
            </div>
            <div class="base-form-field-wrapper">
                <div v-if="!isCreateMode">
                    <div class="flex gap-2 items-center">
                        <p-field-title size="sm"
                                       color="gray"
                        >
                            {{ userStore.getters.isDomainAdmin ? $t('OPSFLOW.TASK_BOARD.ASSIGN_TO') : $t('OPSFLOW.ASSIGNEE') }}
                        </p-field-title>
                        <p-button v-if="userStore.getters.isDomainAdmin && !taskContentFormStore.getters.isArchivedTask"
                                  size="sm"
                                  style-type="tertiary"
                                  @click="handleClickAssign"
                        >
                            {{ $t('OPSFLOW.TASK_BOARD.ASSIGN') }}
                        </p-button>
                    </div>
                    <p class="mt-1 text-label-md text-blue-900">
                        {{ assigneeName }}
                    </p>
                </div>
            </div>
        </div>
    </component>
</template>

<style scoped lang="postcss">
.base-form-top-wrapper {
    @apply flex-1 flex mobile:flex-wrap gap-4;
}
.base-form-field-wrapper {
    @apply flex-1 min-w-40 mobile:min-w-full flex flex-col gap-1;
}
</style>
