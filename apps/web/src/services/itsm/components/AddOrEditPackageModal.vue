<script setup lang="ts">
import { reactive, onBeforeMount } from 'vue';

import {
    PButtonModal, PFieldGroup, PTextInput, PTextarea, PSelectButton,
} from '@cloudforet/mirinae';

import { useFormValidator } from '@/common/composables/form-validator';

import { useTaskManagementPageStore } from '@/services/itsm/stores/admin/task-management-page-store';

const taskManagementPageStore = useTaskManagementPageStore();
const taskManagementPageState = taskManagementPageStore.state;
const packageStore = taskManagementPageStore.packageStore;

const {
    forms: { name, description },
    invalidState,
    invalidTexts,
    setForm, isAllValid,
    initForm,
} = useFormValidator({
    name: '',
    description: '',
}, {
    name(value: string) {
        if (!value.trim().length) return 'Name is required';
        if (value.length > 50) return 'Name should be less than 50 characters';
        if (packageStore.state.packages?.some((p) => p.package_id !== taskManagementPageState.editTargetPackageId && p.name === value)) return 'Name already exists';
        return true;
    },
    description(value: string) {
        return value.length > 0 ? true : 'Description is required';
    },
});

const state = reactive({
    workspaceOptions: ['All Workspaces', 'Specific Workspaces'],
    selectedWorkspace: 'All Workspaces',
});

const handleCancelOrClose = () => {
    initForm();
    taskManagementPageStore.closeAddOrEditPackageModal();
};
const handleConfirm = async () => {
    if (!isAllValid.value) return;
    if (taskManagementPageState.editTargetPackageId) {
        await packageStore.updatePackage({
            package_id: taskManagementPageState.editTargetPackageId,
            name: name.value,
            description: description.value,
            tags: {},
        });
    } else {
        await packageStore.createPackage({
            name: name.value,
            description: description.value,
            tags: {},
        });
    }

    taskManagementPageStore.closeAddOrEditPackageModal();
};

onBeforeMount(() => {
    if (taskManagementPageState.editTargetPackageId) {
        const targetPackage = packageStore.state.packages?.find((p) => p.package_id === taskManagementPageState.editTargetPackageId);
        if (targetPackage) {
            setForm('name', targetPackage.name);
            setForm('description', targetPackage.description);
        }
    }
});
</script>

<template>
    <p-button-modal header-title="Add Package"
                    :visible="taskManagementPageState.visibleAddOrEditPackageModal"
                    :loading="packageStore.state.creating"
                    :disabled="!isAllValid"
                    @cancel="handleCancelOrClose"
                    @close="handleCancelOrClose"
                    @confirm="handleConfirm"
    >
        <template #body>
            <p-field-group label="Name"
                           required
                           :invalid="invalidState.name"
                           :invalid-text="invalidTexts.name"
            >
                <p-text-input :value="name"
                              :invalid="invalidState.name"
                              @update:value="setForm('name', $event)"
                />
            </p-field-group>
            <p-field-group label="Description"
                           required
                           :invalid="invalidState.description"
                           :invalid-text="invalidTexts.description"
            >
                <p-textarea :value="description"
                            :invalid="invalidState.description"
                            placeholder="Describe this support package in a few words."
                            @update:value="setForm('description', $event)"
                />
            </p-field-group>
            <p-field-group label="Workspace">
                <div class="flex flex-wrap gap-2">
                    <p-select-button v-for="option in state.workspaceOptions"
                                     :key="option"
                                     :value="option"
                                     :selected="state.selectedWorkspace"
                                     @change="state.selectedWorkspace = option"
                    >
                        {{ option }}
                    </p-select-button>
                </div>
                <div v-if="state.selectedWorkspace === 'Specific Workspaces'">
                    workspace select dropdown
                </div>
            </p-field-group>
        </template>
    </p-button-modal>
</template>

