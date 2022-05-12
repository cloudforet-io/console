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
            :selectable="selectable"
            :select-index.sync="selectedIndices"
            @change="handleChange"
            @refresh="handleChange()"
            @export="handleExport"
            @select="handleSelect"
        >
            <template #toolbox-top>
                <slot name="panel-top" />
                <div class="filter">
                    <span class="filter-label">{{ $t('IAM.POLICY.FORM.TYPE') }}</span>
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
                <p-badge outline :style-type="policyTypeBadgeColorFormatter(value)">
                    {{ value }}
                </p-badge>
            </template>

            <template #col-policy_id-format="{ value, item }">
                <template v-if="value">
                    <p-anchor
                        :icon-visible="anchorIconVisible"
                        highlight
                        :to="{
                            name: ADMINISTRATION_ROUTE.IAM.POLICY.DETAIL._NAME,
                            params: { id: item.policy_id },
                            query: { type: selectedType }
                        }"
                    >
                        {{ value }}
                    </p-anchor>
                </template>
            </template>
            <template #toolbox-table-bottom>
                <slot name="toolbox-table-bottom" />
            </template>
        </p-toolbox-table>
    </section>
</template>

<script lang="ts">
import {
    PAnchor, PBadge, PSelectStatus, PToolboxTable,
} from '@spaceone/design-system';
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';
import { POLICY_TYPES, policySearchHandlers } from '@/services/administration/iam/policy/lib/config';
import { policyTypeBadgeColorFormatter, policyTypeURIFormatter } from '@/services/administration/iam/policy/lib/helper';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import { ToolboxOptions } from '@spaceone/console-core-lib/component-util/toolbox/type';
import { setApiQueryWithToolboxOptions } from '@spaceone/console-core-lib/component-util/toolbox';
import { store } from '@/store';
import { FILE_NAME_PREFIX } from '@/lib/excel-export';

import { iso8601Formatter } from '@spaceone/console-core-lib';
import { ADMINISTRATION_ROUTE } from '@/services/administration/route-config';
import { administrationStore } from '@/services/administration/store';

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
        selectable: {
            type: Boolean,
            default: false,
        },
        anchorIconVisible: {
            type: Boolean,
            default: true,
        },
    },
    setup(props, { emit }) {
        const policyListApiQueryHelper = new ApiQueryHelper()
            .setPage(1, 15).setSort('name', true);

        const state = reactive({
            loading: computed(() => administrationStore.state.policy.policyListLoading),
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
            items: computed(() => {
                const policyList = administrationStore.state.policy.policyList;
                return policyList?.map(d => ({
                    ...d,
                    type: d?.policy_type ?? POLICY_TYPES.MANAGED,
                    created_at: d?.policy_type === POLICY_TYPES.MANAGED
                        ? '--'
                        : iso8601Formatter(d.created_at.toString(), state.timezone, 'YYYY-MM-DD hh:mm:ss'),
                })) ?? [];
            }),
            valueHandlerMap: computed(() => ({
                // FIXME:: Custom valueHandler here
                // name: makeDistinctValueHandler(`${policyTypeURIFormatter(state.selectedType)}.Policy`, 'name', undefined, undefined, undefined, { repository_id: DUMMY_REPO_ID }),
                // policy_id: makeDistinctValueHandler(`${policyTypeURIFormatter(state.selectedType)}.Policy`, 'policy_id'),
                // created_at: makeDistinctValueHandler(`${policyTypeURIFormatter(state.selectedType)}.Policy`, 'created_at', 'datetime'),
            })),
            selectedIndices: [] as number[],
            keyItemSets: policySearchHandlers.keyItemSets,
            timezone: computed(() => store.state.user.timezone),
            totalCount: computed(() => administrationStore.state.policy.totalCount),
        });

        const listPolicies = () => {
            console.log('Filter policy lists');
        };

        const handleChange = (options: ToolboxOptions = {}) => {
            setApiQueryWithToolboxOptions(policyListApiQueryHelper, options);
            listPolicies();
        };

        const handleExport = async () => {
            await store.dispatch('file/downloadExcel', {
                url: `/${policyTypeURIFormatter(state.selectedType)}/policy/list`,
                param: {
                    include_parent_member: true,
                    repository_id: state.selectedType === POLICY_TYPES.MANAGED ? DUMMY_REPO_ID : '',
                    query: policyListApiQueryHelper.data,
                },
                // song-lang
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

        const handleSelect = (index) => { state.selectedIndices = index; };

        watch(() => state.selectedType, () => {
            listPolicies();
        });

        watch(() => state.totalCount as number, (value: number) => {
            emit('update-total-count', value);
        });

        watch(() => state.selectedIndices, (indices: number[]) => {
            emit('update-selected-policy-id', indices.map(idx => state.items[idx]?.policy_id));
        });

        (async () => {
            await administrationStore.dispatch('policy/fetchPolicyList', policyListApiQueryHelper.data);
            await listPolicies();
        })();

        return {
            ...toRefs(state),
            ADMINISTRATION_ROUTE,
            policyTypeBadgeColorFormatter,
            handleChange,
            handleExport,
            handleSelect,
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
