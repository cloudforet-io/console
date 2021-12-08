<template>
    <div class="budget-toolbox">
        <div class="top">
            <div class="period-box">
                <span class="label">{{ $t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.PERIOD') }}</span>
                <p-select-status v-for="(status, idx) in periodList" :key="idx"
                                 v-model="selectedPeriod"
                                 :value="status.name"
                                 multi-selectable
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
                   :this-page="thisPage"
                   :page-size.sync="pageSize"
                   :total-count="totalCount"
                   :query-tags="queryTags"
                   :key-item-sets="keyItemSets"
                   :value-handler-map="valueHandlerMap"
                   @change="handleChangeToolbox"
        />
    </div>
</template>

<script lang="ts">
import {
    computed,
    reactive, toRefs,
} from '@vue/composition-api';

import { PToolbox, PSelectStatus } from '@spaceone/design-system';
import { ToolboxOptions } from '@spaceone/design-system/dist/src/navigation/toolbox/type';
import { QueryTag } from '@spaceone/design-system/dist/src/inputs/search/query-search-tags/type';

import {
    makeDistinctValueHandler,
    makeReferenceValueHandler,
} from '@spaceone/console-core-lib/component-util/query-search';
import { getThisPage } from '@spaceone/console-core-lib/component-util/pagination';
import { KeyItemSet, ValueHandlerMap } from '@spaceone/console-core-lib/component-util/query-search/type';

import { i18n } from '@/translations';


export default {
    name: 'BudgetToolbox',
    components: {
        PToolbox,
        PSelectStatus,
    },
    props: {
        queryTags: {
            type: Array,
            default: () => [],
        },
    },
    setup() {
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
            ],
        }];

        const valueHandlerMap: ValueHandlerMap = {
            budget_id: makeDistinctValueHandler('cost_analysis.Budget', 'budget_id'),
            name: makeDistinctValueHandler('cost_analysis.Budget', 'name'),
            project_id: makeReferenceValueHandler('identity.Project'),
            project_group_id: makeReferenceValueHandler('identity.Project'),
            time_unit: makeDistinctValueHandler('cost_analysis.Budget', 'time_unit'),
        };

        const state = reactive({
            selectedPeriod: [],
            periodList: computed(() => [
                { name: 'total', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.TOTAL') },
                { name: 'thisMonth', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.THIS_MONTH') },
            ]),
            pageSize: 24,
            totalCount: 0,
            queryTags: [] as QueryTag[],
            thisPage: 1,
        });

        const handleSelectStatus = () => {
            console.log('select');
        };

        const handleChangeToolbox = async (options: ToolboxOptions) => {
            if (options.queryTags !== undefined) {
                state.queryTags = options.queryTags;
            }
            if (options.pageLimit !== undefined) {
                state.pageSize = options.pageLimit;
            }
            if (options.pageStart !== undefined) {
                state.thisPage = getThisPage(options.pageStart, state.pageSize);
            }
        };

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
