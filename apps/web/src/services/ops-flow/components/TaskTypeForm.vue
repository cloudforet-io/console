<script setup lang="ts">
import {
    ref, nextTick, watch, computed,
} from 'vue';

import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { isEqual, cloneDeep } from 'lodash';

import {
    POverlayLayout, PFieldGroup, PTextInput, PButton, PTextarea, PRadioGroup, PRadio,
} from '@cloudforet/mirinae';

import { useTaskTypeApi } from '@/api-clients/opsflow/task-type/composables/use-task-type-api';
import type { TaskTypeModel } from '@/api-clients/opsflow/task-type/schema/model';
import { getParticle, i18n as _i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFieldValidator, useFormValidator } from '@/common/composables/form-validator';
import UserSelectDropdown from '@/common/modules/user/UserSelectDropdown.vue';

import { useTaskCategoryPageStore } from '@/services/ops-flow/stores/admin/task-category-page-store';
import { useTaskTypeStore } from '@/services/ops-flow/stores/task-type-store';
import {
    useTaskFieldsConfiguration,
} from '@/services/ops-flow/task-fields-configuration/composables/use-task-fields-configuration';
import TaskFieldsConfiguration from '@/services/ops-flow/task-fields-configuration/TaskFieldsConfiguration.vue';
import {
    useTaskManagementTemplateStore,
} from '@/services/ops-flow/task-management-templates/stores/use-task-management-template-store';



const taskCategoryPageStore = useTaskCategoryPageStore();
const taskCategoryPageState = taskCategoryPageStore.state;
const taskCategoryPageGetters = taskCategoryPageStore.getters;
const taskTypeStore = useTaskTypeStore();
const taskManagementTemplateStore = useTaskManagementTemplateStore();

/* task type */
const { taskTypeAPI, taskTypeQueryKey, taskTypeListQueryKey } = useTaskTypeApi();
const queryClient = useQueryClient();
const { data: taskType } = useQuery({
    queryKey: computed(() => [
        ...taskTypeQueryKey.value,
        taskCategoryPageState.targetTaskTypeId,
    ]),
    queryFn: async () => {
        if (!taskCategoryPageState.targetTaskTypeId) return null;
        return taskTypeAPI.get({ task_type_id: taskCategoryPageState.targetTaskTypeId });
    },
    enabled: computed(() => taskCategoryPageState.visibleTaskTypeForm && !!taskCategoryPageState.targetTaskTypeId),
});

/* form title */
const title = computed(() => {
    if (taskType.value) {
        return _i18n.t('OPSFLOW.EDIT_TARGET', { target: taskManagementTemplateStore.templates.TaskType });
    }
    return _i18n.t('OPSFLOW.ADD_TARGET', { target: taskManagementTemplateStore.templates.TaskType });
});

/* scope field */
type Scope = 'PROJECT'|'WORKSPACE';
const scopeValidator = useFieldValidator<Scope>('PROJECT', (val) => {
    if (!val) {
        return _i18n.t('OPSFLOW.VALIDATION.REQUIRED', {
            topic: _i18n.t('OPSFLOW.SCOPE'),
            particle: getParticle(_i18n.t('OPSFLOW.SCOPE') as string, 'topic'),
        });
    }
    return true;
});
const { value: scope, setValue: setScope } = scopeValidator;
const handleChangeScope = (val: Scope) => {
    setScope(val);
};

/* task field configuration */
const {
    taskFieldsValidator,
    fields,
    setFields,
    addField,
    removeField,
    updateFieldValidation,
    setInitialFields,
} = useTaskFieldsConfiguration();

