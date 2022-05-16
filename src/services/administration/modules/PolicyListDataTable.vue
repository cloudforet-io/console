<template>
    <section class="policy-list-data-table">
        <p-toolbox-table
            :exportable="false"
            :sortable="false"
            searchable
            search-type="query"
            :loading="loading"
            :fields="fields"
            :items="items"
            :query-tags="queryTags"
            :key-item-sets="policySearchHandler.keyItemSets"
            :value-handler-map="policySearchHandler.valueHandlerMap"
            :selectable="selectable"
            :select-index.sync="selectedIndices"
            :pagination-visible="false"
            :page-size-changeable="false"
            @change="handleChange"
            @refresh="handleRefresh"
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
                            query: { type: item.policy_type }
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
import { filter } from 'lodash';
import {
    PAnchor, PBadge, PSelectStatus, PToolboxTable,
} from '@spaceone/design-system';
import {
    computed, PropType, reactive, toRefs, watch,
} from '@vue/composition-api';
import { PolicyTypes } from '@/services/administration/iam/policy/lib/config';
import {
    makeCustomValueHandler,
    policyTypeBadgeColorFormatter,
} from '@/services/administration/iam/policy/lib/helper';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import { ToolboxOptions } from '@spaceone/console-core-lib/component-util/toolbox/type';
import { setApiQueryWithToolboxOptions } from '@spaceone/console-core-lib/component-util/toolbox';
import { store } from '@/store';
import { iso8601Formatter } from '@spaceone/console-core-lib';
import { ADMINISTRATION_ROUTE } from '@/services/administration/route-config';
import { administrationStore } from '@/services/administration/store';
import { KeyItemSet } from '@spaceone/design-system/dist/src/inputs/search/query-search/type';
import { QueryTag } from '@spaceone/design-system/dist/src/inputs/search/query-search-tags/type';
import { PolicyDataModel } from '@/services/administration/iam/policy/lib/type';
import { PagePermission } from '@/lib/access-control/page-permission-helper';


const getFilteredItems = (queryTags: QueryTag[], policyList: PolicyDataModel[], selectedType: PolicyTypes): PolicyDataModel[] => {
    // 1. filter by type
    const _typeFilteredItems = filter(policyList, selectedType === PolicyTypes.ALL ? {} : { policy_type: selectedType });

    // 2. filter by query tags
    let _tagFilteredItems = [..._typeFilteredItems];
    queryTags.forEach((queryTag) => {
        _tagFilteredItems = filter(_tagFilteredItems, item => !!item[queryTag.key?.name].includes(queryTag.value.name));
    });

    return _tagFilteredItems;
};

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
        initialPolicyList: {
            type: Array as PropType<PagePermission[]>,
            default: () => [],
        },
    },
    setup(props, { emit }) {
        const policyListApiQueryHelper = new ApiQueryHelper();
        const state = reactive({
            loading: computed(() => administrationStore.state.policy.policyListLoading),
            policyList: computed(() => administrationStore.state.policy.policyList),
            policyTypeList: [
                { name: PolicyTypes.MANAGED, label: 'Managed' },
                { name: PolicyTypes.CUSTOM, label: 'Custom' },
                { name: PolicyTypes.ALL, label: 'All' },
            ],
            selectedType: PolicyTypes.MANAGED,
            fields: [
                { name: 'name', label: 'Name' },
                { name: 'type', label: 'Type' },
                { name: 'policy_id', label: 'ID', sortable: false },
                { name: 'tags.description', label: 'Description', sortable: false },
                { name: 'created_at', label: 'Created' },
            ],
            items: computed(() => {
                if (!state.policyList) return [];
                const _filteredPolicyList = getFilteredItems(state.queryTags, state.policyList, state.selectedType);
                return _filteredPolicyList.map(d => ({
                    ...d,
                    type: d?.policy_type ?? PolicyTypes.MANAGED,
                    created_at: d?.policy_type === PolicyTypes.MANAGED
                        ? '--'
                        : iso8601Formatter(d.created_at.toString(), state.timezone, 'YYYY-MM-DD hh:mm:ss'),
                }));
            }),
            selectedIndices: [] as number[],
            timezone: computed(() => store.state.user.timezone),
            totalCount: computed(() => administrationStore.state.policy.totalCount),
            queryTags: [] as QueryTag[],
        });
        const policySearchHandler = reactive({
            keyItemSets: [{
                title: 'Properties',
                items: [
                    { name: 'name', label: 'Name' },
                    { name: 'policy_id', label: 'ID' },
                ],
            }] as KeyItemSet[],
            valueHandlerMap: computed(() => ({
                name: makeCustomValueHandler(state.items, 'name'),
                policy_id: makeCustomValueHandler(state.items, 'policy_id'),
            })),
        });

        const listPolicies = async () => {
            await administrationStore.dispatch('policy/fetchPolicyList', policyListApiQueryHelper.data);
        };

        const handleChange = (options: ToolboxOptions = {}) => {
            setApiQueryWithToolboxOptions(policyListApiQueryHelper, options);
            if (options.queryTags !== undefined) {
                state.queryTags = options.queryTags;
            }
        };

        // const handleExport = async () => {
        //     await store.dispatch('file/downloadExcel', {
        //         url: `/${policyTypeURIFormatter(state.selectedType)}/policy/list`,
        //         param: {
        //             include_parent_member: true,
        //             repository_id: state.selectedType === PolicyTypes.MANAGED ? DUMMY_REPO_ID : '',
        //             query: policyListApiQueryHelper.data,
        //         },
        //         fields: [
        //             { name: 'Name', key: 'name' },
        //             { name: 'Type', key: 'type' },
        //             { name: 'ID', key: 'policy_id' },
        //             { name: 'Description', key: 'tags' },
        //             { name: 'Created', key: 'created_at' },
        //         ],
        //         file_name_prefix: FILE_NAME_PREFIX.policy,
        //     });
        // };

        const handleRefresh = () => {
            listPolicies();
        };

        const handleChangePolicyType = () => {
            state.selectedIndices = [];
            state.queryTags = [];
        };

        watch(() => state.selectedIndices, (indices: number[]) => {
            emit('update-selected-policy-list', indices.map(idx => ({
                policy_id: state.items[idx]?.policy_id,
                policy_type: state.items[idx]?.policy_type,
            })));
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
            handleRefresh,
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
