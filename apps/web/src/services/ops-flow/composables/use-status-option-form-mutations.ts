
import { computed, type Ref } from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { cloneDeep } from 'lodash';

import { useTaskCategoryApi } from '@/api-clients/opsflow/task-category/composables/use-task-category-api';
import type { TaskStatusOption, TaskStatusOptions, TaskStatusType } from '@/api-clients/opsflow/task/schema/type';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useCategoryStatusOptions } from './use-category-status-options';

type TaskStatusParams = Omit<TaskStatusOption, 'status_id'|'is_default'>;
interface StatusOptionsCreateVariables {
  statusType: TaskStatusType;
  form: TaskStatusParams;
}
interface StatusOptionsUpdateVariables {
  origin: TaskStatusOption;
  originStatusType: TaskStatusType;
  statusType: TaskStatusType;
  form: Partial<TaskStatusParams>;
}
type UpdatableTaskStatusOptions = Record<TaskStatusType, Array<TaskStatusOption|TaskStatusParams>>;

export const useStatusOptionFormMutations = ({
    categoryId,
}: {
  categoryId: Ref<string | undefined>;
}) => {
    const { categoryStatusOptions } = useCategoryStatusOptions({ categoryId });

    const { taskCategoryAPI } = useTaskCategoryApi();
    const queryClient = useQueryClient();
    const { key: taskCategoryListQueryKey } = useServiceQueryKey('opsflow', 'task-category', 'list');
    const { withSuffix: taskCategoryWithSuffix } = useServiceQueryKey('opsflow', 'task-category', 'get');

    /* create status options */
    const { mutateAsync: createStatusOptions, isPending: isCreating } = useMutation({
        mutationFn: async ({ statusType, form }: StatusOptionsCreateVariables) => {
            if (!categoryId.value) throw new Error('Category ID is required');
            if (!categoryStatusOptions.value) throw new Error('Category status options are required');
            const newStatusOptions = cloneDeep<UpdatableTaskStatusOptions>(categoryStatusOptions.value);
            newStatusOptions[statusType].push({
                name: form.name,
                color: form.color,
            });

            const data = await taskCategoryAPI.update({
                category_id: categoryId.value,
                status_options: newStatusOptions,
                force: true,
            });
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: taskCategoryListQueryKey.value });
            queryClient.invalidateQueries({ queryKey: taskCategoryWithSuffix(data.category_id) });
            showSuccessMessage('Task status option created successfully', '');
        },
        onError: (e) => {
            ErrorHandler.handleRequestError(e, 'Failed to create task status option');
        },
    });

    /* update status options */
    const { mutateAsync: updateStatusOptions, isPending: isUpdating } = useMutation({
        mutationFn: async ({
            origin, originStatusType, statusType, form,
        }: StatusOptionsUpdateVariables) => {
            if (!categoryId.value) throw new Error('Category ID is required');
            if (!categoryStatusOptions.value) throw new Error('Category status options are required');

            // clone status options to avoid mutate the original object
            const newStatusOptions = cloneDeep<UpdatableTaskStatusOptions>(categoryStatusOptions.value);

            // if status type is changed, remove from origin status type and add to new status type
            if (originStatusType !== statusType) {
                newStatusOptions[originStatusType] = (newStatusOptions as TaskStatusOptions)[originStatusType].filter((p) => p.status_id !== origin.status_id);
                newStatusOptions[statusType].push({
                    name: form.name || origin.name,
                    color: form.color || origin.color,
                });
            } else {
                // if status type is not changed, update the status option
                const target = (newStatusOptions as TaskStatusOptions)[statusType].find((p) => p.status_id === origin.status_id);
                if (!target) throw new Error('[Console Error] Failed to find target status option');
                if (form.name) target.name = form.name;
                if (form.color) target.color = form.color;
            }

            const res = await taskCategoryAPI.update({
                category_id: categoryId.value,
                status_options: newStatusOptions,
                force: true,
            });
            return res;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: taskCategoryListQueryKey.value });
            queryClient.invalidateQueries({ queryKey: taskCategoryWithSuffix(data.category_id) });
            showSuccessMessage('Task status option updated successfully', '');
        },
        onError: (e) => {
            ErrorHandler.handleRequestError(e, 'Failed to update task status option');
        },
    });

    return {
        createStatusOptions,
        updateStatusOptions,
        isProcessing: computed(() => isCreating.value || isUpdating.value),
    };
};
