<template>
    <div>
        <p-panel-top :title="'Spot Group Member'" :use-total-count="true" :total-count="totalCount" />
        <p-search-table :fields="fields"
                        :items="items"
                        :loading="loading"
                        :total-count="totalCount"
                        :selectable="false"
                        :excel-visible="false"
                        :sort-by.sync="options.sortBy"
                        :sort-desc.sync="options.sortDesc"
                        :style="{height: '100%', border: 'none'}"
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
    ComponentRenderProxy,
    computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';

import {
    PSearchTable, PPanelTop, PBadge,
} from '@spaceone/design-system';
import { SearchTableListeners } from '@spaceone/design-system/dist/src/data-display/tables/search-table/type';

import { SpaceConnector } from '@/lib/space-connector';
import { ApiQueryHelper } from '@/lib/space-connector/helper';
import { store } from '@/store';

export default {
    name: 'SpotGroupDetailMember',
    components: {
        PBadge,
        PSearchTable,
        PPanelTop,
    },
    props: {
        spotGroupId: {
            type: String,
            default: '',
        },
    },
    setup(props) {
        const vm: ComponentRenderProxy = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            users: computed(() => store.state.resource.user.items),
            fields: [
                { label: 'User ID', name: 'user_id' },
                { label: 'User Name', name: 'resource_id' },
                { label: 'Role', name: 'role_info.name' },
                { label: 'Labels', name: 'labels' },
            ],
            items: [],
            loading: false,
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
        const getQuery = () => apiQuery.setSort(state.options.sortBy, state.options.sortDesc)
            .setPage(
                state.options.pageStart,
                state.options.pageLimit,
            ).setFilters([{ v: state.options.searchText }])
            .data;

        const api = SpaceConnector.client.spotAutomation.spotGroup.member.list;

        const listMember = async () => {
            state.loading = true;
            try {
                const res = await api({
                    spot_group_id: props.spotGroupId,
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
            state.options = { ...state.options, ...options };
            await listMember();
        };

        (async () => {
            await vm.$store.dispatch('resource/user/load');
            await listMember();
        })();


        return {
            ...toRefs(state),
            onChange,
        };
    },
};
</script>