/* form */
const {
    forms: { name, description, assigneePool },
    invalidState,
    invalidTexts,
    setForm, isAllValid,
    initForm,
    resetValidations,
} = useFormValidator({
    name: '',
    scope: scopeValidator,
    assigneePool: [] as string[],
    description: '',
    fields: taskFieldsValidator,
}, {
    name(value: string) {
        if (!value.trim().length) {
            return _i18n.t('OPSFLOW.VALIDATION.REQUIRED', {
                topic: _i18n.t('OPSFLOW.NAME'),
                particle: getParticle(_i18n.t('OPSFLOW.NAME') as string, 'topic'),
            });
        }
        if (value.length > 50) {
            return _i18n.t('OPSFLOW.VALIDATION.LENGTH_MAX', {
                topic: _i18n.t('OPSFLOW.NAME'),
                particle: getParticle(_i18n.t('OPSFLOW.NAME') as string, 'topic'),
                length: 50,
            });
        }
        if (!taskCategoryPageGetters.taskTypes) return true;
        const isDuplicated = taskCategoryPageGetters.taskTypes.some((tt) => tt.name === value && tt.task_type_id !== taskType.value?.task_type_id);
        if (isDuplicated) return _i18n.t('OPSFLOW.VALIDATION.DUPLICATED', { topic: _i18n.t('OPSFLOW.NAME') });
        return true;
    },
});

const loading = ref(false);
const handleCancelOrClose = () => {
    initForm();
    taskCategoryPageStore.closeTaskTypeForm();
};
const handleClosed = () => {
    taskCategoryPageStore.resetTargetTaskTypeId();
};


const createTaskType = async (categoryId: string) => {
    try {
        await taskTypeStore.create({
            name: name.value,
            require_project: scope.value === 'PROJECT',
            assignee_pool: assigneePool.value,
            description: description.value,
            category_id: categoryId,
            fields: fields.value.map((f) => ({ ...f, _field_id: undefined })),
        });
        showSuccessMessage(_i18n.t('OPSFLOW.ALT_S_ADD_TARGET', { target: taskManagementTemplateStore.templates.TaskType }), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, _i18n.t('OPSFLOW.ALT_E_ADD_TARGET', { target: taskManagementTemplateStore.templates.TaskType }));
    }
};


