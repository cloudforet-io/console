<template>
    <div class="cost-analysis-page">
        <p-breadcrumbs :routes="routeState.route" />
        <section class="title-section">
            <p-select-dropdown :items="sampleQueryItems" button-only button-icon="ic_list"
                               class="list-button"
            >
                <template #menu-item--format="{item}">
                    <span>{{ item.label }}</span>
                    <div v-if="item.name !== 'default'" class="button-wrapper">
                        <p-icon-button name="ic_trashcan" size="sm" @click.stop="handleClickDeleteQuery" />
                        <p-icon-button name="ic_edit-text" size="sm" @click.stop="handleClickEditQuery(item.label)" />
                    </div>
                </template>
            </p-select-dropdown>
            <p-page-title :title="title">
                <template #extra>
                    <div class="title-extra-wrapper">
                        <span />
                        <div class="button-wrapper">
                            <p-icon-text-button name="ic_download" style-type="gray-border" class="mr-4">
                                PDF
                            </p-icon-text-button>
                            <p-button style-type="gray-border" @click="handleClickSaveQuery">
                                {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.SAVE') }}
                            </p-button>
                        </div>
                    </div>
                </template>
            </p-page-title>
        </section>
        <section class="query-section">
            <div class="left-part">
                <div class="filter-item">
                    <b>{{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.GRANULARITY') }}</b>
                    <p-select-dropdown :selected="filterState.selectedGranularity"
                                       :items="filterState.granularityItems"
                                       without-outline
                                       @select="handleSelectGranularity"
                    />
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
            <b class="mr-3">{{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.GROUP_BY') }}</b>
            <div class="button-wrapper">
                <p-select-button v-for="groupByItem in filterState.groupByItems"
                                 :key="groupByItem.name"
                                 class="group-by-button"
                                 :value="groupByItem"
                                 :selected="filterState.selectedGroupByItems"
                                 multi-selectable
                                 size="sm"
                                 @change="handleSelectGroupByItems"
                >
                    {{ groupByItem.label }}
                </p-select-button>
            </div>
            <component :is="filterState.moreGroupBy.length ? 'p-icon-button' : 'p-icon-text-button'"
                       name="ic_setting" style-type="gray900" outline
                       size="sm"
                       @click="handleClickMore"
            >
                <template v-if="!filterState.moreGroupBy.length">
                    More
                </template>
            </component>
        </section>
        <cost-analysis-chart :group-by-items="filterState.selectedGroupBy" :chart-type="filterState.selectedChartType" />
        <save-query-form-modal :header-title="saveQueryFormTitle" :visible.sync="saveQueryFormVisible"
                               :query-name="selectedQueryName" @confirm="handleSaveQueryConfirm"
        />
        <delete-modal :header-title="checkDeleteState.headerTitle"
                      :visible.sync="checkDeleteState.visible"
                      @confirm="handleDeleteQueryConfirm"
        />
    </div>
</template>

<script lang="ts">
import dayjs from 'dayjs';

import {
    ComponentRenderProxy,
    computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PBreadcrumbs, PPageTitle, PButton, PIconButton, PSelectDropdown, PSelectButton, PIconTextButton,
} from '@spaceone/design-system';

import CostAnalysisChart from '@/services/billing/cost-management/cost-analysis/modules/CostAnalysisChart.vue';
import SaveQueryFormModal from '@/services/billing/cost-management/cost-analysis/modules/CostAnalysisSaveQueryFormModal.vue';
import DeleteModal from '@/common/components/modals/DeleteModal.vue';

import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';
import { BILLING_ROUTE } from '@/services/billing/routes';
import { i18n } from '@/translations';
import { TranslateResult } from 'vue-i18n';
import {
    CHART_TYPE, CURRENCY, GRANULARITY, GROUP_BY,
} from '@/services/billing/cost-management/cost-analysis/lib/config';
import { registerServiceStore } from '@/common/composables/register-service-store';
import { CostAnalysisStoreState, GroupByItem } from '@/services/billing/cost-management/cost-analysis/store/type';
import costAnalysisStoreModule from '@/services/billing/cost-management/cost-analysis/store';
import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { store } from '@/store';


export default {
    name: 'CostAnalysisPage',
    components: {
        CostAnalysisChart,
        PBreadcrumbs,
        PPageTitle,
        PButton,
        PIconButton,
        PSelectDropdown,
        PSelectButton,
        PIconTextButton,
        SaveQueryFormModal,
        DeleteModal,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        registerServiceStore<CostAnalysisStoreState>('costAnalysis', costAnalysisStoreModule);

        const state = reactive({
            title: 'Cost Analysis',
            widgetId: '',
            sampleQueryItems: [
                { name: 'label', label: 'Saved Query', type: 'header' },
                { name: 'default', label: 'Cost Analysis', type: 'item' },
                { name: 'x1', label: 'public widget', type: 'item' },
                { name: 'x2', label: 'A private widget', type: 'item' },
            ],
            saveQueryFormVisible: false,
            saveQueryFormTitle: '' as string | TranslateResult,
            selectedQueryName: '',
        });
        const filterState = reactive({
            selectedGranularity: computed(() => store.state.service.costAnalysis.selectedGranularity),
            selectedGroupByItems: computed(() => store.state.service.costAnalysis.selectedGroupByItems),
            selectedChartType: CHART_TYPE.STACKED_COLUMN,
            selectedCurrency: CURRENCY.USD,
            //
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
            groupByItems: [
                { name: GROUP_BY.PROJECT, label: 'Project' },
                { name: GROUP_BY.SERVICE_ACCOUNT, label: 'Service Account' },
                { name: GROUP_BY.PRODUCT, label: 'Product' },
                { name: GROUP_BY.REGION, label: 'Region' },
                { name: GROUP_BY.PROVIDER, label: 'Provider' },
                { name: GROUP_BY.TYPE, label: 'Type' },
                { name: GROUP_BY.RESOURCE_ID, label: 'Resource ID' },
                { name: GROUP_BY.CURRENCY, label: 'Currency' },
                { name: GROUP_BY.ACCOUNT, label: 'Account' },
            ],
            moreGroupBy: [],
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

        const checkDeleteState = reactive({
            visible: false,
            headerTitle: computed(() => i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.CHECK_DELETE_MODAL_DESC')),
        });

        /* event */
        const handleSelectGranularity = (granularity: string) => {
            store.dispatch('service/costAnalysis/updateSelectedGranularity', granularity);
        };
        const handleSelectGroupByItems = (items: Array<GroupByItem>) => {
            store.dispatch('service/costAnalysis/updateSelectedGroupByItems', items);
        };
        const handleClickRefresh = () => {
            console.log('refresh!');
        };
        const handleClickMore = () => {
            console.log('more!');
        };
        const handleClickDeleteQuery = () => {
            console.log('delete query');
            checkDeleteState.visible = true;
        };
        const handleClickEditQuery = (myQuery) => {
            state.saveQueryFormTitle = i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.EDIT_QUERY');
            state.selectedQueryName = myQuery;
            state.saveQueryFormVisible = true;
        };
        const handleClickSaveQuery = () => {
            state.saveQueryFormTitle = i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.SAVE_QUERY');
            state.saveQueryFormVisible = true;
        };
        const handleSaveQueryConfirm = (requestType) => {
            if (requestType === 'save') console.log('save');
            else console.log('edit');
        };
        const handleDeleteQueryConfirm = () => {
            console.log('delete confirm');
            checkDeleteState.visible = false;
            showSuccessMessage(i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ALT_S_DELETE_QUERY'), '', vm.$root);
        };

        watch(() => filterState.selectedGranularity, (selectedGranularity) => {
            if (selectedGranularity === GRANULARITY.ACCUMULATED) {
                filterState.selectedChartType = CHART_TYPE.DONUT;
            } else {
                filterState.selectedChartType = CHART_TYPE.STACKED_COLUMN;
            }
        });

        watch(() => state.saveQueryFormVisible, () => {
            if (state.saveQueryFormVisible === false) state.selectedQueryName = '';
        });

        return {
            ...toRefs(state),
            filterState,
            routeState,
            checkDeleteState,
            handleSelectGranularity,
            handleSelectGroupByItems,
            handleClickRefresh,
            handleClickMore,
            handleClickDeleteQuery,
            handleClickEditQuery,
            handleClickSaveQuery,
            handleSaveQueryConfirm,
            handleDeleteQueryConfirm,
        };
    },
};
</script>

<style lang="postcss" scoped>
.cost-analysis-page {
    .title-section {
        display: flex;

        .list-button::v-deep {
            @apply bg-transparent;
            margin-right: 0.5rem;
            .p-context-menu {
                min-width: 22rem;
                .menu-item-wrapper {
                    display: flex;
                    justify-content: space-between;
                }
            }
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
    .query-section {
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
        .filter-item {
            display: flex;
            align-items: center;
            margin-right: 0.5rem;
            &::after {
                @apply bg-gray-300;
                display: inline-block;
                position: relative;
                content: '';
                width: 1px;
                height: 1rem;
            }
            &:last-child {
                &::after {
                    display: none;
                }
            }
        }
        .p-select-dropdown {
            @apply bg-transparent;
        }
    }
    .group-by-section {
        @apply bg-white rounded-md border border-gray-200;
        display: flex;
        align-items: center;
        font-size: 0.875rem;
        padding: 1rem;
        margin-bottom: 1rem;

        .button-wrapper {
            &::after {
                @apply bg-gray-500;
                display: inline-block;
                position: relative;
                content: '';
                top: 0.25rem;
                width: 1px;
                height: 1rem;
                margin: 0 0.625rem;
            }
            .group-by-button {
                margin-left: 0.375rem;
                &:first-of-type {
                    margin-left: 0;
                }
            }
        }
    }
    .cost-analysis-chart {
        margin-bottom: 1rem;
    }
}
</style>
