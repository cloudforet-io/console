<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PToolboxTable, PHorizontalLayout, PLazyImg } from '@spaceone/design-system';
import dayjs from 'dayjs';

import { getApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { DataSourceModel } from '@/schema/monitoring/data-source/model';
import { store } from '@/store';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

import { useProxyValue } from '@/common/composables/proxy-state';


interface Props {
    dataSourceList?: DataSourceModel[];
    selectedIndices?: number[];
}

const props = withDefaults(defineProps<Props>(), {
    dataSourceList: undefined,
    selectedIndices: undefined,
});

const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;

const emit = defineEmits<{(e: 'update:selected-indices'): void}>();

const storeState = reactive({
    timezone: computed(() => store.state.user.timezone),
    provider: computed(() => allReferenceGetters.provider),
});
const state = reactive({
    loading: false,
    selectedIndices: useProxyValue('selectedIndices', props, emit),
});
const tableState = reactive({
    pageStart: 0,
    pageLimit: 15,
    searchFilters: [] as ConsoleFilter[],
    fields: computed(() => [
        { name: 'name', label: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.COL_NAME'), type: 'item' },
        { name: 'data_source_id', label: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.COL_BILLING'), type: 'item' },
        { name: 'data_source_account_count', label: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.COL_LINK'), type: 'item' },
        { name: 'connected_workspace_count', label: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.COL_WORKSPACE'), type: 'item' },
        { name: 'created_at', label: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.COL_TIME'), type: 'item' },
    ]),
});

const getDataSourceIcon = (provider: string) => {
    const icon = storeState.provider[provider].icon;
    return assetUrlConverter(icon);
};

const userListApiQueryHelper = new ApiQueryHelper()
    .setPageStart(tableState.pageStart).setPageLimit(tableState.pageLimit)
    .setSort('name', true);
let userListApiQuery = userListApiQueryHelper.data;
const handleChange = (options: any = {}) => {
    userListApiQuery = getApiQueryWithToolboxOptions(userListApiQueryHelper, options) ?? userListApiQuery;
    if (options.queryTags !== undefined) {
        tableState.searchFilters = userListApiQueryHelper.filters;
    }
    if (options.pageStart !== undefined) tableState.pageStart = options.pageStart;
    if (options.pageLimit !== undefined) tableState.pageLimit = options.pageLimit;
};
</script>

<template>
    <p-horizontal-layout class="data-source-table">
        <template #container="{ height }">
            <p-toolbox-table class="table"
                             search-type="query"
                             searchable
                             selectable
                             sort-by="name"
                             :multi-select="false"
                             :select-index.sync="state.selectedIndices"
                             :fields="tableState.fields"
                             :items="props.dataSourceList"
                             :loading="state.loading"
                             :style="{height: `${height}px`}"
                             @change="handleChange"
                             @refresh="handleChange()"
            >
                <template #col-name-format="{value, item}">
                    <div class="col-name">
                        <p-lazy-img class="left-icon"
                                    :src="getDataSourceIcon(item.provider)"
                                    width="1.5rem"
                                    height="1.5rem"
                        />
                        <span>{{ value }}</span>
                    </div>
                </template>
                <template #col-data_source_account_count-format="{value}">
                    <span>{{ value || 0 }}</span>
                </template>
                <template #col-connected_workspace_count-format="{value}">
                    <span>{{ value || 0 }}</span>
                </template>
                <template #col-created_at-format="{value}">
                    <span>{{ dayjs(value).tz(storeState.timezone).format('YYYY-MM-DD HH:mm:ss') }}</span>
                </template>
            </p-toolbox-table>
        </template>
    </p-horizontal-layout>
</template>

<style lang="postcss" scoped>
.data-source-table {
    @apply bg-white border border-gray-200;
    border-radius: 0.375rem;
    .table {
        border: none;
        border-radius: 0.375rem;
        .col-name {
            @apply flex items-center;
            gap: 0.5rem;
        }
    }
}
</style>
