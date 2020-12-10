<template>
    <div>
        <p-panel-top :title="$t('IDENTITY.SERVICE_ACCOUNT.MAIN.TAB_MEMBER')" :use-total-count="true" :total-count="totalCount" />
        <p-search-table :fields="fields"
                        :items="items"
                        :loading="loading"
                        :total-count="totalCount"
                        :selectable="false"
                        :excel-visible="false"
                        :style="{height: '100%', border: 'none'}"
                        @init="onChange"
                        @change="onChange"
        />
    </div>
</template>

<script lang="ts">
import PPanelTop from '@/components/molecules/panel/panel-top/PPanelTop.vue';
import { reactive, toRefs, watch } from '@vue/composition-api';
import PSearchTable from '@/components/organisms/tables/search-table/PSearchTable.vue';
import { Options, SearchTableListeners } from '@/components/organisms/tables/search-table/type';
import { ApiQueryHelper, SpaceConnector } from '@/lib/space-connector';
import { getPageStart } from '@/lib/component-utils/pagination';

export default {
    name: 'ServiceAccountMember',
    components: {
        PSearchTable,
        PPanelTop,
    },
    props: {
        serviceAccounts: {
            type: Array,
            default: undefined,
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

        const apiQuery = new ApiQueryHelper();
        const getQuery = () => apiQuery.setSort(state.options.sortBy, state.options.sortDesc)
            .setPage(
                getPageStart(state.options.thisPage, state.options.pageSize),
                state.options.pageSize,
            )
            .setKeyword(state.options.searchText)
            .data;

        const api = SpaceConnector.client.identity.serviceAccount.member.list;

        const listMember = async () => {
            state.loading = true;
            try {
                const res = await api({
                    // eslint-disable-next-line camelcase
                    service_accounts: props.serviceAccounts,
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
            await listMember();
        };

        watch(() => props.serviceAccounts, (after, before) => {
            if (after !== before) listMember();
        }, { immediate: true });


        return {
            ...toRefs(state),
            onChange,
        };
    },
};
</script>

<style lang="postcss" scoped>

</style>
