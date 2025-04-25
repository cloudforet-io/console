<script setup lang="ts">
import {
    reactive, ref, toRaw, computed,
    watch,
} from 'vue';

import { useQuery } from '@tanstack/vue-query';

import { QueryHelper } from '@cloudforet/core-lib/query';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import type { Query } from '@cloudforet/core-lib/space-connector/type';
import {
    PPaneLayout, PToolbox, PDataTable, PDivider, PBadge,
} from '@cloudforet/mirinae';
import type { ToolboxOptions } from '@cloudforet/mirinae/types/controls/toolbox/type';
import type { DataTableField } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';

import type { TaskCategoryModel } from '@/api-clients/opsflow/task-category/schema/model';
import type { TaskTypeModel } from '@/api-clients/opsflow/task-type/schema/model';
import { useTaskApi } from '@/api-clients/opsflow/task/composables/use-task-api';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';
import { i18n } from '@/translations';

import { useUserReferenceStore } from '@/store/reference/user-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useTimezoneDate } from '@/common/composables/timezone-date';
import ProjectLinkButton from '@/common/modules/project/ProjectLinkButton.vue';

import BoardTaskFilters from '@/services/ops-flow/components/BoardTaskFilters.vue';
import BoardTaskNameField from '@/services/ops-flow/components/BoardTaskNameField.vue';
import { useCategoriesQuery } from '@/services/ops-flow/composables/use-categories-query';
import { useTaskTypesQuery } from '@/services/ops-flow/composables/use-task-types-query';
import {
    useTaskManagementTemplateStore,
} from '@/services/ops-flow/task-management-templates/stores/use-task-management-template-store';
import type { TaskFilters } from '@/services/ops-flow/types/task-filters-type';


const props = defineProps<{
    categoryId?: string;
    relatedAssets?: string[];
    tag?: string;
}>();

const userReferenceStore = useUserReferenceStore();
const taskManagementTemplateStore = useTaskManagementTemplateStore();

/* toolbox */
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
const handleRefresh = () => {
    refetch();
    // refetch({ throwOnError: true, cancelRefetch: false });
};
const handleChange = (options: ToolboxOptions) => {
    if (options.searchText !== undefined) search.value = options.searchText;
    if (options.pageStart !== undefined) pagination.page = options.pageStart;
    if (options.pageLimit !== undefined) pagination.size = options.pageLimit;
    if (options.sortBy !== undefined) sort.key = options.sortBy;
    if (options.sortDesc !== undefined) sort.desc = options.sortDesc;
};

/* task api query filters */
const taskFilters = ref<ConsoleFilter[]>([]);
const _taskFilterHelper = new QueryHelper();
const handleUpdateFilters = (values: TaskFilters) => {
    _taskFilterHelper.setFilters([]);
    if (values.taskType.length) _taskFilterHelper.addFilter({ k: 'task_type_id', v: values.taskType, o: '=' });
    if (values.status.length) _taskFilterHelper.addFilter({ k: 'status_id', v: values.status, o: '=' });
    if (values.project.length) _taskFilterHelper.addFilter({ k: 'project_id', v: values.project, o: '=' });
    if (values.createdBy.length) _taskFilterHelper.addFilter({ k: 'created_by', v: values.createdBy, o: '=' });
    if (values.assignee.length) _taskFilterHelper.addFilter({ k: 'assignee', v: values.assignee, o: '=' });
    if (values.taskId.length) _taskFilterHelper.addFilter({ k: 'task_id', v: values.taskId, o: '=' });
    taskFilters.value = _taskFilterHelper.filters;
};
const _taskListQueryHelper = new ApiQueryHelper();
const taskListApiQuery = computed<Query>(() => {
    _taskListQueryHelper.setFilters(taskFilters.value)
        .setMultiSortV2([toRaw(sort)])
        .setPage(pagination.page, pagination.size);
    if (search.value) _taskListQueryHelper.addFilter({ v: search.value });
    if (props.categoryId) _taskListQueryHelper.addFilter({ k: 'category_id', v: props.categoryId, o: '=' });
    if (props.relatedAssets) _taskListQueryHelper.addFilter({ k: 'related_asset_id', v: props.relatedAssets, o: '=' });
    return _taskListQueryHelper.dataV2;
});

/* task categories */
const { categories, isLoading: isLoadingCategories } = useCategoriesQuery();
const categoriesById = computed<Record<string, TaskCategoryModel>>(() => {
    const map = {} as Record<string, TaskCategoryModel>;
    if (!categories.value) return map;
    categories.value.forEach((category) => {
        map[category.category_id] = category;
    });
    return map;
});

/* task types */
const { taskTypes, isLoading: isLoadingTaskTypes } = useTaskTypesQuery({
    params: computed(() => ({
        query: {
            filter: [{ k: 'category_id', v: categories.value?.map((c) => c.category_id) ?? [], o: 'in' }],
        },
    })),
    enabled: computed(() => !isLoadingCategories.value),
});
const taskTypesById = computed<Record<string, TaskTypeModel>>(() => {
    const map = {} as Record<string, TaskTypeModel>;
    if (!taskTypes.value) return map;
    taskTypes.value.forEach((taskType) => {
        map[taskType.task_type_id] = taskType;
    });
    return map;
});

/* tasks */
const { taskAPI } = useTaskApi();
const { key: taskListQueryKey, params: taskListQueryParams } = useServiceQueryKey('opsflow', 'task', 'list', {
    contextKey: props.categoryId ?? 'all',
    params: computed(() => ({
        query: taskListApiQuery.value,
    })),
});
const {
    data, error, refetch, isLoading,
} = useQuery({
    queryKey: taskListQueryKey.value,
    queryFn: async () => {
        const res = await taskAPI.list(taskListQueryParams.value);
        return {
            results: res.results ?? [],
            totalCount: res.total_count,
        };
    },
    enabled: computed(() => !isLoadingCategories.value && !isLoadingTaskTypes.value),
    refetchOnMount: true,
    // time control
    gcTime: 1000 * 60 * 2, // 2 minutes
    staleTime: 1000 * 30, // 30 seconds
});
const tasks = computed(() => data.value?.results);
watch(error, (err) => {
    if (err) ErrorHandler.handleError(err);
});
watch(data, (d) => {
    if (!d) return;
    pagination.total = d.totalCount || 0;
}, { immediate: true });


/* table fields */
const fields = computed<DataTableField[] >(() => [
    {
        name: 'task_id',
        label: i18n.t('OPSFLOW.FIELD_ID', { field: taskManagementTemplateStore.templates.task }) as string,
    },
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

</script>

<template>
    <component :is="props.tag ? props.tag : PPaneLayout"
               class="pt-6"
    >
        <div class="px-4 pb-4">
            <p-toolbox class="mb-2"
                       :search-text="search"
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
                      :loading="isLoading"
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
                <p-badge :key="item.status_id"
                         class="ml-2"
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
