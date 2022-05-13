<template>
    <section class="policy-list-data-table">
        <p-toolbox-table
            exportable
            :sortable="false"
            searchable
            search-type="query"
            :loading="loading"
            :fields="fields"
            :items="items"
            :key-item-sets="policySearchHandler.keyItemSets"
            :value-handler-map="policySearchHandler.valueHandlerMap"
            :selectable="selectable"
            :select-index.sync="selectedIndices"
            :pagination-visible="false"
            :page-size-changeable="false"
            @change="handleChange"
            @refresh="handleChange()"
            @export="handleExport"
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
                        @change="handleChangePolicyType"
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
import { POLICY_TYPES } from '@/services/administration/iam/policy/lib/config';
import {
    makeCustomValueHandler,
    policyTypeBadgeColorFormatter,
    policyTypeURIFormatter,
} from '@/services/administration/iam/policy/lib/helper';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import { ToolboxOptions } from '@spaceone/console-core-lib/component-util/toolbox/type';
import { setApiQueryWithToolboxOptions } from '@spaceone/console-core-lib/component-util/toolbox';
import { store } from '@/store';
import { FILE_NAME_PREFIX } from '@/lib/excel-export';

import { iso8601Formatter } from '@spaceone/console-core-lib';
import { ADMINISTRATION_ROUTE } from '@/services/administration/route-config';
import { administrationStore } from '@/services/administration/store';
import { KeyItemSet } from '@spaceone/design-system/dist/src/inputs/search/query-search/type';

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
        const policyListApiQueryHelper = new ApiQueryHelper().setSort('name', true);
        const state = reactive({
            loading: computed(() => administrationStore.state.policy.policyListLoading),
            policyList: computed(() => administrationStore.state.policy.policyList),
            policyTypeList: [
                { name: POLICY_TYPES.MANAGED, label: 'Managed' },
                { name: POLICY_TYPES.CUSTOM, label: 'Custom' },
            ],
            selectedType: POLICY_TYPES.MANAGED,
            fields: [
                { name: 'name', label: 'Name' },
                { name: 'type', label: 'Type' },
                { name: 'policy_id', label: 'ID', sortable: false },
                { name: 'tags.description', label: 'Description', sortable: false },
                { name: 'created_at', label: 'Created' },
            ],
            items: computed(() => {
                if (!state.policyList) return [];
                const filteredPolicyListByType = state.policyList.filter(d => d.policy_type === state.selectedType);
                return filteredPolicyListByType.map(d => ({
                    ...d,
                    type: d?.policy_type ?? POLICY_TYPES.MANAGED,
                    created_at: d?.policy_type === POLICY_TYPES.MANAGED
                        ? '--'
                        : iso8601Formatter(d.created_at.toString(), state.timezone, 'YYYY-MM-DD hh:mm:ss'),
                }));
            }),
            selectedIndices: [] as number[],
            timezone: computed(() => store.state.user.timezone),
            totalCount: computed(() => administrationStore.state.policy.totalCount),
        });
        const policySearchHandler = reactive({
            keyItemSets: [{
                title: 'Properties',
                items: [
                    { name: 'name', label: 'Name' },
                    { name: 'policy_id', label: 'ID' },
                    { name: 'tags', label: 'Description' },
                    { name: 'created_at', label: 'Created', dataType: 'datetime' },
                ],
            }] as KeyItemSet[],
            valueHandlerMap: computed(() => ({
                name: makeCustomValueHandler(state.policyList, 'name'),
                policy_id: makeCustomValueHandler(state.policyList, 'policy_id'),
                created_at: makeCustomValueHandler(state.policyList, 'created_at', 'datetime'),
            })),
        });

        const listPolicies = async () => {
            await administrationStore.dispatch('policy/fetchPolicyList', policyListApiQueryHelper.data);
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

        const handleChangePolicyType = () => {
            state.selectedIndices = [];
        };

        watch(() => state.totalCount as number, (value: number) => {
            emit('update-total-count', value);
        });

        watch(() => state.selectedIndices, (indices: number[]) => {
            emit('update-selected-policy-id', indices.map(idx => state.items[idx]?.policy_id));
        });

        (async () => {
            await listPolicies();
        })();

        return {
            ...toRefs(state),
            policySearchHandler,
            ADMINISTRATION_ROUTE,
            policyTypeBadgeColorFormatter,
            handleChange,
            handleExport,
            handleChangePolicyType,
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
