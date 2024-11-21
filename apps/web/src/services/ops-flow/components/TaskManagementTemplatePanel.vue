<script setup lang="ts">
import { reactive, computed } from 'vue';

import {
    PPaneLayout, PHeading, PSelectDropdown, PI,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import { useTaskManagementStore } from '@/services/ops-flow/stores/admin/task-management-store';

const taskManagementStore = useTaskManagementStore();
const taskManagementState = taskManagementStore.state;
const state = reactive({
    enableLandingPage: false,
    templateMenuItems: computed<SelectDropdownMenuItem[]>(() => [
        { name: 'default', label: 'Default', icon: 'ic_service_alert-manager' },
        { name: 'support-center', label: 'Support Center', icon: 'ic_auth0' },
    ]),
});

const handleSelectTemplate = (templateId: string) => {
    taskManagementStore.setCurrentTemplateId(templateId);
};
</script>

<template>
    <p-pane-layout class="p-4">
        <p-heading class="mb-2"
                   title="Template Type"
                   heading-type="sub"
        />
        <p class="mb-4 text-label-md text-gray-600">
            템플릿에 대한 Description
        </p>
        <p-select-dropdown :selected="taskManagementState.currentTemplateId"
                           :menu="state.templateMenuItems"
                           @select="handleSelectTemplate"
        >
            <template #dropdown-button="{ label, icon }">
                <p-i :name="icon" /> {{ label }}
            </template>
        </p-select-dropdown>
    </p-pane-layout>
</template>
