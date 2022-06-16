<template>
    <div>
        <p-panel-top :title="$t('INVENTORY.SERVER.MAIN.TAB_HISTORY')" :total-count="totalCount" use-total-count />
        <p-search-table :fields="fields"
                        :items="items"
                        :loading="loading"
                        :total-count="totalCount"
                        :sort-by.sync="options.sortBy"
                        :sort-desc.sync="options.sortDesc"
                        :selectable="false"
                        @change="onChange"
                        @export="onExport"
        >
            <template #col-labels-format="{value}">
                <p-text-list :items="value" delimiter=" ">
                    <p-badge v-slot="{value: d}">
                        {{ d }}
                    </p-badge>
                </p-text-list>
            </template>
            <template #col-job_id-format="{value}">
                <p-anchor v-if="value" :to="getJobLink(value)">
                    {{ value }}
                </p-anchor>
            </template>
            <template #col-updated_by-format="{value}">
                <p-anchor v-if="collectors[value]" :to="getCollectorLink(value)">
                    {{ collectors[value].label }}
                </p-anchor>
                <template v-else>
                    {{ value }}
                </template>
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

import { iso8601Formatter } from '@spaceone/console-core-lib';
import { QueryHelper } from '@spaceone/console-core-lib/query';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import {
    PTextList, PBadge, PPanelTop, PSearchTable, PAnchor,
} from '@spaceone/design-system';
import { Location } from 'vue-router';

import { store } from '@/store';

import { FILE_NAME_PREFIX } from '@/lib/excel-export';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';

export default {
    name: 'ServerHistory',
    components: {
        PPanelTop, PBadge, PTextList, PSearchTable, PAnchor,
    },
    props: {
        serverId: {
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
            // eslint-disable-next-line camelcase
            server_id: props.serverId,
            // eslint-disable-next-line camelcase
            key_path: 'collection_info.change_history',
            query: apiQuery.setSort(state.options.sortBy, state.options.sortDesc)
                .setPage(state.options.pageStart, state.options.pageLimit)
                .setFilters([{ v: state.options.searchText }])
                .data,
        });


        const api = SpaceConnector.client.inventory.server.getData;
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

        const collectorLinkQueryHelper = new QueryHelper();
        const getCollectorLink = (collectorId: string): Location => {
            collectorLinkQueryHelper.setFilters([{ k: 'collector_id', v: collectorId, o: '=' }]);
            return {
                name: ASSET_INVENTORY_ROUTE.COLLECTOR._NAME,
                query: {
                    filters: collectorLinkQueryHelper.rawQueryStrings,
                },
            };
        };

        const getJobLink = (jobId: string): Location => ({
            name: ASSET_INVENTORY_ROUTE.COLLECTOR.HISTORY.JOB._NAME,
            params: { jobId },
        });

        const onChange = async (options) => {
            state.options = { ...state.options, ...options };
            await listHistory();
        };

        const onExport = async () => {
            await store.dispatch('file/downloadExcel', {
                url: '/inventory/server/get-data',
                param: getParams(),
                fields: [
                    { name: 'Key', key: 'key' },
                    { name: 'Job ID', key: 'job_id' },
                    { name: 'Updated By', key: 'updated_by' },
                    { name: 'Updated', key: 'updated_at', type: 'datetime' },
                ],
                file_name_prefix: FILE_NAME_PREFIX.server,
            });
        };

        watch(() => props.serverId, (after, before) => {
            if (after !== before) listHistory();
        }, { immediate: true });

        return {
            ...toRefs(state),
            getCollectorLink,
            getJobLink,
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
