<script setup lang="ts">
import { reactive, computed } from 'vue';

import {
    PSelectDropdown, PI,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import {
    TASK_MANAGEMENT_TEMPLATE_TYPES,
} from '@/services/ops-flow/task-management-templates/constants/task-management-template-constant';
import {
    useTaskManagementTemplateStore,
} from '@/services/ops-flow/task-management-templates/stores/use-task-management-template-store';
import type {
    TaskManagementTemplateType,
} from '@/services/ops-flow/task-management-templates/types/task-management-template-type';

const taskManagementTemplateStore = useTaskManagementTemplateStore();
const taskManagementTemplateState = taskManagementTemplateStore.state;

const state = reactive({
    templateMenuItems: computed<SelectDropdownMenuItem[]>(() => TASK_MANAGEMENT_TEMPLATE_TYPES.map((templateType) => ({
        name: templateType,
        label: taskManagementTemplateStore.translate('templateName', templateType).value,
    }))),
});

const handleSelectTemplate = async (templateId: TaskManagementTemplateType) => {
    if (templateId === taskManagementTemplateState.templateId) return;
    await taskManagementTemplateStore.updateTemplateId(templateId);
};
</script>

<template>
    <div class="inline-flex px-4 py-2 rounded-lg bg-gray-150">
        <div class="flex items-center gap-2 flex-wrap">
            <div class="inline-flex items-center gap-1 text-gray-700 font-bold">
                <span class="text-label-md">Template Type</span>
                <p-i name="ic_info-circle"
                     width="1rem"
                     height="1rem"
                />
            </div>
            <p-select-dropdown :selected="taskManagementTemplateState.templateId"
                               :menu="state.templateMenuItems"
                               class="w-64"
                               style-type="rounded"
                               @select="handleSelectTemplate"
            />
        </div>
    </div>
</template>
