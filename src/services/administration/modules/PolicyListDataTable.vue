<template>
    <section class="policy-list-data-table">
        <p-toolbox-table
            exportable
            sortable
            searchable
            search-type="query"
            sort-by:="name"
            :loading="loading"
            :sort-desc="true"
            :fields="fields"
            :items="items"
            :value-handler-map="valueHandlerMap"
            :key-item-sets="keyItemSets"
            @change="handleChange"
            @refresh="handleChange()"
            @export="handleExport"
        >
            <template #toolbox-top>
                <div class="filter">
                    <!--                    song-lang-->
                    <span class="filter-label">Type</span>
                    <p-select-status
                        v-for="(item, index) in policyTypeList"
                        :key="index"
                        v-model="selectedType"
                        :value="item.name"
                    >
                        {{ item.label }}
                    </p-select-status>
                </div>
            </template>

            <template #col-type-format="{ value }">
                <p-badge outline :style-type="policyTypeColorFormatter(value)">
                    {{ value }}
                </p-badge>
            </template>

            <template #col-policy_id-format="{ value, item }">
                <template v-if="value">
                    <p-anchor
                        :icon-visible="false"
                        highlight
                        :to="{
                            name: '#',
                            params: { id: '#' }
                        }"
                    >
                        {{ value }}
                    </p-anchor>
                </template>
            </template>
        </p-toolbox-table>
    </section>
</template>

<script lang="ts">
import {
    PToolboxTable, PSelectStatus, PAnchor, PBadge,
} from '@spaceone/design-system';
import {
    computed,
    reactive, toRefs, watch,
} from '@vue/composition-api';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { POLICY_TYPES } from '@/services/administration/iam/policy/lib/type';
import { policyTypeColorFormatter, policyTypeURIFormatter } from '@/services/administration/iam/policy/lib/helper';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import { ToolboxOptions } from '@spaceone/console-core-lib/component-util/toolbox/type';
import { setApiQueryWithToolboxOptions } from '@spaceone/console-core-lib/component-util/toolbox';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { store } from '@/store';
import { FILE_NAME_PREFIX } from '@/lib/excel-export';
import { policySearchHandlers } from '@/services/administration/iam/policy/lib/config';
import { iso8601Formatter } from '@spaceone/console-core-lib';

// FIXME:: This is DUMMY, should be removed
const DUMMY_REPO_ID = 'repo-d9e115714edc';

export default {
    name: 'PolicyListDataTable',
    components: {
        PToolboxTable,
        PSelectStatus,
        PAnchor,
        PBadge,
    },
    props: {
    },
    setup(props, { emit }) {
        const policyListApiQueryHelper = new ApiQueryHelper()
            .setPage(1, 15).setSort('name', true);

        const state = reactive({
            loading: false,
            policyTypeList: [
                { name: POLICY_TYPES.MANAGED, label: 'Managed' },
                { name: POLICY_TYPES.CUSTOM, label: 'Custom' },
            ],
            selectedType: POLICY_TYPES.MANAGED,
            fields: [
                { name: 'name', label: 'Name' },
                { name: 'type', label: 'Type' },
                { name: 'policy_id', label: 'ID', sortable: false },
                { name: 'tags', label: 'Description', sortable: false },
                { name: 'created_at', label: 'Created' },
            ],
            items: [],
            valueHandlerMap: computed(() => ({
                // FIXME:: Custom valueHandler here
                // name: makeDistinctValueHandler(`${policyTypeURIFormatter(state.selectedType)}.Policy`, 'name', undefined, undefined, undefined, { repository_id: DUMMY_REPO_ID }),
                // policy_id: makeDistinctValueHandler(`${policyTypeURIFormatter(state.selectedType)}.Policy`, 'policy_id'),
                // created_at: makeDistinctValueHandler(`${policyTypeURIFormatter(state.selectedType)}.Policy`, 'created_at', 'datetime'),
            })),
            keyItemSets: policySearchHandlers.keyItemSets,
            timezone: computed(() => store.state.user.timezone),
            totalCount: 0,
        });

        const listPolicies = async (type: POLICY_TYPES) => {
            state.loading = true;
            try {
                const res = type === POLICY_TYPES.MANAGED
                    ? await SpaceConnector.client.repository.policy.list({
                        repository_id: DUMMY_REPO_ID,
                        query: policyListApiQueryHelper.data,
                    })
                    : await SpaceConnector.client.identity.policy.list({
                        query: policyListApiQueryHelper.data,
                    });
                state.items = res.results.map(d => ({
                    ...d,
                    type,
                    created_at: type === POLICY_TYPES.MANAGED
                        ? '--'
                        : iso8601Formatter(d.created_at, state.timezone, 'YYYY-MM-DD hh:mm:ss'),
                }));
                state.totalCount = res.total_count;
            } catch (e: unknown) {
                ErrorHandler.handleError(e);
                state.items = [];
                state.totalCount = 0;
            } finally {
                state.loading = false;
            }
        };

        const handleChange = (options: ToolboxOptions = {}) => {
            setApiQueryWithToolboxOptions(policyListApiQueryHelper, options);
            listPolicies(state.selectedType);
        };

        const handleExport = async () => {
            await store.dispatch('file/downloadExcel', {
                url: `/${policyTypeURIFormatter(state.selectedType)}/policy/list`,
                param: {
                    include_parent_member: true,
                    repository_id: state.selectedType === POLICY_TYPES.MANAGED ? DUMMY_REPO_ID : '',
                    query: policyListApiQueryHelper.data,
                },
                fields: [
                    { name: 'Name', key: 'name' },
                    { name: 'Type', key: 'type' },
                    { name: 'ID', key: 'policy_id' },
                    { name: 'Description', key: 'tags' },
                    { name: 'Created', key: 'created_at' },
                ],
                file_name_prefix: FILE_NAME_PREFIX.policy,
            });
        };

        watch(() => state.selectedType, () => {
            listPolicies(state.selectedType);
        });

        watch(() => state.totalCount, (value: number) => {
            emit('update-total-count', value);
        });

        (async () => {
            await listPolicies(state.selectedType);
        })();

        return {
            ...toRefs(state),
            policyTypeColorFormatter,
            handleChange,
            handleExport,
        };
    },
};
</script>

<style lang="postcss" scoped>
.filter {
    @apply flex items-center;
    margin: 1.625rem 1rem -0.375rem;
    .filter-label {
        @apply text-gray-400;
        margin-right: 1rem;
        font-size: 0.875rem;
        line-height: 1.15;
    }
    .p-status {
        margin-right: 1rem;
    }
}
</style>
