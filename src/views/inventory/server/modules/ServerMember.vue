<template>
    <div>
        <p-panel-top :title="$t('INVENTORY.SERVER.MAIN.TAB_MEMBER')" :total-count="totalCount" use-total-count />
        <p-search-table :fields="fields"
                        :items="items"
                        :loading="loading"
                        :total-count="totalCount"
                        :selectable="false"
                        :excel-visible="false"
                        @change="onChange"
        >
            <template #col-resource_id-format="{ value }">
                {{ users[value].name }}
            </template>
            <template #col-labels-format="{value}">
                <p v-if="value.length === 0" />
                <p-badge v-for="(label, idx) in value" :key="idx" style-type="gray200"
                         class="mr-2"
                >
                    {{ label }}
                </p-badge>
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
    PSearchTable, PTextList, PBadge, PPanelTop,
} from '@spaceone/design-system';
import { Options, SearchTableListeners } from '@spaceone/design-system/dist/src/data-display/tables/search-table/type';

import { SpaceConnector } from '@/lib/space-connector';
import { ApiQueryHelper } from '@/lib/space-connector/helper';
import { getPageStart } from '@/lib/component-utils/pagination';
import config from '@/lib/config';
import { store } from '@/store';

export default {
    name: 'ServerMember',
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
            users: computed(() => store.state.resource.user.items),
            fields: [
                { label: 'User ID', name: 'user_id' },
                { label: 'User Name', name: 'resource_id' },
                { label: 'Role', name: 'role_info.name' },
                { label: 'Labels', name: 'labels' },
            ],
            items: [],
            loading: true,
            totalCount: 0,
            options: {} as Options,
        });

        const apiQuery = new ApiQueryHelper();
        const getQuery = () => apiQuery.setSort(state.options.sortBy, state.options.sortDesc)
            .setPage(
                getPageStart(state.options.thisPage, state.options.pageSize),
                state.options.pageSize,
            )
            .setFilters([{ v: state.options.searchText }])
            .data;

        const api = SpaceConnector.client.inventory.server.member.list;
        const listAdmin = async () => {
            state.loading = true;

            try {
                const res = await api({
                    servers: props.serverIds,
                    query: getQuery(),
                });
                state.items = res.results.map(d => ({
                    ...d,
                    user_id: d.resource_id,
                }));
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
                        url: '/inventory/server/member/list',
                        param: {
                            servers: props.serverIds,
                            query: getQuery(),
                        },
                    },
                    template: {
                        options: {
                            fileType: 'xlsx',
                            timezone: store.state.user.timezone,
                        },
                        data_source: [
                            { name: 'User ID', key: 'user_info.user_id' },
                            { name: 'Name', key: 'user_info.name' },
                            { name: 'Email', key: 'user_info.email' },
                            {
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
        }, { immediate: true });

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
