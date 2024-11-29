<script setup lang="ts">
import {
    reactive, ref, watch, toRaw,
} from 'vue';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import type { Query } from '@cloudforet/core-lib/space-connector/type';
import {
    PPaneLayout, PToolbox, PDataTable, PDivider,
} from '@cloudforet/mirinae';
import type { DataTableField } from '@cloudforet/mirinae/src/data-display/tables/data-table/type';
import type { ToolboxOptions } from '@cloudforet/mirinae/types/controls/toolbox/type';

import type { TaskModel } from '@/schema/opsflow/task/model';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useBoardPageStore } from '@/services/ops-flow/stores/board-page-store';
import { useTaskStore } from '@/services/ops-flow/stores/task-store';

const boardPageStore = useBoardPageStore();
const boardPageState = boardPageStore.state;
const taskStore = useTaskStore();

const loading = ref<boolean>(false);
const tasks = ref<TaskModel[]|undefined>(undefined);

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
    queryHelper.setFilters([
        { k: 'category_id', v: boardPageState.currentCategoryId, o: '=' },
        { v: search.value },
    ])
        .setMultiSortV2([toRaw(sort)])
        .setPage(pagination.page, pagination.size);

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
const fields: DataTableField[] = [
    {
        name: 'name',
        label: 'Title',
    },
    {
        name: 'description',
        label: 'Description',
    },
    {
        name: 'task_type_id',
        label: 'Topic',
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
        name: 'created_at',
        label: 'Created At',
    },
];
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
                      :items="[]"
        />
    </p-pane-layout>
</template>
