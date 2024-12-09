<script setup lang="ts">
import {
    reactive, ref, watch, toRaw, computed,
} from 'vue';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import type { Query } from '@cloudforet/core-lib/space-connector/type';
import {
    PPaneLayout, PToolbox, PDataTable, PDivider, PLink,
    PCollapsiblePanel, PBadge,
} from '@cloudforet/mirinae';
import type { DataTableField } from '@cloudforet/mirinae/src/data-display/tables/data-table/type';
import type { ToolboxOptions } from '@cloudforet/mirinae/types/controls/toolbox/type';

import type { TaskCategoryModel } from '@/schema/opsflow/task-category/model';
import type { TaskTypeModel } from '@/schema/opsflow/task-type/model';
import type { TaskModel } from '@/schema/opsflow/task/model';

import { useUserReferenceStore } from '@/store/reference/user-reference-store';

import TextEditorViewer from '@/common/components/editor/TextEditorViewer.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import { useTimezoneDate } from '@/common/composables/timezone-date';
import ProjectLinkButton from '@/common/modules/project/ProjectLinkButton.vue';

import { OPS_FLOW_ROUTE } from '@/services/ops-flow/routes/route-constant';
import { useTaskCategoryStore } from '@/services/ops-flow/stores/admin/task-category-store';
import { useBoardPageStore } from '@/services/ops-flow/stores/board-page-store';
import { useTaskStore } from '@/services/ops-flow/stores/task-store';
import { useTaskTypeStore } from '@/services/ops-flow/stores/task-type-store';
import {
    useTaskManagementTemplateStore,
} from '@/services/ops-flow/task-management-templates/stores/use-task-management-template-store';

const boardPageStore = useBoardPageStore();
const boardPageState = boardPageStore.state;
const taskStore = useTaskStore();
const taskTypeStore = useTaskTypeStore();
const taskCategoryStore = useTaskCategoryStore();
const userReferenceStore = useUserReferenceStore();
const taskManagementTemplateStore = useTaskManagementTemplateStore();

const loading = ref<boolean>(false);
const tasks = ref<TaskModel[]|undefined>(undefined);
const categoriesById = ref<Record<string, TaskCategoryModel>>({});
const taskTypesById = ref<Record<string, TaskTypeModel>>({});


/* table view formatter */
const getTaskTypeName = (taskTypeId: string) => {
    const taskType = taskTypesById.value[taskTypeId];
    return taskType ? taskType.name : taskTypeId;
};
const getStatusName = (category: TaskCategoryModel|undefined, statusId: string, statusType: string) => {
    const statusOptions = category?.status_options[statusType];
    if (!statusOptions) return statusId;
    const statusOption = statusOptions.find((option) => option.status_id === statusId);
    if (!statusOption) {
        const defaultOption = statusOptions.find((option) => option.is_default);
        if (defaultOption) return defaultOption.name;
        return statusId;
    }
    return statusOption.name;
};
const getStatusStyleType = (category: TaskCategoryModel|undefined, statusId: string, statusType: string) => {
    const statusOptions = category?.status_options[statusType];
    if (!statusOptions) return '';
    const statusOption = statusOptions.find((option) => option.status_id === statusId);
    if (!statusOption) {
        const defaultOption = statusOptions.find((option) => option.is_default);
        if (defaultOption) return defaultOption.color;
        return '';
    }
    return statusOption.color;
};
const { getTimezoneDate } = useTimezoneDate();

/* query */
const search = ref<string>('');
const pagination = reactive({
    page: 1,
    size: 15,
    total: 0,
});
const sort = reactive({
    key: 'created_at',
    desc: true,
});
const queryHelper = new ApiQueryHelper();
const getQuery = () => {
    queryHelper.setFilters([])
        .setMultiSortV2([toRaw(sort)])
        .setPage(pagination.page, pagination.size);
    if (search.value) queryHelper.addFilter({ v: search.value });
    if (boardPageState.currentCategoryId) queryHelper.addFilter({ k: 'category_id', v: boardPageState.currentCategoryId, o: '=' });

    return queryHelper.dataV2;
};

