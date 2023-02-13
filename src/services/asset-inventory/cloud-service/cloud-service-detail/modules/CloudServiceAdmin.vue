<template>
    <div>
        <p-panel-top :title="$t('INVENTORY.CLOUD_SERVICE.ADMIN.MEMBER')"
                     :total-count="totalCount"
        />
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
                <p-badge v-for="(label, idx) in value"
                         :key="idx"
                         badge-type="subtle"
                         style-type="gray200"
                         class="mr-2"
                >
                    {{ label }}
                </p-badge>
            </template>
        </p-search-table>
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from 'vue';

import {
    PPanelTop, PBadge, PSearchTable,
} from '@spaceone/design-system';
import type { SearchTableListeners } from '@spaceone/design-system/types/data-display/tables/search-table/type';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { store } from '@/store';

import type { UserReferenceMap } from '@/store/modules/reference/user/type';

import { FILE_NAME_PREFIX } from '@/lib/excel-export';

import ErrorHandler from '@/common/composables/error/errorHandler';

export default {
    name: 'CloudServiceAdmin',
    components: {
        PPanelTop, PBadge, PSearchTable,
    },
    props: {
        cloudServiceProjectId: {
            type: String,
            default: undefined,
        },
    },
    setup(props) {
        const state = reactive({
            users: computed<UserReferenceMap>(() => store.getters['reference/userItems']),
            fields: [
                { label: 'User ID', name: 'user_id' },
                { label: 'User Name', name: 'resource_id' },
                { label: 'Role', name: 'role_info.name' },
                { label: 'Labels', name: 'labels' },
            ],
            items: [],
            loading: true,
            totalCount: 0,
            options: {
                sortBy: 'user_id',
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
            )
            .setFilters([
                { v: state.options.searchText },
            ])
            .data;

        const api = SpaceConnector.client.identity.project.member.list;
        const listAdmin = async () => {
            state.loading = true;

            try {
                const res = await api({
                    include_parent_member: true,
                    project_id: props.cloudServiceProjectId,
                    query: getQuery(),
                });
                state.items = res.results.map((d) => ({
                    ...d,
                    user_id: d.resource_id,
                }));
                state.totalCount = res.total_count;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.items = [];
            } finally {
                state.loading = false;
            }
        };

        const onChange: SearchTableListeners['change'] = async (options) => {
            state.options = { ...state.options, ...options };
            await listAdmin();
        };

        const onExport = async () => {
            await store.dispatch('file/downloadExcel', {
                url: '/inventory/cloud-service/member/list',
                param: {
                    cloud_services: props.cloudServiceProjectId,
                    query: getQuery(),
                },
                fields: [
                    { name: 'User ID', key: 'user_info.user_id' },
                    { name: 'Name', key: 'user_info.name' },
                    { name: 'Email', key: 'user_info.email' },
                    { name: 'Labels', key: 'labels' },
                ],
                file_name_prefix: FILE_NAME_PREFIX.cloudService,
            });
        };

        watch(() => props.cloudServiceProjectId, (after, before) => {
            if (!after) {
                state.items = [];
            } else if (after !== before) listAdmin();
        }, { immediate: true });

        // LOAD REFERENCE STORE
        (async () => {
            await store.dispatch('reference/user/load');
        })();

        return {
            ...toRefs(state),
            onChange,
            onExport,
        };
    },
};
</script>

<style lang="postcss" scoped>
/* custom design-system component - p-search-table */
:deep(.p-search-table) {
    border-width: 0;
}
</style>