/* update task type */
const { mutateAsync: updateTaskTypeMutation } = useMutation({
    mutationFn: taskTypeAPI.update,
    onSuccess: () => {
        // Invalidate task type detail and list queries
        queryClient.invalidateQueries({ queryKey: taskTypeQueryKey.value });
        queryClient.invalidateQueries({ queryKey: taskTypeListQueryKey.value });
    },
    throwOnError: true,
});
const { mutateAsync: updateTaskTypeFieldsMutation } = useMutation({
    mutationFn: taskTypeAPI.updateFields,
    onSuccess: () => {
        // Only invalidate task type detail query
        queryClient.invalidateQueries({ queryKey: taskTypeQueryKey.value });
    },
    throwOnError: true,
});
const { mutateAsync: updateTaskType } = useMutation({
    mutationFn: async (target: TaskTypeModel) => {
        const promises: Promise<any>[] = [];
        const hasBasicChanges = target.name !== name.value
            || target.description !== description.value
            || !isEqual(target.assignee_pool, assigneePool.value);

        // Execute only if basic info has changed
        if (hasBasicChanges) {
            promises.push(updateTaskTypeMutation({
                task_type_id: target.task_type_id,
                name: name.value,
                description: description.value,
                assignee_pool: assigneePool.value,
            }));
        }

        // Execute only if fields have changed
        if (!isEqual(fields.value, target.fields)) {
            promises.push(updateTaskTypeFieldsMutation({
                task_type_id: target.task_type_id,
                fields: fields.value.map((f) => ({ ...f, _field_id: undefined })),
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
        showSuccessMessage(_i18n.t('OPSFLOW.ALT_S_EDIT_TARGET', { target: taskManagementTemplateStore.templates.TaskType }), '');
    },
    onError: (e) => {
        ErrorHandler.handleRequestError(e, _i18n.t('OPSFLOW.ALT_E_EDIT_TARGET', { target: taskManagementTemplateStore.templates.TaskType }));
    },
});

/* event handlers */
const handleConfirm = async () => {
    if (!isAllValid.value) return;
    try {
        if (!taskCategoryPageState.currentCategoryId) throw new Error('Category ID is not set');
        loading.value = true;
        if (taskType.value) {
            await updateTaskType(taskType.value);
        } else {
            await createTaskType(taskCategoryPageState.currentCategoryId);
        }
        taskCategoryPageStore.closeTaskTypeForm();
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        loading.value = false;
    }
};

/* form initialization */
watch([() => taskCategoryPageState.visibleTaskTypeForm, taskType], async ([visible, tt], [prevVisible]) => {
    if (!visible) {
        if (!prevVisible) return; // prevent initial call
        await nextTick(); // wait for closing animation
        setForm({
            name: '',
            scope: 'PROJECT',
            description: '',
            assigneePool: [],
        });
        setInitialFields([]);
        resetValidations();
        return;
    }
    if (tt) {
        const target = cloneDeep(tt);
        setForm({
            name: target.name,
            scope: target.require_project ? 'PROJECT' : 'WORKSPACE',
            description: target.description,
            assigneePool: target.assignee_pool,
        });
        setInitialFields(target.fields);
    }
});

</script>

<template>
    <p-overlay-layout :title="title"
                      :visible="taskCategoryPageState.visibleTaskTypeForm"
                      size="lg"
                      @close="handleCancelOrClose"
                      @closed="handleClosed"
    >
        <template #default>
            <div class="p-6 w-full">
                <p-field-group :label="$t('OPSFLOW.NAME')"
                               required
                               :invalid="!loading && invalidState.name"
                               :invalid-text="invalidTexts.name"
                >
                    <template #default="{ invalid }">
                        <p-text-input :value="name"
                                      :invalid="invalid"
                                      block
                                      @update:value="setForm('name', $event)"
                        />
                    </template>
                </p-field-group>
                <p-field-group v-if="!taskType"
                               :label="$t('OPSFLOW.SCOPE')"
                               required
                >
                    <p-radio-group>
                        <p-radio :selected="scope"
                                 value="PROJECT"
                                 @change="handleChangeScope"
                        >
                            {{ $t('OPSFLOW.PROJECT') }}
                        </p-radio>
                        <p-radio :selected="scope"
                                 value="WORKSPACE"
                                 @change="handleChangeScope"
                        >
                            {{ $t('OPSFLOW.WORKSPACE') }}
                        </p-radio>
                    </p-radio-group>
                </p-field-group>
                <p-field-group :label="$t('OPSFLOW.ASSIGNEE_POOL')">
                    <user-select-dropdown :selected-ids="assigneePool"
                                          appearance-type="stack"
                                          :show-user-group-list="false"
                                          selection-type="multiple"
                                          block
                                          @update:selected-ids="setForm('assigneePool', $event)"
                    />
                </p-field-group>
                <p-field-group :label="$t('OPSFLOW.DESCRIPTION')">
                    <p-textarea :value="description"
                                :placeholder="String($t('OPSFLOW.DESCRIBE_FIELD', {
                                    field: taskManagementTemplateStore.templates.taskType ,
                                    particle: getParticle(taskManagementTemplateStore.templates.taskType , 'object')
                                }))"
                                @update:value="setForm('description', $event)"
                    />
                </p-field-group>
                <p-field-group :label="$t('OPSFLOW.FIELDS_CONFIG')"
                               required
                >
                    <task-fields-configuration class="mt-2"
                                               :require-project="scope === 'PROJECT'"
                                               :fields="fields"
                                               :origin-fields="taskType?.fields"
                                               @update:fields="setFields"
                                               @add-field="addField"
                                               @remove-field="removeField"
                                               @update-field-validation="updateFieldValidation"
                    />
                </p-field-group>
            </div>
        </template>
        <template #footer>
            <div class="py-3 px-6 flex flex-wrap gap-1 justify-end">
                <p-button style-type="transparent"
                          :disabled="loading"
                          @click="handleCancelOrClose"
                >
                    {{ $t('COMMON.BUTTONS.CANCEL') }}
                </p-button>
                <p-button style-type="primary"
                          :loading="loading"
                          :disabled="!isAllValid"
                          @click="handleConfirm"
                >
                    {{ $t('COMMON.BUTTONS.CONFIRM') }}
                </p-button>
            </div>
        </template>
    </p-overlay-layout>
</template>
