<script setup lang="ts">
import {
    makeDistinctValueHandler,
    makeReferenceValueHandler,
} from '@cloudforet/core-lib/component-util/query-search';
import type { KeyItemSet, ValueHandlerMap } from '@cloudforet/core-lib/component-util/query-search/type';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import {
    PToolbox, PSelectStatus, PButton, PSelectDropdown, PDivider,
} from '@spaceone/design-system';
import type { SelectDropdownMenu } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';
import type { ToolboxOptions } from '@spaceone/design-system/types/navigation/toolbox/type';
import dayjs from 'dayjs';
import {
    computed, defineEmits, defineProps, reactive, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import type { ProjectReferenceMap } from '@/store/modules/reference/project/type';
import type { ProjectGroupReferenceMap } from '@/store/modules/reference/project-group/type';
import type { ServiceAccountReferenceMap } from '@/store/modules/reference/service-account/type';

import { useQueryTags } from '@/common/composables/query-tags';

import BudgetToolboxUsageRange
    from '@/services/cost-explorer/budget/budget-main/modules/budget-toolbox/BudgetToolboxUsageRange.vue';
import type { BudgetUsageAnalyzeRequestParam, BudgetUsageRange } from '@/services/cost-explorer/budget/type';
import type { Period } from '@/services/cost-explorer/type';

export interface Pagination {
    pageStart: number;
    pageLimit: number;
}

type I18nSelectDropdownMenu = SelectDropdownMenu | {
    label: string | TranslateResult;
};

type Sort = BudgetUsageAnalyzeRequestParam['sort'];

interface Props {
    filters: ConsoleFilter[];
    totalCount: number;
}

const store = useStore();
const { t } = useI18n();

const props = withDefaults(defineProps<Props>(), {
    filters: () => [],
    totalCount: 0,
});
const emit = defineEmits<{(e: 'update-filters', filters:ConsoleFilter[]): void;
    (e: 'update-range', range: BudgetUsageRange): void;
    (e: 'update-pagination', pagination: Pagination): void;
    (e: 'update-period', period: Period): void;
    (e: 'update-sort', sort: Sort): void;
    (e: 'refresh'): void;
    (e: 'export'): void;
}>();

const pageSizeOptions = [12, 24, 36];

const storeState = reactive({
    projects: computed<ProjectReferenceMap>(() => store.getters['reference/projectItems']),
    projectGroups: computed<ProjectGroupReferenceMap>(() => store.getters['reference/projectGroupItems']),
    serviceAccounts: computed<ServiceAccountReferenceMap>(() => store.getters['reference/serviceAccountItems']),
});

const handlerState = reactive({
    keyItemSets: computed<KeyItemSet[]>(() => [{
        title: 'Properties',
        items: [
            { name: 'budget_id', label: 'Budget ID' },
            { name: 'name', label: 'Name' },
            { name: 'project_id', label: 'Project', valueSet: storeState.projects },
            { name: 'project_group_id', label: 'Project Group', valueSet: storeState.projectGroups },
            { name: 'time_unit', label: 'Time Unit' },
            { name: 'cost_types.provider', label: '[Cost Type] Provider' },
            { name: 'cost_types.service_account_id', label: '[Cost Type] Service Account', valueSet: storeState.serviceAccounts },
            { name: 'cost_types.region_code', label: '[Cost Type] Region' },
            { name: 'cost_types.product', label: '[Cost Type] Product' },
        ],
    }]),
    valueHandlerMap: {
        budget_id: makeDistinctValueHandler('cost_analysis.Budget', 'budget_id'),
        name: makeDistinctValueHandler('cost_analysis.Budget', 'name'),
        project_id: makeReferenceValueHandler('identity.Project'),
        project_group_id: makeReferenceValueHandler('identity.ProjectGroup'),
        time_unit: makeDistinctValueHandler('cost_analysis.Budget', 'time_unit'),
        'cost_types.provider': makeReferenceValueHandler('identity.Provider'),
        'cost_types.service_account_id': makeReferenceValueHandler('identity.ServiceAccount'),
        'cost_types.region_code': makeReferenceValueHandler('inventory.Region'),
        'cost_types.product': makeDistinctValueHandler('cost_analysis.Budget', 'cost_types.product'),
    } as ValueHandlerMap,
});

const queryTagsHelper = useQueryTags({
    referenceStore: {},
    keyItemSets: handlerState.keyItemSets,
});

const state = reactive({
    selectedPeriod: ['total'] as string[],
    periodList: computed(() => [
        { name: 'total', label: t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.TOTAL') },
        { name: 'thisMonth', label: t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.THIS_MONTH') },
    ]),
    pageStart: 1,
    pageLimit: 24,
    // query
    range: {} as BudgetUsageRange,
    pagination: computed<Pagination>(() => ({
        pageStart: state.pageStart,
        pageLimit: state.pageLimit,
    })),
    period: computed<Period>(() => {
        const period: Period = {};

        if (state.selectedPeriod[0] === 'thisMonth') {
            period.start = dayjs.utc().format('YYYY-MM');
            period.end = dayjs.utc().format('YYYY-MM-DD');
        }

        return period;
    }),
    sortKeyList: computed<I18nSelectDropdownMenu[]>(() => ([
        { label: t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.USAGE', { symbol: '%' }), name: 'usage' },
        { label: t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.AMOUNT_USED', { symbol: '$' }), name: 'cost' },
        { label: t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.BUDGET_NAME'), name: 'name' },
    ])),
    sortDesc: true,
    selectedSortKey: 'usage',
    sort: computed<Sort>(() => ({
        key: state.selectedSortKey,
        desc: state.sortDesc,
    })),
    queryTags: computed(() => queryTagsHelper.queryTags.value),
});

/* Handlers */
const handleUpdateUsageRange = (range: BudgetUsageRange) => {
    state.range = range;
};

const handleSelectStatus = (selected: string[]) => {
    state.selectedPeriod = selected;
};

const handleChangeToolbox = async (options: ToolboxOptions) => {
    if (options.queryTags !== undefined) queryTagsHelper.setQueryTags(options.queryTags);
    if (options.pageLimit !== undefined) state.pageLimit = options.pageLimit;
    if (options.pageStart !== undefined) state.pageStart = options.pageStart;
};

const handleSortType = () => {
    state.sortDesc = !state.sortDesc;
};

/* Watchers */
watch(() => state.range, (range) => {
    emit('update-range', range);
});
watch(() => state.pagination, (pagination) => {
    emit('update-pagination', pagination);
});
watch(() => state.period, (period) => {
    emit('update-period', period);
});
watch(queryTagsHelper.filters, (filters) => {
    emit('update-filters', filters);
});
watch(() => props.filters, (filters) => {
    if (filters !== queryTagsHelper.filters.value) {
        queryTagsHelper.setFilters(filters);
    }
});
watch(() => state.sort, (sort) => { emit('update-sort', sort); });

(async () => {
    // LOAD REFERENCE STORE
    await Promise.allSettled([
        store.dispatch('reference/project/load'),
        store.dispatch('reference/projectGroup/load'),
        store.dispatch('reference/serviceAccount/load'),
    ]);
})();

</script>

<template>
    <div class="budget-toolbox">
        <div class="top">
            <budget-toolbox-usage-range @update="handleUpdateUsageRange" />
            <p-divider :vertical="true" />
            <div class="period-box">
                <span class="label">{{ t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.PERIOD') }}</span>
                <p-select-status v-for="(status, idx) in state.periodList"
                                 :key="idx"
                                 :selected="state.selectedPeriod"
                                 :value="status.name"
                                 :multi-selectable="false"
                                 @change="handleSelectStatus"
                >
                    {{ status.label }}
                </p-select-status>
                <p-divider :vertical="true" />
            </div>
        </div>
        <p-toolbox search-type="query"
                   searchable
                   exportable
                   :setting-visible="false"
                   filters-visible
                   :page-size-options="pageSizeOptions"
                   :page-size="state.pageLimit"
                   :total-count="props.totalCount"
                   :query-tags="state.queryTags"
                   :key-item-sets="handlerState.keyItemSets"
                   :value-handler-map="handlerState.valueHandlerMap"
                   @change="handleChangeToolbox"
                   @refresh="emit('refresh')"
                   @export="emit('export')"
        >
            <template #left-area>
                <div class="left-area">
                    <p-select-dropdown
                        v-model:selected="state.selectedSortKey"
                        :items="state.sortKeyList"
                    />
                    <p-button class="sort-box"
                              style-type="tertiary"
                              :icon-left="state.sort.desc ? 'ic_arrow-down-bold' : 'ic_arrow-up-bold'"
                              @click="handleSortType"
                    >
                        <span>{{ state.sort.desc ? t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.DESC') : t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.ASC') }}</span>
                    </p-button>
                </div>
            </template>
        </p-toolbox>
    </div>
</template>

<style scoped lang="postcss">
.budget-toolbox {
    @apply flex flex-wrap flex-col gap-4;
    padding-top: 1.5rem;
    .top {
        @apply flex items-center;
        .p-divider {
            &.vertical {
                height: 1rem;
            }
        }
        .period-box {
            @apply relative inline-flex gap-4 items-center pl-4;
            height: 1.25rem;
            font-size: 0.875rem;

            .label {
                @apply text-gray-500;
                font-size: 0.875rem;
            }
        }
    }

    @screen mobile {
        .top {
            @apply flex flex-wrap gap-4;
            .period-box {
                @apply pl-0;

                &::before {
                    display: none;
                }
            }
        }
    }

    .left-area {
        @apply flex flex-wrap gap-4;
    }
}
</style>
