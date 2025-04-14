<script setup lang="ts">
import {
    computed, defineProps, reactive, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import dayjs from 'dayjs';

import { getPageStart, getThisPage } from '@cloudforet/core-lib/component-util/pagination';
import {
    makeDistinctValueHandler,
    makeReferenceValueHandler,
} from '@cloudforet/core-lib/component-util/query-search';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import type { Sort } from '@cloudforet/core-lib/space-connector/type';
import {
    PToolbox, PSelectStatus, PButton, PSelectDropdown, PDivider, PTextPagination,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';
import type { KeyItemSet, ValueHandlerMap } from '@cloudforet/mirinae/types/controls/search/query-search/type';
import type { ToolboxOptions } from '@cloudforet/mirinae/types/controls/toolbox/type';

import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProjectGroupReferenceMap } from '@/store/reference/project-group-reference-store';
import type { ProjectReferenceMap } from '@/store/reference/project-reference-store';
import type { ServiceAccountReferenceMap } from '@/store/reference/service-account-reference-store';

import { useQueryTags } from '@/common/composables/query-tags';

import BudgetMainToolboxUsageRange
    from '@/services/cost-explorer/components/BudgetMainToolboxUsageRange.vue';
import type { Period } from '@/services/cost-explorer/types/cost-explorer-query-type';


type I18nSelectDropdownMenu = SelectDropdownMenuItem | {
    label: string | TranslateResult;
};

interface Props {
    filters: ConsoleFilter[];
    more?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    filters: () => [],
});
const emit = defineEmits<{(e: 'update-filters', filters:ConsoleFilter[]): void;
    (e: 'update-pagination', pageStart: number, pageLimit: number): void;
    (e: 'update-period', period: Period): void;
    (e: 'update-sort', sort: Sort): void;
    (e: 'refresh'): void;
    (e: 'export'): void;
}>();

const pageSizeOptions = [12, 24, 36];

const allReferenceStore = useAllReferenceStore();
const storeState = reactive({
    projects: computed<ProjectReferenceMap>(() => allReferenceStore.getters.project),
    projectGroups: computed<ProjectGroupReferenceMap>(() => allReferenceStore.getters.projectGroup),
    serviceAccounts: computed<ServiceAccountReferenceMap>(() => allReferenceStore.getters.serviceAccount),
});

const handlerState = reactive({
    keyItemSets: computed<KeyItemSet[]>(() => [{
        title: 'Properties',
        items: [
            { name: 'budget_id', label: 'Budget ID' },
            { name: 'name', label: 'Name' },
            { name: 'data_source_id', label: 'Data Source' },
            { name: 'project_id', label: 'Project', valueSet: storeState.projects },
            { name: 'project_group_id', label: 'Project Group', valueSet: storeState.projectGroups },
            { name: 'time_unit', label: 'Time Unit' },
        ],
    }]),
    valueHandlerMap: {
        budget_id: makeDistinctValueHandler('cost_analysis.Budget', 'budget_id'),
        name: makeDistinctValueHandler('cost_analysis.Budget', 'name'),
        data_source_id: makeReferenceValueHandler('cost_analysis.DataSource'),
        project_id: makeReferenceValueHandler('identity.Project'),
        project_group_id: makeReferenceValueHandler('identity.ProjectGroup'),
        time_unit: makeDistinctValueHandler('cost_analysis.Budget', 'time_unit'),
    } as ValueHandlerMap,
});

const queryTagsHelper = useQueryTags({
    referenceStore: {},
    keyItemSets: handlerState.keyItemSets,
});

const state = reactive({
    selectedPeriod: ['total'] as string[],
    periodList: computed(() => [
        { name: 'total', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.TOTAL') },
        { name: 'thisMonth', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.THIS_MONTH') },
    ]),
    pageStart: 1,
    pageLimit: 24,
    thisPage: computed(() => getThisPage(state.pageStart, state.pageLimit)),
    // query
    period: computed<Period>(() => {
        const period: Period = {};

        if (state.selectedPeriod[0] === 'thisMonth') {
            period.start = dayjs.utc().format('YYYY-MM');
            period.end = dayjs.utc().format('YYYY-MM');
        }

        return period;
    }),
    sortKeyList: computed<I18nSelectDropdownMenu[]>(() => ([
        { label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.USAGE', { symbol: '%' }), name: 'budget_usage' },
        { label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.AMOUNT_USED', { symbol: '$' }), name: 'total_spent' },
        { label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.BUDGET_NAME'), name: 'name' },
    ])),
    sortDesc: true,
    selectedSortKey: 'budget_usage',
    sort: computed<Sort>(() => ({
        key: state.selectedSortKey,
        desc: state.sortDesc,
    })),
    queryTags: computed(() => queryTagsHelper.queryTags.value),
});

/* Handlers */
const handleSelectStatus = (selected: string[]) => {
    state.selectedPeriod = selected;
};

const handleChangeToolbox = async (options: ToolboxOptions) => {
    if (options.queryTags !== undefined) queryTagsHelper.setQueryTags(options.queryTags);
    if (options.pageLimit !== undefined) {
        state.pageLimit = options.pageLimit;
        state.pageStart = 1;
    }
    if (options.pageStart !== undefined) state.pageStart = options.pageStart;
};

const handleSortType = () => {
    state.sortDesc = !state.sortDesc;
};

const handleUpdateThisPage = (thisPage: number) => {
    state.pageStart = getPageStart(thisPage, state.pageLimit);
};

/* Watchers */
watch([() => state.pageStart, () => state.pageLimit], ([pageStart, pageLimit]) => {
    emit('update-pagination', pageStart, pageLimit);
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
}, { immediate: true });
watch(() => state.sort, (sort) => { emit('update-sort', sort); });

</script>

<template>
    <div class="budget-main-toolbox">
        <div class="top">
            <budget-main-toolbox-usage-range readonly />
            <p-divider vertical />
            <div class="period-box">
                <span class="label">{{ $t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.PERIOD') }}</span>
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
                   :query-tags="state.queryTags"
                   :key-item-sets="handlerState.keyItemSets"
                   :value-handler-map="handlerState.valueHandlerMap"
                   @change="handleChangeToolbox"
                   @refresh="emit('refresh')"
                   @export="emit('export')"
        >
            <template #pagination-area>
                <p-text-pagination :this-page="state.thisPage"
                                   :has-next-page="props.more"
                                   @update:thisPage="handleUpdateThisPage"
                />
            </template>
            <template #left-area>
                <div class="left-area">
                    <p-select-dropdown
                        class="sort-key-select-dropdown"
                        :menu="state.sortKeyList"
                        :selected.sync="state.selectedSortKey"
                    />
                    <p-button class="sort-box"
                              style-type="tertiary"
                              :icon-left="state.sort.desc ? 'ic_arrow-down-bold' : 'ic_arrow-up-bold'"
                              @click="handleSortType"
                    >
                        <span>{{ state.sort.desc ? $t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.DESC') : $t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.ASC') }}</span>
                    </p-button>
                </div>
            </template>
        </p-toolbox>
    </div>
</template>

<style scoped lang="postcss">
.budget-main-toolbox {
    @apply flex flex-wrap flex-col gap-4;
    padding-top: 1.5rem;
    .top {
        @apply flex items-center;
        .p-divider {
            &.vertical {
                height: 1rem;
            }
            margin-right: 1rem;
        }
        .period-box {
            @apply relative inline-flex gap-4 items-center;
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
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            .period-box {
                padding-left: 0;

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
