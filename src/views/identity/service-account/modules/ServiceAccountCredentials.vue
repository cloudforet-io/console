<template>
    <div>
        <p-panel-top title="Credentials" :use-total-count="true" :total-count="totalCount" />
        <p-search-table :fields="fields"
                        :items="items"
                        :loading="loading"
                        :total-count="totalCount"
                        :selectable="false"
                        :excel-visible="false"
                        :style="{height: '100%', border: 'none'}"
                        @init="onChange"
                        @change="onChange"
        >
            <template #col-created_at-format="{value}">
                {{ timestampFormatter(value) }}
            </template>
        </p-search-table>
    </div>
</template>

<script lang="ts">
import { reactive, toRefs, watch } from '@vue/composition-api';

import PPanelTop from '@/components/molecules/panel/panel-top/PPanelTop.vue';
import PSearchTable from '@/components/organisms/tables/search-table/PSearchTable.vue';
import { Options, SearchTableListeners } from '@/components/organisms/tables/search-table/type';

import { QueryHelper, SpaceConnector } from '@/lib/space-connector';
import { getPageStart } from '@/lib/component-utils/pagination';
import { timestampFormatter } from '@/lib/util';

export default {
    name: 'ServiceAccountCredentials',
    components: {
        PSearchTable,
        PPanelTop,
    },
    props: {
        serviceAccountId: {
            type: String,
            default: '',
        },
    },
    setup(props) {
        const state = reactive({
            fields: [
                { label: 'Secret', name: 'secret_id' },
                { label: 'Name', name: 'name' },
                { label: 'Schema', name: 'schema' },
                {
                    label: 'Created',
                    name: 'created_at',
                    type: 'datetime',
                    options: {
                        source_type: 'timestamp',
                        source_format: 'seconds',
                    },
                },
            ],
            items: [],
            loading: true,
            totalCount: 0,
            options: {} as Options,
        });

        const getQuery = () => new QueryHelper()
            .setFilter({
                k: 'service_account_id',
                v: props.serviceAccountId,
                o: 'eq',
            })
            .setSort(state.options.sortBy, state.options.sortDesc)
            .setPage(
                getPageStart(state.options.thisPage, state.options.pageSize),
                state.options.pageSize,
            )
            .setOnly('secret_id', 'name', 'schema', 'created_at')
            .setKeyword(state.options.searchText)
            .data;

        const api = SpaceConnector.client.secret.secret.list;

        const listCredentials = async () => {
            state.loading = true;
            try {
                const res = await api({ query: getQuery() });
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
            await listCredentials();
        };

        watch(() => props.serviceAccountId, (after, before) => {
            if (after !== before) listCredentials();
        }, { immediate: true });

        return {
            ...toRefs(state),
            timestampFormatter,
            onChange,
        };
    },
};
</script>

<style lang="postcss" scoped>

</style>
