<template>
    <div>
        <p-panel-top title="Members" :total-count="totalCount" />
        <p-search-table :fields="fields"
                        :items="items"
                        :loading="loading"
                        :total-count="totalCount"
                        :selectable="false"
                        @init="onChange"
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
        </p-search-table>
    </div>
</template>

<script lang="ts">
import PSearchTable from '@/components/organisms/tables/search-table/PSearchTable.vue';
import { reactive, toRefs, watch } from '@vue/composition-api';
import { Options, SearchTableListeners } from '@/components/organisms/tables/search-table/type';
import { QueryHelper, SpaceConnector } from '@/lib/space-connector';
import { getPageStart } from '@/lib/component-utils/pagination';
import PTextList from '@/components/molecules/lists/text-list/PTextList.vue';
import PBadge from '@/components/atoms/badges/PBadge.vue';
import PPanelTop from '@/components/molecules/panel/panel-top/PPanelTop.vue';
import config from '@/lib/config';
import { getTimezone } from '@/lib/util';

export default {
    name: 'ServerAdmin',
    components: {
        PPanelTop, PBadge, PTextList, PSearchTable,
    },
    props: {
        serverIds: {
            type: Array,
            default: () => [],
        },
    },
    setup(props) {
        const state = reactive({
            fields: [
                { label: 'User ID', name: 'user_info.user_id' },
                { label: 'Name', name: 'user_info.name' },
                { label: 'Email', name: 'user_info.email' },
                { label: 'Labels', name: 'labels' },
            ],
            items: [],
            loading: true,
            totalCount: 0,
            options: {} as Options,
        });

        const getQuery = () => new QueryHelper()
            .setSort(state.options.sortBy, state.options.sortDesc)
            .setPage(
                getPageStart(state.options.thisPage, state.options.pageSize),
                state.options.pageSize,
            )
            .setKeyword(state.options.searchText)
            .data;

        const api = SpaceConnector.client.inventory.server.member.list;
        const listAdmin = async () => {
            state.loading = true;

            try {
                const res = await api({
                    servers: props.serverIds,
                    query: getQuery(),
                });

                state.items = res.results;
                state.totalCount = res.total_count;
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        const onChange: SearchTableListeners['change'] = async (options) => {
            state.options = options;
            await listAdmin();
        };

        const exportApi = SpaceConnector.client.addOns.excel.export;
        const onExport = async () => {
            try {
                const res = await exportApi({
                    source: {
                        url: '/inventory/server/list',
                        param: { query: getQuery() },
                    },
                    template: {
                        options: {
                            fileType: 'xlsx',
                            timezone: getTimezone(),
                        },
                        // eslint-disable-next-line camelcase
                        data_source: [
                            { name: 'User ID', key: 'user_info.user_id' },
                            { name: 'Name', key: 'user_info.name' },
                            { name: 'Email', key: 'user_info.email' },
                            {
                                // eslint-disable-next-line camelcase
                                name: 'Labels', key: 'labels', type: 'list', options: { item: { view_type: 'badge' } },
                            },
                        ],
                    },
                });
                window.open(config.get('VUE_APP_API.ENDPOINT') + res.file_link);
            } catch (e) {
                console.error(e);
            }
        };

        watch(() => props.serverIds, (after, before) => {
            if (after !== before) listAdmin();
        });

        return {
            ...toRefs(state),
            onChange,
            onExport,
        };
    },
};
</script>

<style lang="postcss" scoped>
>>> .p-search-table {
    border-width: 0;
}
</style>
