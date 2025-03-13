<script setup lang="ts">
import {
    computed, ref, watch,
} from 'vue';

import { PButtonModal, PToolboxTable, getTextHighlightRegex } from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';
import type { DataTableField } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';
import type { ToolboxTableOptions } from '@cloudforet/mirinae/types/data-display/tables/toolbox-table/type';

import type { TaskModel } from '@/api-clients/opsflow/task/schema/model';
import { i18n } from '@/translations';

import type { UserReferenceItem } from '@/store/reference/user-reference-store';
import { useUserReferenceStore } from '@/store/reference/user-reference-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useTaskAPI } from '@/services/ops-flow/composables/use-task-api';
import { useTaskAssignStore } from '@/services/ops-flow/stores/task-assign-store';
import { useTaskContentFormStore } from '@/services/ops-flow/stores/task-content-form-store';
import { useTaskDetailPageStore } from '@/services/ops-flow/stores/task-detail-page-store';


const userReferenceStore = useUserReferenceStore();
const taskAssignStore = useTaskAssignStore();
const taskContentFormStore = useTaskContentFormStore();
const taskDetailPageStore = useTaskDetailPageStore();

const taskAPI = useTaskAPI();

const fields: DataTableField[] = [
    { label: 'User ID', name: 'name' },
    { label: 'Name', name: 'label' },
];

const allUserReferenceItems = computed<SelectDropdownMenuItem[]>(() => Object.values<UserReferenceItem>(userReferenceStore.getters.userItems).map((u) => ({
    name: u.key,
    label: u.label || u.name,
})));
const allUserItems = computed<SelectDropdownMenuItem[]>(() => {
    const assigneePool = taskAssignStore.state.currentAssigneePool;
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
    return sliced.map((s) => (s.name === taskAssignStore.state.currentAssignee
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
    taskAssignStore.closeAssignModal();
};

const updating = ref<boolean>(false);
const updateTaskAssignee = async (): Promise<TaskModel|undefined> => {
    try {
        if (!taskAssignStore.state.taskId) throw new Error('task id is not defined');
        if (selectIndex.value.length === 0) throw new Error('assignee is not selected');
        const newTask = await taskAPI.changeAssignee(taskAssignStore.state.taskId, refinedUserItems.value[selectIndex.value[0]].name);
        taskContentFormStore.setAssigneeToOriginTask(newTask.assignee);
        showSuccessMessage(i18n.t('OPSFLOW.ALT_S_ASSIGN'), '');
        return newTask;
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('OPSFLOW.ALT_E_ASSIGN'));
        return undefined;
    }
};
const handleConfirm = async () => {
    updating.value = true;
    const task = await updateTaskAssignee();
    taskDetailPageStore.loadNewEvents();
    taskAssignStore.closeAssignModal(task?.assignee);
    updating.value = false;
};

watch(() => taskAssignStore.state.visibleAssignModal, (visible) => {
    if (!visible) {
        selectIndex.value = [];
        searchText.value = '';
        pageStart.value = 1;
        pageLimit.value = 15;
    }
});

</script>

<template>
    <p-button-modal :visible="taskAssignStore.state.visibleAssignModal"
                    :header-title="$t('OPSFLOW.TASK_BOARD.ASSIGN_TO')"
                    size="md"
                    :loading="loading || updating"
                    :disabled="selectIndex.length === 0"
                    @cancel="handleCancelOrClose"
                    @close="handleCancelOrClose"
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

