import { computed } from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { isEqual } from 'lodash';

import { useTaskTypeApi } from '@/api-clients/opsflow/task-type/composables/use-task-type-api';
import type { TaskTypeModel } from '@/api-clients/opsflow/task-type/schema/model';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { MutableTaskField } from '@/services/ops-flow/task-fields-configuration/types/mutable-task-field-type';
import { useTaskManagementTemplateStore } from '@/services/ops-flow/task-management-templates/stores/use-task-management-template-store';

import type { Scope } from './use-task-type-scope-field';

interface TaskTypeFormCreateVariables {
    categoryId: string;
    form: {
        name: string;
        scope: Scope;
        description?: string;
        assigneePool?: string[];
    };
  fields: MutableTaskField[]
}
interface TaskTypeFormUpdateVariables {
    target: TaskTypeModel;
    form: {
        name?: string;
        description?: string;
        assigneePool?: string[];
    };
  fields: MutableTaskField[]
}


export const useTaskTypeFormMutations = () => {
    const taskManagementTemplateStore = useTaskManagementTemplateStore();
    const { taskTypeAPI } = useTaskTypeApi();
    const queryClient = useQueryClient();

    const { key: taskTypeListQueryKey } = useServiceQueryKey('opsflow', 'task-type', 'list');
    const { withSuffix: taskTypeWithSuffix } = useServiceQueryKey('opsflow', 'task-type', 'get');

    /* create task type */
    const { mutateAsync: createTaskType, isPending: isCreating } = useMutation({
        mutationFn: ({ categoryId, form, fields }: TaskTypeFormCreateVariables) => taskTypeAPI.create({
            name: form.name,
            require_project: form.scope === 'PROJECT',
            assignee_pool: form.assigneePool,
            description: form.description,
            category_id: categoryId,
            fields: fields.map((f) => ({ ...f, _field_id: undefined })),
        }),
        onSuccess: () => {
            // Invalidate task type list query
            queryClient.invalidateQueries({ queryKey: taskTypeListQueryKey.value });
            showSuccessMessage(i18n.t('OPSFLOW.ALT_S_ADD_TARGET', { target: taskManagementTemplateStore.templates.TaskType }), '');
        },
        onError(e) {
            ErrorHandler.handleRequestError(e, i18n.t('OPSFLOW.ALT_E_ADD_TARGET', { target: taskManagementTemplateStore.templates.TaskType }));
        },
    });

    /* update task type */
    const { mutateAsync: updateTaskTypeMutation, isPending: isUpdating } = useMutation({
        mutationFn: taskTypeAPI.update,
        onSuccess: (data) => {
            // Invalidate task type detail and list queries
            queryClient.invalidateQueries({ queryKey: taskTypeWithSuffix(data.task_type_id) });
            queryClient.invalidateQueries({ queryKey: taskTypeListQueryKey.value });
        },
        throwOnError: true,
    });
    const { mutateAsync: updateTaskTypeFieldsMutation } = useMutation({
        mutationFn: taskTypeAPI.updateFields,
        onSuccess: (data) => {
            // Only invalidate task type detail query
            queryClient.invalidateQueries({ queryKey: taskTypeWithSuffix(data.task_type_id) });
        },
        throwOnError: true,
    });
    const { mutateAsync: updateTaskType } = useMutation({
        mutationFn: async ({ target, form, fields }: TaskTypeFormUpdateVariables) => {
            const promises: Promise<any>[] = [];
            const hasBasicChanges = target.name !== form.name
          || target.description !== form.description
          || !isEqual(target.assignee_pool, form.assigneePool);

            // Execute only if basic info has changed
            if (hasBasicChanges) {
                promises.push(updateTaskTypeMutation({
                    task_type_id: target.task_type_id,
                    name: form.name,
                    description: form.description,
                    assignee_pool: form.assigneePool,
                }));
            }

            // Execute only if fields have changed
            if (!isEqual(target.fields, fields)) {
                promises.push(updateTaskTypeFieldsMutation({
                    task_type_id: target.task_type_id,
                    fields: fields.map((f) => ({ ...f, _field_id: undefined })),
                    force: true,
                }));
            }

            // Wait for all promises to resolve
            const result = await Promise.allSettled(promises);

            // Error handling
            const errorMessages: string[] = [];
            result.forEach((res) => {
                if (res.status === 'rejected') {
                    errorMessages.push(res.reason.message);
                }
            });
            if (errorMessages.length) {
                throw new Error(errorMessages.join('\n'));
            }
        },
        onSuccess: () => {
            showSuccessMessage(i18n.t('OPSFLOW.ALT_S_EDIT_TARGET', { target: taskManagementTemplateStore.templates.TaskType }), '');
        },
        onError: (e) => {
            ErrorHandler.handleRequestError(e, i18n.t('OPSFLOW.ALT_E_EDIT_TARGET', { target: taskManagementTemplateStore.templates.TaskType }));
        },
    });

    return {
        createTaskType,
        updateTaskType,
        isPending: computed(() => isCreating.value || isUpdating.value),
    };
};
