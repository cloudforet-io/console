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
/* eslint-disable camelcase */
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PSearchTable, PTextList, PPanelTop, PBadge,
} from '@spaceone/design-system';
import { Options, SearchTableListeners } from '@spaceone/design-system/dist/src/data-display/tables/search-table/type';

import { getPageStart } from '@/lib/component-utils/pagination';
import { SpaceConnector } from '@/lib/space-connector';
import { ApiQueryHelper } from '@/lib/space-connector/helper';
import { iso8601Formatter } from '@/lib/util';
import { store } from '@/store';

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
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        const onChange = async (options = {}) => {
            state.options = { ...state.options, ...options };
            await listHistory();
        };

        const onExport = async () => {
            try {
                await store.dispatch('file/downloadExcel', {
                    url: '/inventory/cloud-service/get-data',
                    param: getParams(),
                    fields: [
                        { name: 'Key', key: 'key' },
                        { name: 'Job ID', key: 'job_id' },
                        { name: 'Updated By', key: 'updated_by' },
                        { name: 'Updated', key: 'updated_at', type: 'datetime' },
                    ],
                });
            } catch (e) {
                console.error(e);
            }
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
