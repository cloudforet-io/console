<script lang="ts" setup>
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PHeading, PBadge, PToolboxTable,
} from '@spaceone/design-system';
import type { ToolboxTableOptions } from '@spaceone/design-system/src/data-display/tables/toolbox-table/type';
import {
    computed, reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import type { UserReferenceMap } from '@/store/modules/reference/user/type';


import ErrorHandler from '@/common/composables/error/errorHandler';


interface Props {
    cloudServiceProjectId: string;
}

const props = defineProps<Props>();
const store = useStore();
const { t } = useI18n();

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

const onChange = async (options: ToolboxTableOptions) => {
    state.options = { ...state.options, ...options };
    await listAdmin();
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

</script>

<template>
    <div>
        <p-heading heading-type="sub"
                   :title="t('INVENTORY.CLOUD_SERVICE.ADMIN.MEMBER')"
                   :total-count="state.totalCount"
        />
        <p-toolbox-table :fields="state.fields"
                         :items="state.items"
                         :loading="state.loading"
                         :total-count="state.totalCount"
                         sortable
                         @change="onChange"
        >
            <template #col-resource_id-format="{ value }">
                {{ state.users[value].name }}
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
        </p-toolbox-table>
    </div>
</template>

<style lang="postcss" scoped>
/* custom design-system component - p-search-table */
:deep(.p-search-table) {
    border-width: 0;
}
</style>
