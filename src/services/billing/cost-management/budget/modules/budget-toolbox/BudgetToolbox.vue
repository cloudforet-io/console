<template>
    <div class="budget-toolbox">
        <div class="top">
            <div class="period-box">
                <span class="label">{{ $t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.PERIOD') }}</span>
                <p-select-status v-for="(status, idx) in periodList" :key="idx"
                                 :selected="selectedPeriod"
                                 :value="status.name"
                                 :multi-selectable="false"
                                 @change="handleSelectStatus"
                >
                    {{ status.label }}
                </p-select-status>
            </div>
        </div>
        <p-toolbox search-type="query"
                   searchable
                   exportable
                   :setting-visible="false"
                   filters-visible
                   :page-size-options="pageSizeOptions"
                   :page-size="24"
                   :query-tags="queryTags"
                   :key-item-sets="keyItemSets"
                   :value-handler-map="valueHandlerMap"
                   @change="handleChangeToolbox"
                   @refresh="$emit('refresh')"
                   @export="$emit('export')"
        />
    </div>
</template>

<script lang="ts">
import {
    computed,
    reactive, toRefs, watch,
} from '@vue/composition-api';

import { PToolbox, PSelectStatus } from '@spaceone/design-system';
import { ToolboxOptions } from '@spaceone/design-system/dist/src/navigation/toolbox/type';
import { QueryTag } from '@spaceone/design-system/dist/src/inputs/search/query-search-tags/type';

import {
    makeDistinctValueHandler,
    makeReferenceValueHandler,
} from '@spaceone/console-core-lib/component-util/query-search';
import { KeyItemSet, ValueHandlerMap } from '@spaceone/console-core-lib/component-util/query-search/type';

import { i18n } from '@/translations';
import dayjs from 'dayjs';

import { Period } from '@/services/billing/cost-management/type';
import { QueryHelper } from '@spaceone/console-core-lib/query';

export interface Pagination {
    pageStart: number;
    pageLimit: number;
}

export default {
    name: 'BudgetToolbox',
    components: {
        PToolbox,
        PSelectStatus,
    },
    props: {
        filters: {
            type: Array,
            default: () => [],
        },
    },
    setup(props, { emit }) {
        const pageSizeOptions = [12, 24, 36];

        const keyItemSets: KeyItemSet[] = [{
            title: 'Properties',
            items: [
                {
                    name: 'budget_id',
                    label: 'Budget ID',
                },
                {
                    name: 'name',
                    label: 'Name',
                },
                {
                    name: 'project_id',
                    label: 'Project',
                },
                {
                    name: 'project_group_id',
                    label: 'Project Group',
                },
                {
                    name: 'time_unit',
                    label: 'Time Unit',
                },
                {
                    name: 'cost_types',
                    label: 'Cost Types',
                    dataType: 'object',
                },
            ],
        }];

        const valueHandlerMap: ValueHandlerMap = {
            budget_id: makeDistinctValueHandler('cost_analysis.Budget', 'budget_id'),
            name: makeDistinctValueHandler('cost_analysis.Budget', 'name'),
            project_id: makeReferenceValueHandler('identity.Project'),
            project_group_id: makeReferenceValueHandler('identity.ProjectGroup'),
            time_unit: makeDistinctValueHandler('cost_analysis.Budget', 'time_unit'),
            cost_types: makeDistinctValueHandler('cost_analysis.Budget', 'cost_types', 'object'),
        };

        const filtersHelper = new QueryHelper();

        const state = reactive({
            selectedPeriod: [] as string[],
            periodList: computed(() => [
                { name: 'total', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.TOTAL') },
                { name: 'thisMonth', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.THIS_MONTH') },
            ]),
            pageStart: 1,
            pageLimit: 24,
            queryTags: filtersHelper.setFilters(props.filters).queryTags as QueryTag[],
            // query
            pagination: computed<Pagination>(() => ({
                pageStart: state.pageStart,
                pageLimit: state.pageLimit,
            })),
            period: computed<Period>(() => {
                const period: Period = {};

                if (state.selectedPeriod[0] === 'thisMonth') {
                    period.start = dayjs().startOf('month').format('YYYY-MM');
                }

                return period;
            }),
            _filters: computed(() => filtersHelper.setFiltersAsQueryTag(state.queryTags).filters),
        });

        /* Handlers */
        const handleSelectStatus = (selected: string[]) => {
            state.selectedPeriod = selected;
        };

        const handleChangeToolbox = async (options: ToolboxOptions) => {
            if (options.queryTags !== undefined) state.queryTags = options.queryTags;
            if (options.pageLimit !== undefined) state.pageLimit = options.pageLimit;
            if (options.pageStart !== undefined) state.pageStart = options.pageStart;
        };

        /* Watchers */
        watch(() => state.pagination, (pagination) => {
            emit('update-pagination', pagination);
        });
        watch(() => state.period, (period) => {
            emit('update-period', period);
        });
        watch(() => state._filters, (filters) => {
            emit('update-filters', filters);
        });
        watch(() => props.filters, (filters) => {
            if (filters !== state._filters) {
                state.queryTags = filtersHelper.setFilters(filters).queryTags;
            }
        });


        return {
            ...toRefs(state),
            pageSizeOptions,
            keyItemSets,
            valueHandlerMap,
            handleSelectStatus,
            handleChangeToolbox,
        };
    },
};
</script>
<style scoped lang="postcss">
.budget-toolbox {
    @apply flex flex-wrap flex-col gap-4;
    .top {
        .period-box {
            @apply flex flex-wrap gap-4;
            .label {
                @apply text-gray-500;
            }
        }
    }
}
</style>