/* list */
const listTask = async (query: Query) => {
    try {
        loading.value = true;
        const results = await taskStore.list({
            query,
        });
        if (results) {
            tasks.value = results;
            loading.value = false;
        }
    } catch (e) {
        ErrorHandler.handleError(e);
        loading.value = false;
        tasks.value = undefined;
    }
};
let hasCategoriesAndTypesLoaded = false;
const listCategoriesAndTaskTypes = async () => {
    if (hasCategoriesAndTypesLoaded) return;
    const results = await Promise.allSettled([
        taskCategoryStore.list(),
        taskTypeStore.list({
            query: { only: ['task_type_id', 'name'] },
        }),
    ]);
    results.forEach((result, idx) => {
        if (result.status === 'fulfilled') {
            if (idx === 0) { // category case
                const categories = result.value;
                if (categories) {
                    categories.forEach((category) => {
                        categoriesById.value[category.category_id] = category;
                    });
                }
            } else { // type case
                const taskTypes = result.value;
                if (taskTypes) {
                    taskTypes.forEach((taskType) => {
                        taskTypesById.value[taskType.task_type_id] = taskType;
                    });
                }
            }
        }
    });
    categoriesById.value = { ...categoriesById.value };
    taskTypesById.value = { ...taskTypesById.value };
    hasCategoriesAndTypesLoaded = true;
};

listCategoriesAndTaskTypes();
watch(() => boardPageState.currentCategoryId, () => {
    listTask(getQuery());
}, { immediate: true });

/* toolbox */
const handleChange = (options: ToolboxOptions) => {
    if (options.searchText !== undefined) search.value = options.searchText;
    if (options.pageStart !== undefined) pagination.page = options.pageStart;
    if (options.pageLimit !== undefined) pagination.size = options.pageLimit;
    if (options.sortBy !== undefined) sort.key = options.sortBy;
    if (options.sortDesc !== undefined) sort.desc = options.sortDesc;
    listTask(getQuery());
};

/* table */
const fields = computed<DataTableField[] >(() => [
    {
        name: 'name',
        label: 'Title',
        width: '13rem',
    },
    {
        name: 'description',
        label: 'Description',
        width: '15rem',
    },
    {
        name: 'task_type_id',
        label: taskManagementTemplateStore.templates.taskType,
    },
    {
        name: 'status_id',
        label: 'Status',
    },
    {
        name: 'project_id',
        label: 'Project',
    },
    {
        name: 'assignee',
        label: 'Assignee',
    },
    {
        name: 'created_by',
        label: 'Created By',
    },
    {
        name: 'created_at',
        label: 'Created At',
    },
]);
const { getProperRouteLocation } = useProperRouteLocation();
</script>

<template>
    <p-pane-layout class="pt-6">
        <div class="px-4 pb-4">
            <p-toolbox class="mb-2"
                       :search-text="search"
                       :this-page="pagination.page"
                       :page-size="pagination.size"
                       :total-count="pagination.total"
                       @change="handleChange"
            />
            <p-divider />
            <div class="mt-6">
                filters
            </div>
        </div>
        <p-data-table :fields="fields"
                      :items="tasks"
                      class="w-auto"
        >
            <template #col-name-format="{item}">
                <p-collapsible-panel :line-clamp="1">
                    <p-link :text="item.name"
                            :to="getProperRouteLocation({
                                name: OPS_FLOW_ROUTE.BOARD.TASK_DETAIL._NAME,
                                params: {taskId: item.task_id},
                            })"
                            highlight
                    />
                </p-collapsible-panel>
            </template>
            <template #col-description-format="{item}">
                <p-collapsible-panel :line-clamp="1">
                    <text-editor-viewer :contents="item.description"
                                        :attachments="item.files.map(d => ({ fileId: d.file_id, downloadUrl: d.download_url}))"
                    />
                </p-collapsible-panel>
            </template>
            <template #col-task_type_id-format="{value}">
                {{ getTaskTypeName(value) }}
            </template>
            <template #col-status_id-format="{item}">
                <p-badge class="ml-2"
                         badge-type="subtle"
                         shape="square"
                         :style-type="getStatusStyleType(categoriesById[item.category_id], item.status_id, item.status_type)"
                >
                    {{ getStatusName(categoriesById[item.category_id], item.status_id, item.status_type) }}
                </p-badge>
            </template>
            <template #col-project_id-format="{value}">
                <project-link-button :project-id="value" />
            </template>
            <template #col-assignee-format="{value}">
                {{ userReferenceStore.getters.userItems[value]?.label || userReferenceStore.getters.userItems[value]?.name || value }}
            </template>
            <template #col-created_by-format="{value}">
                {{ userReferenceStore.getters.userItems[value]?.label || userReferenceStore.getters.userItems[value]?.name || value }}
            </template>
            <template #col-created_at-format="{value}">
                {{ getTimezoneDate(value) }}
            </template>
        </p-data-table>
    </p-pane-layout>
</template>
