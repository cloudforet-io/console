<template>
    <div class="cost-analysis-chart">
        <section class="chart-section">
            차아트
        </section>
        <section class="query-section">
            <!--filter-->
            <div class="filter-wrapper">
                <div class="title-wrapper">
                    <span class="title">{{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.FILTER') }}</span>
                    <div class="button-wrapper">
                        <p-button style-type="gray-border" size="sm">
                            {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.CLEAR_ALL') }}
                        </p-button>
                        <p-icon-button name="ic_plus" style-type="gray900" size="sm" />
                    </div>
                </div>
                <div class="content" />
            </div>

            <!--legend-->
            <div class="legend-wrapper">
                <div class="title-wrapper">
                    <span class="title">
                        <p-select-dropdown v-model="selectedGroupBy"
                                           class="filter-item"
                                           :items="groupByItems"
                                           without-outline
                        />
                    </span>
                    <div class="button-wrapper">
                        <p-button style-type="gray-border" size="sm">
                            {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.HIDE_ALL') }}
                        </p-button>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script lang="ts">
import {
    PButton, PIconButton, PSelectDropdown,
} from '@spaceone/design-system';
import { computed, reactive, toRefs } from '@vue/composition-api';
import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';
import { GROUP_BY } from '@/services/billing/cost-management/cost-analysis/lib/config';


export default {
    name: 'CostAnalysisChart',
    components: {
        PButton,
        PIconButton,
        PSelectDropdown,
    },
    setup() {
        const state = reactive({
            groupByItems: computed<MenuItem[]>(() => ([
                { type: 'item', name: GROUP_BY.PROJECT, label: 'Project' }, // example
            ])),
            selectedGroupBy: GROUP_BY.PROJECT,
        });

        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>
.cost-analysis-chart {
    @apply grid grid-cols-12;
    grid-gap: 1rem;
    height: 30rem;

    .chart-section {
        @apply col-span-9 bg-white rounded-md border border-gray-200;
    }
    .query-section {
        @apply col-span-3 bg-white rounded-md border border-gray-200;
        .title-wrapper {
            @apply border-b border-gray-200;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem 1rem;
            .title {
                font-size: 0.875rem;
            }
            .button-wrapper {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
        }

        .filter-wrapper {
            min-height: 10rem;
        }
    }
}
</style>
