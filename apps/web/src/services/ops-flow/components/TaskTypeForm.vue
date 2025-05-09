<script setup lang="ts">
import { nextTick, watch, computed } from 'vue';

import { cloneDeep } from 'lodash';

import {
    POverlayLayout, PFieldGroup, PTextInput, PButton, PTextarea, PRadioGroup, PRadio,
} from '@cloudforet/mirinae';

import { getParticle, i18n as _i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';
import UserSelectDropdown from '@/common/modules/user/UserSelectDropdown.vue';

import { useTaskTypeFormMutations } from '@/services/ops-flow/composables/use-task-type-form-mutations';
import { useTaskTypeQuery } from '@/services/ops-flow/composables/use-task-type-query';
import type { Scope } from '@/services/ops-flow/composables/use-task-type-scope-field';
import { useTaskTypeScopeField } from '@/services/ops-flow/composables/use-task-type-scope-field';
import { useTaskTypesQuery } from '@/services/ops-flow/composables/use-task-types-query';
import { useTaskCategoryPageStore } from '@/services/ops-flow/stores/admin/task-category-page-store';
import {
    useTaskFieldsConfiguration,
} from '@/services/ops-flow/task-fields-configuration/composables/use-task-fields-configuration';
import TaskFieldsConfiguration from '@/services/ops-flow/task-fields-configuration/TaskFieldsConfiguration.vue';
import {
    useTaskManagementTemplateStore,
} from '@/services/ops-flow/task-management-templates/stores/use-task-management-template-store';


/* task management template store */
const taskManagementTemplateStore = useTaskManagementTemplateStore();

/* task category page store */
const taskCategoryPageStore = useTaskCategoryPageStore();
const taskCategoryPageState = taskCategoryPageStore.state;
const targetTaskTypeId = computed(() => taskCategoryPageState.targetTaskTypeId);
const currentCategoryId = computed(() => taskCategoryPageState.currentCategoryId);
const visibleForm = computed(() => taskCategoryPageState.visibleTaskTypeForm);

/* task type */
const { taskType } = useTaskTypeQuery({
    taskTypeId: computed(() => targetTaskTypeId.value),
    params: computed(() => ({ task_type_id: targetTaskTypeId.value as string })),
    enabled: computed(() => visibleForm.value && !!targetTaskTypeId.value),
});

/* form title */
const title = computed(() => {
    if (taskType.value) {
        return _i18n.t('OPSFLOW.EDIT_TARGET', { target: taskManagementTemplateStore.templates.TaskType });
    }
    return _i18n.t('OPSFLOW.ADD_TARGET', { target: taskManagementTemplateStore.templates.TaskType });
});

/* scope field */
const { scope, setScope, scopeValidator } = useTaskTypeScopeField();
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


/* task types */
const { taskTypes } = useTaskTypesQuery({
    params: computed(() => ({
        query: {
            filter: [{ k: 'category_id', v: currentCategoryId.value, o: 'eq' }],
        },
    })),
    enabled: computed(() => visibleForm.value && !!currentCategoryId.value),
});

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
        if (!taskTypes.value) return true;
        const isDuplicated = taskTypes.value.some((tt) => tt.name === value && tt.task_type_id !== taskType.value?.task_type_id);
        if (isDuplicated) return _i18n.t('OPSFLOW.VALIDATION.DUPLICATED', { topic: _i18n.t('OPSFLOW.NAME') });
        return true;
    },
});


/* task type mutations */
const { createTaskType, updateTaskType, isPending } = useTaskTypeFormMutations();

/* modal event handlers */
const handleConfirm = async () => {
    if (!isAllValid.value) return;
    try {
        if (!currentCategoryId.value) throw new Error('Category ID is not set');
        if (taskType.value) {
            await updateTaskType({
                target: taskType.value,
                form: {
                    name: name.value,
                    description: description.value,
                    assigneePool: assigneePool.value,
                },
                fields: fields.value,
            });
        } else {
            await createTaskType({
                categoryId: currentCategoryId.value,
                form: {
                    name: name.value,
                    scope: scope.value,
                    description: description.value,
                    assigneePool: assigneePool.value,
                },
                fields: fields.value,
            });
        }
        taskCategoryPageStore.closeTaskTypeForm();
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};
const handleCancelOrClose = () => {
    initForm();
    taskCategoryPageStore.closeTaskTypeForm();
};
const handleClosed = () => {
    taskCategoryPageStore.resetTargetTaskTypeId();
};

/* form initialization */
watch([visibleForm, taskType], async ([visible, tt], [prevVisible]) => {
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
                      :visible="visibleForm"
                      size="lg"
                      @close="handleCancelOrClose"
                      @closed="handleClosed"
    >
        <template #default>
            <div class="p-6 w-full">
                <p-field-group :label="$t('OPSFLOW.NAME')"
                               required
                               :invalid="!isPending && invalidState.name"
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
                          :disabled="isPending"
                          @click="handleCancelOrClose"
                >
                    {{ $t('COMMON.BUTTONS.CANCEL') }}
                </p-button>
                <p-button style-type="primary"
                          :loading="isPending"
                          :disabled="!isAllValid"
                          @click="handleConfirm"
                >
                    {{ $t('COMMON.BUTTONS.CONFIRM') }}
                </p-button>
            </div>
        </template>
    </p-overlay-layout>
</template>
