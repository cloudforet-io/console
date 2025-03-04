<script setup lang="ts">
import {
    ref, nextTick, watch, computed,
} from 'vue';

import { isEqual, cloneDeep } from 'lodash';

import {
    POverlayLayout, PFieldGroup, PTextInput, PButton, PTextarea, PRadioGroup, PRadio,
} from '@cloudforet/mirinae';

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

import type { TaskTypeModel } from '@/api-clients/opsflow/task/schema-type/model';

const taskCategoryPageStore = useTaskCategoryPageStore();
const taskCategoryPageState = taskCategoryPageStore.state;
const taskCategoryPageGetters = taskCategoryPageStore.getters;
const taskTypeStore = useTaskTypeStore();
const taskManagementTemplateStore = useTaskManagementTemplateStore();

const title = computed(() => {
    if (taskCategoryPageGetters.targetTaskType) {
        return _i18n.t('OPSFLOW.EDIT_TARGET', { target: taskManagementTemplateStore.templates.TaskType });
    }
    return _i18n.t('OPSFLOW.ADD_TARGET', { target: taskManagementTemplateStore.templates.TaskType });
});

/* scope */
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

/* form validation */
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
        const isDuplicated = taskCategoryPageGetters.taskTypes.some((taskType) => taskType.name === value && taskType.task_type_id !== taskCategoryPageGetters.targetTaskType?.task_type_id);
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

const updateTaskTypeFields = async (taskTypeId: string) => {
    await taskTypeStore.updateFields({
        task_type_id: taskTypeId,
        fields: fields.value.map((f) => ({ ...f, _field_id: undefined })),
        force: true,
    });
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

const updateTaskType = async (target: TaskTypeModel) => {
    try {
        const promises: Promise<any>[] = [];
        if (target.name !== name.value
            || target.description !== description.value
            || !isEqual(target.assignee_pool, assigneePool.value)
        ) {
            promises.push(taskTypeStore.update({
                task_type_id: target.task_type_id,
                name: name.value,
                description: description.value,
                assignee_pool: assigneePool.value,
            }));
        }
        if (!isEqual(fields.value, target.fields)) {
            promises.push(updateTaskTypeFields(target.task_type_id));
        }
        const result = await Promise.allSettled(promises);
        const errorMessages: string[] = [];
        result.forEach((res) => {
            if (res.status === 'rejected') {
                errorMessages.push(res.reason.message);
            }
        });
        if (errorMessages.length) {
            throw new Error(errorMessages.join('\n'));
        }
        showSuccessMessage(_i18n.t('OPSFLOW.ALT_S_EDIT_TARGET', { target: taskManagementTemplateStore.templates.TaskType }), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, _i18n.t('OPSFLOW.ALT_E_EDIT_TARGET', { target: taskManagementTemplateStore.templates.TaskType }));
    }
};

let initialTaskType: TaskTypeModel|undefined;
const handleConfirm = async () => {
    if (!isAllValid.value) return;
    try {
        if (!taskCategoryPageState.currentCategoryId) throw new Error('Category ID is not set');
        loading.value = true;
        if (initialTaskType) {
            await updateTaskType(initialTaskType);
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

watch([() => taskCategoryPageState.visibleTaskTypeForm, () => taskCategoryPageGetters.targetTaskType], async ([visible, target], [prevVisible]) => {
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
        initialTaskType = undefined;
        resetValidations();
        return;
    }
    if (target) {
        initialTaskType = cloneDeep(target);
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
                <p-field-group v-if="!taskCategoryPageGetters.targetTaskType"
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
                                :placeholder="$t('OPSFLOW.DESCRIBE_FIELD', {
                                    field: taskManagementTemplateStore.templates.taskType ,
                                    particle: getParticle(taskManagementTemplateStore.templates.taskType , 'object')
                                })"
                                @update:value="setForm('description', $event)"
                    />
                </p-field-group>
                <p-field-group :label="$t('OPSFLOW.FIELDS_CONFIG')"
                               required
                >
                    <task-fields-configuration class="mt-2"
                                               :scope="scope"
                                               :fields="fields"
                                               :origin-fields="taskCategoryPageGetters.targetTaskType?.fields"
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
