<script setup lang="ts">
import {
    reactive, ref, watch, toRaw, computed,
} from 'vue';

import { QueryHelper } from '@cloudforet/core-lib/query';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import type { Query } from '@cloudforet/core-lib/space-connector/type';
import {
    PPaneLayout, PToolbox, PDataTable, PDivider, PBadge,
} from '@cloudforet/mirinae';
import type { DataTableField } from '@cloudforet/mirinae/src/data-display/tables/data-table/type';
import type { ToolboxOptions } from '@cloudforet/mirinae/types/controls/toolbox/type';

import type { TaskCategoryModel } from '@/api-clients/opsflow/task-category/schema/model';
import type { TaskTypeModel } from '@/api-clients/opsflow/task-type/schema/model';
import type { TaskModel } from '@/api-clients/opsflow/task/schema/model';
import { i18n } from '@/translations';

import { useUserReferenceStore } from '@/store/reference/user-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useTimezoneDate } from '@/common/composables/timezone-date';
import ProjectLinkButton from '@/common/modules/project/ProjectLinkButton.vue';

import BoardTaskFilters from '@/services/ops-flow/components/BoardTaskFilters.vue';
import BoardTaskNameField from '@/services/ops-flow/components/BoardTaskNameField.vue';
import { useTaskAPI } from '@/services/ops-flow/composables/use-task-api';
import { useTaskCategoryStore } from '@/services/ops-flow/stores/task-category-store';
import { useTaskTypeStore } from '@/services/ops-flow/stores/task-type-store';
import {
    useTaskManagementTemplateStore,
} from '@/services/ops-flow/task-management-templates/stores/use-task-management-template-store';
import type { TaskFilters } from '@/services/ops-flow/types/task-filters-type';

const props = defineProps<{
    categoryId?: string;
    relatedAssets?: string[];
    tag?: string;
}>();
const taskTypeStore = useTaskTypeStore();
const taskCategoryStore = useTaskCategoryStore();
const userReferenceStore = useUserReferenceStore();
const taskManagementTemplateStore = useTaskManagementTemplateStore();

const loading = ref<boolean>(false);
const taskAPI = useTaskAPI();
const tasks = ref<TaskModel[]|undefined>(undefined);
const categoriesById = computed<Record<string, TaskCategoryModel>>(() => {
    const map = {} as Record<string, TaskCategoryModel>;
    taskCategoryStore.getters.taskCategoriesIncludingDeleted.forEach((category) => {
        map[category.category_id] = category;
    });
    return map;
});
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
const { getTimezoneDate, getDuration } = useTimezoneDate();

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
const getQuery = (filters?: ConsoleFilter[]) => {
    queryHelper.setFilters(filters ?? [])
        .setMultiSortV2([toRaw(sort)])
        .setPage(pagination.page, pagination.size);
    if (search.value) queryHelper.addFilter({ v: search.value });
    if (props.categoryId) queryHelper.addFilter({ k: 'category_id', v: props.categoryId, o: '=' });
    if (props.relatedAssets) queryHelper.addFilter({ k: 'related_asset_id', v: props.relatedAssets, o: '=' });

    return queryHelper.dataV2;
};

/* list */
const listTask = async (query: Query) => {
    try {
        loading.value = true;
        const results = await taskAPI.list({
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
    results.forEach((result) => {
        if (result.status === 'fulfilled') {
            const taskTypes = result.value;
            if (taskTypes) {
                taskTypes.forEach((taskType) => {
                    taskTypesById.value[taskType.task_type_id] = taskType;
                });
            }
        }
    });
    taskTypesById.value = { ...taskTypesById.value };
    hasCategoriesAndTypesLoaded = true;
};

listCategoriesAndTaskTypes();
watch(() => props.categoryId, () => {
    listTask(getQuery());
}, { immediate: true });

/* toolbox */
const handleRefresh = () => {
    listTask(getQuery());
};
const handleChange = (options: ToolboxOptions) => {
    if (options.searchText !== undefined) search.value = options.searchText;
    if (options.pageStart !== undefined) pagination.page = options.pageStart;
    if (options.pageLimit !== undefined) pagination.size = options.pageLimit;
    if (options.sortBy !== undefined) sort.key = options.sortBy;
    if (options.sortDesc !== undefined) sort.desc = options.sortDesc;
    listTask(getQuery());
};

/* filters */
const taskFilterHelper = new QueryHelper();
const handleUpdateFilters = (values: TaskFilters) => {
    taskFilterHelper.setFilters([]);
    if (values.taskType.length) taskFilterHelper.addFilter({ k: 'task_type_id', v: values.taskType, o: '=' });
    if (values.status.length) taskFilterHelper.addFilter({ k: 'status_id', v: values.status, o: '=' });
    if (values.project.length) taskFilterHelper.addFilter({ k: 'project_id', v: values.project, o: '=' });
    if (values.createdBy.length) taskFilterHelper.addFilter({ k: 'created_by', v: values.createdBy, o: '=' });
    if (values.assignee.length) taskFilterHelper.addFilter({ k: 'assignee', v: values.assignee, o: '=' });
    listTask(getQuery(taskFilterHelper.filters));
};

/* table */
const fields = computed<DataTableField[] >(() => [
    {
        name: 'name',
        label: i18n.t('OPSFLOW.TITLE') as string,
        width: '30rem',
    },
    {
        name: 'task_type_id',
        label: taskManagementTemplateStore.templates.TaskType,
    },
    {
        name: 'status_id',
        label: i18n.t('OPSFLOW.STATUS') as string,
    },
    {
        name: 'project_id',
        label: i18n.t('OPSFLOW.PROJECT') as string,
    },
    {
        name: 'assignee',
        label: i18n.t('OPSFLOW.ASSIGNEE') as string,
    },
    {
        name: 'created_by',
        label: i18n.t('OPSFLOW.CREATED_BY') as string,
    },
    {
        name: 'created_at',
        label: i18n.t('OPSFLOW.CREATED_AT') as string,
    },
    {
        name: 'total_duration',
        label: i18n.t('OPSFLOW.TOTAL_DURATION') as string,
    },
]);

</script>

<template>
    <component :is="props.tag ? props.tag : PPaneLayout"
               class="pt-6"
    >
        <div class="px-4 pb-4">
            <p-toolbox class="mb-2"
                       :search-text="search"
                       :this-page="pagination.page"
                       :page-size="pagination.size"
                       :total-count="pagination.total"
                       @refresh="handleRefresh"
                       @change="handleChange"
            />
            <p-divider />
            <div class="mt-6">
                <board-task-filters :category-id="props.categoryId"
                                    @update="handleUpdateFilters"
                />
            </div>
        </div>
        <p-data-table :fields="fields"
                      :items="tasks"
                      :loading="loading"
                      class="w-auto"
        >
            <template #col-name-format="{item}">
                <board-task-name-field :task-id="item.task_id"
                                       :workspace-id="item.workspace_id"
                                       :name="item.name"
                />
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
                <project-link-button :project-id="value"
                                     no-role-if-not-exists
                />
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
            <template #col-total_duration-format="{item}">
                <template v-if="item.status_type === 'COMPLETED'">
                    {{ getDuration(item.created_at, item.completed_at) }}
                </template>
                <template v-else>
                    {{ getDuration(item.created_at) }}
                </template>
            </template>
        </p-data-table>
    </component>
</template>
