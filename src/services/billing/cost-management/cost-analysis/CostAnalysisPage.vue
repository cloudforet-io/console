<template>
    <div class="cost-analysis-page">
        <p-breadcrumbs :routes="routeState.route" />
        <section class="title-section">
            <p-icon-button name="ic_list" class="list-button" />
            <p-page-title :title="title">
                <template #extra>
                    <div class="title-extra-wrapper">
                        <span />
                        <!--                        <favorite-button :item-id="widgetId"-->
                        <!--                                         favorite-type="billing"-->
                        <!--                                         resource-type="billing.CostManagement"-->
                        <!--                        />-->
                        <div class="button-wrapper">
                            <p-icon-text-button name="ic_download" style-type="gray-border" class="mr-4">
                                PDF
                            </p-icon-text-button>
                            <p-button style-type="gray-border">
                                {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.SAVE') }}
                            </p-button>
                        </div>
                    </div>
                </template>
            </p-page-title>
        </section>
        <section class="filter-section">
            <div class="left-part">
                <div class="filter-item">
                    <b>{{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.GRANULARITY') }}</b>
                    <p-select-dropdown v-model="filterState.selectedGranularity" :items="filterState.granularityItems" without-outline />
                </div>
                <div class="filter-item">
                    <b>{{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.CHART_TYPE') }}</b>
                    <p-select-dropdown v-model="filterState.selectedChartType" :items="filterState.chartTypeItems" without-outline />
                </div>
            </div>
            <div class="right-part">
                <div class="filter-item">
                    <span>{{ filterState.startDate.format('YYYY/MM/DD') }} ~ {{ filterState.endDate.format('YYYY/MM/DD') }}</span>
                    <p-icon-button class="filter-item" name="ic_calendar"
                                   width="0.5rem"
                                   height="0.5rem"
                    />
                </div>
                <p-select-dropdown v-model="filterState.selectedCurrency"
                                   class="filter-item"
                                   :items="filterState.currencyItems"
                                   without-outline
                />
                <p-icon-button class="filter-item" name="ic_refresh" @click="handleClickRefresh" />
            </div>
        </section>
        <section class="group-by-section">
            <b>{{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.GROUP_BY') }}</b>
            <p-select-button v-model="filterState.selectedGroupBy" multi-selectable />
        </section>
        <section class="chart-section">
            <cost-analysis-chart />
        </section>
        <section class="table-section">
        </section>
    </div>
</template>

<script lang="ts">
import dayjs from 'dayjs';

import { computed, reactive, toRefs } from '@vue/composition-api';

import {
    PBreadcrumbs, PPageTitle, PButton, PIconButton, PSelectDropdown, PSelectButton, PIconTextButton,
} from '@spaceone/design-system';

import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import CostAnalysisChart from '@/services/billing/cost-management/cost-analysis/modules/CostAnalysisChart.vue';

import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';
import { BILLING_ROUTE } from '@/services/billing/routes';
import { i18n } from '@/translations';
import { CHART_TYPE, CURRENCY, GRANULARITY } from '@/services/billing/cost-management/cost-analysis/lib/config';


export default {
    name: 'CostAnalysisPage',
    components: {
        CostAnalysisChart,
        FavoriteButton,
        PBreadcrumbs,
        PPageTitle,
        PButton,
        PIconButton,
        PSelectDropdown,
        PSelectButton,
        PIconTextButton,
    },
    setup() {
        const state = reactive({
            title: 'Sample Title',
            widgetId: '',
        });
        const filterState = reactive({
            granularityItems: computed<MenuItem[]>(() => ([
                {
                    type: 'item',
                    name: GRANULARITY.ACCUMULATED,
                    label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ACCUMULATED'),
                },
                {
                    type: 'item',
                    name: GRANULARITY.DAILY,
                    label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.DAILY'),
                },
                {
                    type: 'item',
                    name: GRANULARITY.MONTHLY,
                    label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.MONTHLY'),
                },
                {
                    type: 'item',
                    name: GRANULARITY.YEARLY,
                    label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.YEARLY'),
                },
            ])),
            chartTypeItems: computed<MenuItem[]>(() => ([
                {
                    type: 'item',
                    name: CHART_TYPE.LINE,
                    label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.LINE'),
                },
                {
                    type: 'item',
                    name: CHART_TYPE.STACKED_LINE,
                    label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.STACKED_LINE'),
                },
                {
                    type: 'item',
                    name: CHART_TYPE.COLUMN,
                    label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.COLUMN'),
                },
                {
                    type: 'item',
                    name: CHART_TYPE.STACKED_COLUMN,
                    label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.STACKED_COLUMN'),
                },
                {
                    type: 'item',
                    name: CHART_TYPE.DONUT,
                    label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.DONUT'),
                },
            ])),
            currencyItems: computed<MenuItem[]>(() => ([
                { type: 'item', name: CURRENCY.USD, label: '$USD' },
                { type: 'item', name: CURRENCY.KRW, label: '$KRW' },
                { type: 'item', name: CURRENCY.JPY, label: '¥JPY' },
            ])),
            groupByItems: '',
            //
            selectedGranularity: GRANULARITY.DAILY,
            selectedChartType: CHART_TYPE.COLUMN,
            selectedCurrency: CURRENCY.USD,
            selectedGroupBy: computed(() => ([
            ])),
            startDate: dayjs.utc().startOf('month'),
            endDate: dayjs.utc(),
        });
        const routeState = reactive({
            route: computed(() => [
                { name: i18n.t('MENU.BILLING.BILLING'), to: { name: BILLING_ROUTE._NAME } },
                { name: i18n.t('MENU.BILLING.COST_MANAGEMENT'), to: { name: BILLING_ROUTE.COST_MANAGEMENT._NAME } },
                { name: i18n.t('MENU.BILLING.COST_ANALYSIS') },
            ]),
        });

        /* event */
        const handleClickRefresh = () => {
            console.log('refresh!');
        };

        return {
            ...toRefs(state),
            filterState,
            routeState,
            handleClickRefresh,
        };
    },
};
</script>

<style lang="postcss" scoped>
.cost-analysis-page {
    .title-section {
        display: flex;

        .list-button {
            margin-right: 0.5rem;
        }
        .title-extra-wrapper {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-left: 0.75rem;
            .button-wrapper {
                display: flex;
            }
        }
    }
    .filter-section {
        display: flex;
        justify-content: space-between;
        font-size: 0.875rem;
        padding-bottom: 1rem;

        .left-part {
            display: flex;
            align-items: center;
            .filter-item {
                .p-select-dropdown {
                    padding-left: 0.5rem;
                }
            }
        }
        .right-part {
            display: flex;
            align-items: center;
        }
        .left-part, .right-part {
            .filter-item {
                display: flex;
                align-items: center;
                padding-right: 0.5rem;
                &:after {
                    @apply bg-gray-300;
                    display: inline-block;
                    position: relative;
                    content: '';
                    width: 1px;
                    height: 1rem;
                    &:last-child {
                        display: none;
                    }
                }
            }
        }
        .p-select-dropdown {
            @apply bg-transparent;
        }
    }
    .group-by-section {
        @apply bg-white rounded-md border border-gray-200;
        font-size: 0.875rem;
        padding: 1rem;
        margin-bottom: 1rem;
    }
    .chart-section {
        margin-bottom: 1rem;
    }
    .table-section {
    }
}
</style>
