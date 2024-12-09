<script setup lang="ts">
import {
    computed, ref, watch,
} from 'vue';

import { PButtonModal, PToolboxTable, getTextHighlightRegex } from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';
import type { DataTableField } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';
import type { ToolboxTableOptions } from '@cloudforet/mirinae/types/data-display/tables/toolbox-table/type';

import { useUserReferenceStore } from '@/store/reference/user-reference-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useTaskContentFormStore } from '@/services/ops-flow/stores/task-content-form-store';
import { useTaskDetailPageStore } from '@/services/ops-flow/stores/task-detail-page-store';
import { useTaskStore } from '@/services/ops-flow/stores/task-store';

const userReferenceStore = useUserReferenceStore();
const taskDetailPageStore = useTaskDetailPageStore();
const taskContentFormStore = useTaskContentFormStore();
const taskStore = useTaskStore();

const fields: DataTableField[] = [
    { label: 'User ID', name: 'name' },
    { label: 'Name', name: 'label' },
];

const allUserReferenceItems = computed<SelectDropdownMenuItem[]>(() => Object.values(userReferenceStore.getters.userItems.map((u) => ({ name: u.key, label: u.label || u.name }))));
const allUserItems = computed<SelectDropdownMenuItem[]>(() => {
    const assigneePool = taskContentFormStore.state.currentAssigneePool;
    if (assigneePool && assigneePool.length > 0) {
        return assigneePool.map((d) => (userReferenceStore.getters.userItems[d]
            ? { name: d, label: userReferenceStore.getters.userItems[d].label || userReferenceStore.getters.userItems[d].name }
            : { name: d, label: d }));
    }
    return allUserReferenceItems.value;
});
const loading = computed<boolean>(() => !userReferenceStore.state.items);
const searchText = ref<string>('');
const pageStart = ref<number>(1);
const pageLimit = ref<number>(15);
const refinedUserItems = computed<SelectDropdownMenuItem[]>(() => {
    const filtered = allUserItems.value.filter((item) => getTextHighlightRegex(searchText.value).test(item.label as string));
    const sliced = filtered.slice(pageStart.value - 1, pageStart.value + pageLimit.value - 1);
    return sliced.map((s) => (s.name === taskContentFormStore.state.currentAssignee
        ? { ...s, disabled: true } : s));
});
const getRowSelectable = (item: SelectDropdownMenuItem) => !item.disabled;
const handleChangeTable = async (options: ToolboxTableOptions = {}) => {
    if (options.searchText !== undefined) searchText.value = options.searchText;
    if (options.pageStart !== undefined) pageStart.value = options.pageStart;
    if (options.pageLimit !== undefined) pageLimit.value = options.pageLimit;
};

const selectIndex = ref<number[]>([]);

const handleCancelOrClose = () => {
    taskContentFormStore.closeAssignModal();
};
const handleClosed = () => {
    taskContentFormStore.resetAssigneeModal();
};

const updating = ref<boolean>(false);
const updateTaskAssignee = async () => {
    try {
        if (!taskDetailPageStore.state.taskId) throw new Error('task id is not defined');
        if (selectIndex.value.length === 0) throw new Error('assignee is not selected');
        updating.value = true;
        const newTask = await taskStore.update({
            task_id: taskDetailPageStore.state.taskId,
            assignee: refinedUserItems.value[selectIndex.value[0]].name,
        });
        taskContentFormStore.setAssignee(newTask.assignee);
        showSuccessMessage('Task assigned successfully', '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, 'Failed to assign task');
    } finally {
        updating.value = false;
    }
};
const handleConfirm = async () => {
    await updateTaskAssignee();
    taskContentFormStore.closeAssignModal();
};

watch(() => taskContentFormStore.state.visibleAssignModal, (visible) => {
    if (!visible) {
        selectIndex.value = [];
        searchText.value = '';
        pageStart.value = 1;
        pageLimit.value = 15;
    }
});

</script>

<template>
    <p-button-modal :visible="taskContentFormStore.state.visibleAssignModal"
                    header-title="Assign Member"
                    size="md"
                    :loading="loading || updating"
                    :disabled="selectIndex.length === 0"
                    @cancel="handleCancelOrClose"
                    @close="handleCancelOrClose"
                    @closed="handleClosed"
                    @confirm="handleConfirm"
    >
        <template #body>
            <p-toolbox-table :excel-visible="false"
                             selectable
                             :multi-select="false"
                             :fields="fields"
                             :items="refinedUserItems"
                             :select-index="selectIndex"
                             :get-row-selectable="getRowSelectable"
                             :page-size="15"
                             :loading="loading"
                             @update:select-index="selectIndex = $event"
                             @change="handleChangeTable"
                             @refresh="handleChangeTable()"
            />
        </template>
    </p-button-modal>
</template>

