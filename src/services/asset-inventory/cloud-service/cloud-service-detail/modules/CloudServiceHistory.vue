<template>
    <div>
        <p-panel-top :title="$t('INVENTORY.CLOUD_SERVICE.HISTORY.HISTORY')" :total-count="totalCount" />
        <p-search-table :fields="fields"
                        :items="items"
                        :loading="loading"
                        :total-count="totalCount"
                        :sort-by.sync="options.sortBy"
                        :sort-desc.sync="options.sortDesc"
                        :page-size.sync="options.pageLimit"
                        :selectable="false"
                        @change="onChange"
                        @export="onExport"
        >
            <template #col-labels-format="{value}">
                <p-text-list :items="value" delimiter=" ">
                    <p-badge v-slot:default="{value: d}">
                        {{ d }}
                    </p-badge>
                </p-text-list>
            </template>
            <template #col-updated_at-format="{value}">
                {{ iso8601Formatter(value, timezone) }}
            </template>
        </p-search-table>
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PSearchTable, PTextList, PPanelTop, PBadge,
} from '@spaceone/design-system';

import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import { iso8601Formatter } from '@spaceone/console-core-lib';
import { store } from '@/store';
import { FILE_NAME_PREFIX } from '@/lib/excel-export';
import ErrorHandler from '@/common/composables/error/errorHandler';

export default {
    name: 'CloudServiceHistory',
    components: {
        PPanelTop, PBadge, PTextList, PSearchTable,
    },
    props: {
        cloudServiceId: {
            type: String,
            default: '',
            required: true,
        },
    },
    setup(props) {
        const state = reactive({
            timezone: computed(() => store.state.user.timezone),
            fields: [
                { label: 'Key', name: 'key' },
                { label: 'Job ID', name: 'job_id' },
                { label: 'Updated By', name: 'updated_by' },
                { label: 'Updated', name: 'updated_at' },
            ],
            items: [],
            loading: true,
            totalCount: 0,
            options: {
                sortBy: 'updated_at',
                sortDesc: true,
                pageStart: 1,
                pageLimit: 15,
                searchText: '',
            },
        });

        const apiQuery = new ApiQueryHelper();
        const getParams = () => ({
            cloud_service_id: props.cloudServiceId,
            key_path: 'collection_info.change_history',
            query: apiQuery.setSort(state.options.sortBy, state.options.sortDesc)
                .setPage(
                    state.options.pageStart,
                    state.options.pageLimit,
                )
                .setFilters([{ v: state.options.searchText }])
                .data,
        });


        const api = SpaceConnector.client.inventory.cloudService.getData;
        const listHistory = async () => {
            state.loading = true;

            try {
                const res = await api(getParams());

                state.items = res.results;
                state.totalCount = res.total_count;
            } catch (e) {
                ErrorHandler.handleError(e);
            } finally {
                state.loading = false;
            }
        };

        const onChange = async (options = {}) => {
            state.options = { ...state.options, ...options };
            await listHistory();
        };

        const onExport = async () => {
            await store.dispatch('file/downloadExcel', {
                url: '/inventory/cloud-service/get-data',
                param: getParams(),
                fields: [
                    { name: 'Key', key: 'key' },
                    { name: 'Job ID', key: 'job_id' },
                    { name: 'Updated By', key: 'updated_by' },
                    { name: 'Updated', key: 'updated_at', type: 'datetime' },
                ],
                file_name_prefix: FILE_NAME_PREFIX.cloudService,
            });
        };

        watch(() => props.cloudServiceId, (after, before) => {
            if (after !== before) listHistory();
        }, { immediate: false });

        /* Init */
        (async () => {
            await onChange();
        })();

        return {
            ...toRefs(state),
            onChange,
            onExport,
            iso8601Formatter,
        };
    },
};
</script>

<style lang="postcss" scoped>
>>> .p-search-table {
    border-width: 0;
}
</style>
