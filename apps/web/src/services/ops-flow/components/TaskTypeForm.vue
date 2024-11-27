<script setup lang="ts">
import {
    ref, nextTick, watch, toRef,
} from 'vue';


import {
    POverlayLayout, PFieldGroup, PTextInput, PSelectDropdown, PButton, PTextarea,
} from '@cloudforet/mirinae';

import { useUserReferenceStore } from '@/store/reference/user-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import { useAssigneePoolField } from '@/services/ops-flow/composables/use-assignee-pool-field';
import { useTaskCategoryPageStore } from '@/services/ops-flow/stores/admin/task-category-page-store';
import {
    useTaskFieldsConfiguration,
} from '@/services/ops-flow/task-fields-configuration/composables/use-task-fields-configuration';
import TaskFieldsConfiguration from '@/services/ops-flow/task-fields-configuration/TaskFieldsConfiguration.vue';


const taskCategoryPageStore = useTaskCategoryPageStore();
const taskCategoryPageState = taskCategoryPageStore.state;
const taskCategoryPageGetters = taskCategoryPageStore.getters;
const userReferenceStore = useUserReferenceStore();


/* assignee pool */
const {
    selectedUserItems,
    userMenuItemsHandler,
    handleUpdateSelectedUserItems,
    setInitialUsers,
} = useAssigneePoolField({
    userReferenceMap: toRef(userReferenceStore.getters, 'userItems'),
});

/* task field configuration */
const {
    taskFieldsValidator,
    setFields,
    addField,
    removeField,
    updateFieldValidation,
    setInitialFields,
} = useTaskFieldsConfiguration();

/* form validation */
const {
    forms: { name, description, fields },
    invalidState,
    invalidTexts,
    setForm, isAllValid,
    initForm,
    resetValidations,
} = useFormValidator({
    name: '',
    description: '',
    fields: taskFieldsValidator,
}, {
    name(value: string) {
        if (!value.trim().length) return 'Name is required';
        if (value.length > 50) return 'Name should be less than 50 characters';
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

const handleConfirm = async () => {
    if (!isAllValid.value) return;
    if (!taskCategoryPageState.currentCategoryId) return;
    try {
        loading.value = true;
        if (taskCategoryPageGetters.targetTaskType) {
            // await taskCategoryStore.update({
            //
            // });
        } else {
            // await taskCategoryStore.create({
            // });
        }
        taskCategoryPageStore.closeStatusForm();
    } catch (e) {
        ErrorHandler.handleRequestError(e, 'Failed to save task type');
        // TODO: handle error
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
            description: '',
        });
        setInitialUsers([]);
        setInitialFields([]);
        resetValidations();
        return;
    }
    if (target) {
        setForm('name', target.name);
        setForm('description', target.description);
        setInitialUsers(target.assignee_pool);
        setInitialFields(target.fields);
    }
});

</script>

<template>
    <p-overlay-layout :title="taskCategoryPageGetters.targetTaskType ? 'Edit Ticket Topic' : 'Add Ticket Topic'"
                      :visible="taskCategoryPageState.visibleTaskTypeForm"
                      size="lg"
                      @close="handleCancelOrClose"
                      @closed="handleClosed"
    >
        <template #default>
            <div class="p-6 w-full">
                <p-field-group label="Name"
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
                <p-field-group label="Assignee Pool"
                               :invalid="!loading && invalidState.assigneePool"
                               :invalid-text="invalidTexts.assigneePool"
                >
                    <template #default="{ invalid }">
                        <p-select-dropdown show-select-marker
                                           :invalid="invalid"
                                           :selected="selectedUserItems"
                                           :handler="userMenuItemsHandler"
                                           is-filterable
                                           use-fixed-menu-style
                                           show-delete-all-button
                                           @update:selected="handleUpdateSelectedUserItems"
                        />
                    </template>
                </p-field-group>
                <p-field-group label="Description">
                    <p-textarea :value="description"
                                placeholder="Describe this ticket type in a few words."
                                @update:value="setForm('description', $event)"
                    />
                </p-field-group>
                <p-field-group label="Fields Configuration"
                               required
                >
                    <task-fields-configuration class="mt-2"
                                               :fields="fields"
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
                    Cancel
                </p-button>
                <p-button style-type="primary"
                          :loading="loading"
                          :disabled="!isAllValid"
                          @click="handleConfirm"
                >
                    Confirm
                </p-button>
            </div>
        </template>
    </p-overlay-layout>
</template>
