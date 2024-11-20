<script setup lang="ts">
import { reactive, computed } from 'vue';

import {
    PHeadingLayout, PHeading, PSelectDropdown,
    PI, PToggleButton,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import AddOrEditCategoryModal from '@/services/itsm/components/AddOrEditCategoryModal.vue';
import AddOrEditPackageModal from '@/services/itsm/components/AddOrEditPackageModal.vue';
import SupportPackagePanel from '@/services/itsm/components/SupportPackagePanel.vue';
import TaskCategoryPanel from '@/services/itsm/components/TaskCategoryPanel.vue';
import { useTaskManagementPageStore } from '@/services/itsm/stores/admin/task-management-page-store';

const taskManagementPageStore = useTaskManagementPageStore();
const taskManagementPageState = taskManagementPageStore.state;
const state = reactive({
    enableLandingPage: false,
    templateMenuItems: computed<SelectDropdownMenuItem[]>(() => [
        { name: 'default', label: 'Default', icon: 'ic_service_alert-manager' },
        { name: 'support-center', label: 'Support Center', icon: 'ic_auth0' },
    ]),
});

const handleSelectTemplate = (templateId: string) => {
    taskManagementPageStore.setCurrentTemplateId(templateId);
};
</script>

<template>
    <div class="admin-task-management-page">
        <p-heading-layout class="mb-6">
            <template #heading>
                <p-heading title="Task Management">
                    <template #title-right-extra>
                        <p-select-dropdown :selected="taskManagementPageState.currentTemplateId"
                                           :menu="state.templateMenuItems"
                                           @select="handleSelectTemplate"
                        >
                            <template #dropdown-button="{ label, icon }">
                                <p-i :name="icon" /> {{ label }}
                            </template>
                        </p-select-dropdown>
                        <span class="ml-4 inline-flex items-center">Enable Landing page <p-toggle-button class="ml-2"
                                                                                                         :value.sync="state.enableLandingPage"
                        /></span>
                    </template>
                </p-heading>
            </template>
        </p-heading-layout>
        <support-package-panel />
        <task-category-panel />
        <add-or-edit-package-modal v-if="taskManagementPageState.visibleAddOrEditPackageModal" />
        <add-or-edit-category-modal v-if="taskManagementPageState.visibleAddOrEditCategoryModal" />
    </div>
</template>

