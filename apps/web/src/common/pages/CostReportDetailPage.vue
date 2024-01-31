<script setup lang="ts">
import type { ComputedRef } from 'vue';
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router/composables';

import { PLink, PDataTable } from '@spaceone/design-system';
import type { DataTableFieldType } from '@spaceone/design-system/src/data-display/tables/data-table/type';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash';


import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { AnalyzeResponse } from '@/schema/_common/api-verbs/analyze';
import type { CostReportDataAnalyzeParameters } from '@/schema/cost-analysis/cost-report-data/api-verbs/analyze';
import type { CostReportGetParameters } from '@/schema/cost-analysis/cost-report/api-verbs/get';
import type { CostReportModel } from '@/schema/cost-analysis/cost-report/model';
import { store } from '@/store';
import { setI18nLocale } from '@/translations';

import { ERROR_ROUTE } from '@/router/constant';

import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';
import { CURRENCY_SYMBOL } from '@/store/modules/settings/config';

import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';

import TableHeader from '@/common/components/cost-report-page/table-header.vue';
import { useAmcharts5 } from '@/common/composables/amcharts5';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { gray, white } from '@/styles/colors';

import ConsoleLogo from '@/services/auth/components/ConsoleLogo.vue';

const router = useRouter();

type CostReportDataAnalyzeResult = {
    [groupBy: string]: string | any;
    value_sum?: Array<{
        date: string;
        value: number
    }>;
    _total_value_sum?: number;
};
interface ChartData {
    category: string;
    value: number;
    pieSettings: {
        fill: string;
    };
}
interface Props {
    accessToken?: string;
    costReportId?: string;
    language?: string;
}
interface State {
    loading: boolean;
    baseInfo?: CostReportModel;
    currency: ComputedRef<string>;
    isExpired: boolean;
    reportDateRage: ComputedRef<string>;
    totalCost: ComputedRef<number>;
    data?: AnalyzeResponse<CostReportDataAnalyzeResult>|undefined;
    chartData: ComputedRef<ChartData[]>;
    numberFormatterOption: ComputedRef<Intl.NumberFormatOptions>;
}


const props = withDefaults(defineProps<Props>(), {
    accessToken: undefined,
    costReportId: undefined,
    language: 'en',
});

const chartContext = ref<HTMLElement|null>(null);
const chartHelper = useAmcharts5(chartContext);

const storeState = reactive({
    providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
});

const state = reactive<State>({
    loading: true,
    baseInfo: undefined,
    currency: computed(() => state.baseInfo?.currency ?? 'USD'),
    isExpired: false,
    reportDateRage: computed(() => {
        const baseDate = dayjs(state.baseInfo?.issue_date);
        if (!baseDate) return '';
        const lastMonth = baseDate.subtract(1, 'month');
        const startDate = lastMonth.startOf('month').format('YYYY-MM-DD');
        const endDate = lastMonth.endOf('month').format('YYYY-MM-DD');
        return `${startDate} ~ ${endDate}`;
    }),
    totalCost: computed(() => (Object.values<CostByProductData[string]>(tableState.costByProductData).reduce((acc, cur) => acc + cur.subtotal, 0) ?? 0)),
    chartData: computed<ChartData[]>(() => tableState.costByProviderData?.map((d) => ({
        category: storeState.providers[d.provider]?.name ?? d.provider,
        value: d.amount,
        pieSettings: {
            fill: storeState.providers[d.provider]?.color,
        },
    })) ?? []),
    numberFormatterOption: computed(() => ({ currency: state.currency, style: 'decimal', notation: 'standard' })),
});

const originDataState = reactive({
    costByProduct: [],
    costByProject: [],
    costByServiceAccount: [],
});

const makeTableFields = (customField:DataTableFieldType, currency:string) => ([
    {
        name: 'index',
        label: 'no',
    },
    {
        textAlign: 'left',
        sortable: false,
        ...customField,
    },
    {
        name: 'amount',
        label: `Amount (${CURRENCY_SYMBOL[currency]})`,
        textAlign: 'right',
        sortable: false,
    },
]);

interface CostByProductData {
    [provider: string]: {
        subtotal: number;
        items: {
            index: number;
            product: string;
            amount: string;
        }[];
    };
}

const tableState = reactive({
    costByProductData: computed<CostByProductData>(() => {
        const items = cloneDeep(originDataState.costByProduct);
        const convertedItemMap = {};
        if (!items.length) {
            return {
                subtotal: 0,
                items: [],
            };
        }
        items.forEach((item: {
            product: string;
            provider: string;
            value_sum: number;
        }) => {
            const { product, provider, value_sum } = item;
            if (!convertedItemMap[provider]) {
                convertedItemMap[provider] = {
                    subtotal: value_sum,
                    items: [{
                        index: 1,
                        product,
                        amount: value_sum ?? 0,
                    }],
                };
            } else {
                convertedItemMap[provider].items.push({
                    index: convertedItemMap[provider].items.length + 1,
                    product,
                    amount: value_sum,
                });
                convertedItemMap[provider].subtotal += value_sum;
            }
        });
        return convertedItemMap;
    }),
    costByProductFields: computed(() => makeTableFields({
        name: 'product',
        label: 'Product',
    }, state.baseInfo?.currency)),
    costByServiceAccountData: computed(() => {
        const items = cloneDeep(originDataState.costByServiceAccount);
        if (!items.length) {
            return {
                subtotal: 0,
                items: [],
            };
        }
        const convertedItemMap = {};
        items.forEach((item: {
            service_account_name: string;
            provider: string;
            value_sum: number;
        }) => {
            const { service_account_name, provider, value_sum } = item;
            if (!convertedItemMap[provider]) {
                convertedItemMap[provider] = {
                    subtotal: value_sum,
                    items: [{
                        index: 1,
                        service_account_name,
                        amount: value_sum ?? 0,
                    }],
                };
            } else {
                convertedItemMap[provider].items.push({
                    index: convertedItemMap[provider].items.length + 1,
                    service_account_name,
                    amount: value_sum,
                });
                convertedItemMap[provider].subtotal += value_sum;
            }
        });
        return convertedItemMap;
    }),
    costByServiceAccountFields: computed(() => makeTableFields({
        name: 'service_account_name',
        label: 'Service Account Name',
    }, state.baseInfo?.currency)),
    costByProjectData: computed(() => {
        const items = cloneDeep(originDataState.costByProject);
        const convertedItemList:{
            index: number;
            project_name: string;
            amount: number;
        }[] = [];
        items.forEach((item: {
            project_name: string;
            value_sum: number;
        }) => {
            const { project_name, value_sum } = item;
            convertedItemList.push({
                index: convertedItemList.length + 1,
                project_name,
                amount: value_sum ?? 0,
            });
        });
        return convertedItemList;
    }),
    costByProjectFields: computed(() => makeTableFields({
        name: 'project_name',
        label: 'Project',
    }, state.baseInfo?.currency)),
    costByProviderData: computed(() => (Object.entries<CostByProductData[string]>(tableState.costByProductData).map(([provider, data]) => ({
        provider,
        amount: data?.subtotal ?? 0,
    })))),
    costByProviderFields: computed(() => ([
        {
            name: 'provider',
            label: 'Provider',
        },
        {
            name: 'amount',
            label: `Amount (${CURRENCY_SYMBOL[state.baseInfo?.currency]})`,
            textAlign: 'right',
            sortable: false,
        },
    ])),
});

/* Util */
const drawChart = () => {
    chartHelper.refreshRoot();
    const chart = chartHelper.createDonutChart({
        paddingLeft: 20,
        paddingRight: 20,
        innerRadius: 40,
    });
    const seriesSettings = {
        categoryField: 'category',
        valueField: 'value',
    };
    const series = chartHelper.createPieSeries(seriesSettings);
    chart.series.push(series);
    series.slices.template.setAll({
        stroke: chartHelper.color(white),
        templateField: 'pieSettings',
    });
    const tooltip = chartHelper.createTooltip();
    chartHelper.setPieTooltipText(series, tooltip, state.baseInfo?.currency);
    series.slices.template.set('tooltip', tooltip);
    series.data.setAll(cloneDeep(state.chartData));
};

const fetchReportData = async () => {
    try {
        const { costReportId } = props;
        if (!costReportId) return;
        state.baseInfo = await SpaceConnector.clientV2.costAnalysis.costReport.get<CostReportGetParameters, CostReportModel>({
            cost_report_id: costReportId,
        });
    } catch (e: any) {
        ErrorHandler.handleError(e);
        await router.push({ name: ERROR_ROUTE.EXPIRED_LINK._NAME });
    }
};

interface AnalyzeDataModel {
    more: boolean;
    results: Record<string, any>[];
}
const fetchAnalyzeData = async (groupBy: string[]):Promise<AnalyzeDataModel|undefined> => {
    try {
        return await SpaceConnector.clientV2.costAnalysis.costReportData.analyze<CostReportDataAnalyzeParameters, AnalyzeDataModel>({
            query: {
                group_by: groupBy,
                fields: {
                    value_sum: {
                        key: `cost.${state.baseInfo?.currency}`,
                        operator: 'sum',
                    },
                },
                filter: [
                    {
                        k: 'cost_report_config_id',
                        v: state.baseInfo?.cost_report_config_id,
                        o: 'eq',
                    },
                    {
                        k: 'cost_report_id',
                        v: props.costReportId,
                        o: 'eq',
                    },
                    {
                        k: 'is_confirmed',
                        v: true,
                        o: 'eq',
                    },
                ],
                sort: [{
                    key: 'value_sum',
                    desc: true,
                }],
            },
        });
    } catch (e: any) {
        ErrorHandler.handleError(e);
        return undefined;
    }
};

/* Init */
const initStatesByUrlSSOToken = async ():Promise<boolean> => {
    try {
        if (!props.accessToken) return false;
        SpaceConnector.setToken(props.accessToken, '');
        return true;
    } catch (e: any) {
        state.isExpired = true;
        return false;
    }
};

const fetchTableData = async () => {
    const results = await Promise.allSettled<AnalyzeDataModel|undefined>([
        fetchAnalyzeData(['provider', 'product']),
        fetchAnalyzeData(['project_name']),
        fetchAnalyzeData(['provider', 'service_account_name']),
    ]);
    const [costByProduct, costByProject, costByServiceAccount] = results;
    originDataState.costByProduct = costByProduct.value.results;
    originDataState.costByProject = costByProject.value.results;
    originDataState.costByServiceAccount = costByServiceAccount.value.results;
};

const setMetaTag = () => {
    const viewportEl = document.querySelector('head meta[name="viewport"]');
    if (viewportEl) viewportEl.attributes.content.value = 'width=928';
};
const setRootTagStyle = () => {
    const htmlEl = document.querySelector('html');
    const bodyEl = document.querySelector('body');
    const appEl = document.querySelector('#app');
    if (htmlEl) {
        htmlEl.style.overflowY = 'auto';
    }
    if (bodyEl) bodyEl.style.height = 'unset';
    if (appEl) appEl.style.height = 'unset';
};

(async () => {
    setMetaTag();
    state.loading = true;
    const isSucceeded = await initStatesByUrlSSOToken();
    if (!isSucceeded) return;
    await fetchReportData();
    await store.dispatch('reference/provider/load');
    await setI18nLocale(props.language);
    await fetchTableData();
    state.loading = false;
    drawChart();
    setRootTagStyle();
})();

</script>

<template>
    <div class="body">
        <div class="invoice">
            <div class="header">
                <p class="main-title">
                    {{ $t('COMMON.COST_REPORT.COST_REPORT') }}
                </p>
                <console-logo :size-ratio="0.8"
                              :position-fixed="false"
                              :is-hidden-if-tablet="false"
                />
            </div>
            <div class="invoice-information">
                <p class="report-name">
                    {{ state.baseInfo?.workspace_name }}
                </p>
                <p class="report-info">
                    <label>{{ $t('COMMON.COST_REPORT.REPORT_NUMBER') }}:</label>{{ state.baseInfo?.report_number }}
                </p>
                <p class="report-info">
                    <label>{{ $t('COMMON.COST_REPORT.ISSUE_DATE') }}:</label>{{ state.baseInfo?.issue_date }} <span class="real-date-range">({{ state.reportDateRage }})</span>
                </p>
                <p class="report-info">
                    <label>{{ $t('COMMON.COST_REPORT.CURRENCY_REFERENCE') }}:</label> {{ state.baseInfo?.currency_date }} ({{ state.baseInfo?.bank_name }})
                </p>
            </div>
            <div class="total"
                 :style="{borderTopColor: gray[500], borderBottomColor: gray[200]}"
            >
                <span class="title">{{ $t('COMMON.COST_REPORT.TOTAL') }}</span>
                <div class="total-value-wrapper">
                    <div class="total-cost">
                        <span class="currency-symbol">{{ CURRENCY_SYMBOL[state.currency] }}</span>
                        <span class="total-text">{{ currencyMoneyFormatter(state.totalCost, state.numberFormatterOption) }}</span>
                    </div>
                    <div class="currency-value">
                        {{ state.currency }}
                    </div>
                </div>
            </div>
            <div class="index-wrapper">
                <p class="title">
                    {{ $t('COMMON.COST_REPORT.INDEX') }}
                </p>
                <p-link :to="{ ...router.currentRoute, hash: '#total-amount-by-provider' }"
                        class="table-link"
                        highlight
                        use-anchor-scroll
                >
                    {{ $t('COMMON.COST_REPORT.TOTAL_AMOUNT_BY_PROVIDER') }}
                </p-link>
                <p-link :to="{ ...router.currentRoute, hash: '#details-by-product' }"
                        class="table-link"
                        highlight
                        use-anchor-scroll
                >
                    {{ $t('COMMON.COST_REPORT.DETAILS_BY_PRODUCT') }}
                </p-link>
                <p-link :to="{ ...router.currentRoute, hash: '#details-by-project' }"
                        class="table-link"
                        highlight
                        use-anchor-scroll
                >
                    {{ $t('COMMON.COST_REPORT.DETAILS_BY_PROJECT') }}
                </p-link>
                <p-link :to="{ ...router.currentRoute, hash: '#details-by-service-account' }"
                        class="table-link"
                        highlight
                        use-anchor-scroll
                >
                    {{ $t('COMMON.COST_REPORT.DETAILS_BY_SERVICE_ACCOUNT') }}
                </p-link>
            </div>
            <div id="total-amount-by-provider">
                <div ref="chartContext"
                     class="chart"
                />
                <div class="table">
                    <p class="title">
                        {{ $t('COMMON.COST_REPORT.DETAILS_BY_PROVIDER') }}
                    </p>
                    <p-data-table :fields="tableState.costByProviderFields"
                                  :items="tableState.costByProviderData"
                                  :selectable="false"
                                  :disable-copy="true"
                                  :disable-hover="true"
                                  :loading="state.loading"
                    >
                        <template #col-provider-format="{item, value}">
                            <div class="legend">
                                <span class="legend-icon"
                                      :style="{ 'background-color': storeState.providers[value]?.color }"
                                /><span>{{ storeState.providers[value]?.label ?? value }}</span>
                                <span v-if="state.totalCost"
                                      class="ratio"
                                >{{ ((item.amount / state.totalCost) * 100).toFixed(0) }}%</span>
                            </div>
                        </template>
                        <template #col-amount-format="{value}">
                            {{ currencyMoneyFormatter(value, state.numberFormatterOption) }}
                        </template>
                    </p-data-table>
                </div>
            </div>
            <div id="details-by-product"
                 class="data-table-section"
            >
                <p class="title">
                    {{ $t('COMMON.COST_REPORT.DETAILS_BY_PRODUCT') }}
                </p>
                <div v-for="(provider, idx) in Object.keys(tableState.costByProductData)"
                     :key="idx"
                >
                    <table-header :title="storeState.providers[provider]?.label"
                                  :sub-total="currencyMoneyFormatter(tableState.costByProductData[provider].subtotal, state.numberFormatterOption)"
                                  :provider-icon-src="storeState.providers[provider]?.icon"
                    />
                    <p-data-table :fields="tableState.costByProductFields"
                                  :items="tableState.costByProductData[provider]?.items"
                                  :skeleton-rows="3"
                                  :stripe="false"
                                  :selectable="false"
                                  :disable-copy="true"
                                  :disable-hover="true"
                                  :loading="state.loading"
                                  class="budget-summary-table"
                    >
                        <template #col-amount-format="{value}">
                            {{ currencyMoneyFormatter(value, state.numberFormatterOption) }}
                        </template>
                    </p-data-table>
                </div>
            </div>
            <div id="details-by-project"
                 class="data-table-section"
            >
                <p class="title">
                    {{ $t('COMMON.COST_REPORT.DETAILS_BY_PROJECT') }}
                </p>
                <p-data-table :fields="tableState.costByProjectFields"
                              :items="tableState.costByProjectData"
                              :selectable="false"
                              :disable-copy="true"
                              :disable-hover="true"
                              :loading="state.loading"
                >
                    <template #col-amount-format="{value}">
                        {{ currencyMoneyFormatter(value, state.numberFormatterOption) }}
                    </template>
                </p-data-table>
            </div>
            <div id="details-by-service-account"
                 class="data-table-section"
            >
                <p class="title">
                    {{ $t('COMMON.COST_REPORT.DETAILS_BY_SERVICE_ACCOUNT') }}
                </p>
                <div v-for="(provider, idx) in Object.keys(tableState.costByServiceAccountData)"
                     :key="idx"
                >
                    <table-header :title="storeState.providers[provider]?.label ?? provider"
                                  :sub-total="currencyMoneyFormatter(tableState.costByServiceAccountData[provider]?.subtotal,state.numberFormatterOption)"
                                  :provider="storeState.providers[provider]?.label"
                                  :provider-icon-src="storeState.providers[provider]?.icon"
                    />
                    <p-data-table :fields="tableState.costByServiceAccountFields"
                                  :items="tableState.costByServiceAccountData[provider]?.items"
                                  :skeleton-rows="3"
                                  :stripe="false"
                                  :selectable="false"
                                  :disable-copy="true"
                                  :disable-hover="true"
                                  :loading="state.loading"
                                  class="budget-summary-table"
                    >
                        <template #col-amount-format="{value}">
                            {{ currencyMoneyFormatter(value, state.numberFormatterOption) }}
                        </template>
                    </p-data-table>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.title {
    @apply text-label-xl font-bold;
    margin-bottom: 0.75rem;
}

/* custom design-system component - p-data-table */
:deep() {
    .p-data-table {
        min-height: unset;
    }
}

.body {
    @apply flex justify-center bg-white;
    font-size: 0.9625rem;
    font-family: Helvetica, Arial, sans-serif;
    color: #232533;
    font-weight: 400;
    overflow: auto;
    .invoice {
        width: 100%;
        min-width: 7.6in;
        max-width: 8.5in;
        margin: 0 1rem;
        padding: 1.4rem 0 3rem 0;

        .header {
            @apply flex items-end justify-between;
            width: 100%;
            .main-title {
                @apply text-display-lg font-bold;
            }
        }

        .invoice-information {
            @apply flex flex-col;
            margin: 3rem 0;

            .report-name {
                @apply text-display-md;
            }

            .report-info {
                @apply text-label-md;
                margin-top: 0.5rem;

                & label {
                    @apply text-label-md font-bold;
                    margin-right: 0.5rem;
                }

                &:nth-child(2) {
                    margin-top: 1.5rem;
                }
                &:nth-child(3) {
                    margin-bottom: 1.5rem;
                    .real-date-range {
                        @apply text-label-md text-gray-500;
                    }
                }
            }
        }

        .total {
            @apply border-t border-b flex  justify-between;
            padding-top: 0.875rem;
            height: 4.75rem;

            .total-value-wrapper {
                @apply flex flex-col items-end;
                .total-cost {
                    @apply flex items-center;
                    .currency-symbol {
                        @apply text-label-lg;
                        margin-right: 0.25rem;
                    }
                    .total-text {
                        @apply text-display-md;
                    }
                }

                .currency-value {
                    @apply text-label-md text-gray-500;
                }
            }
        }

        .index-wrapper {
            @apply flex flex-col;
            margin-top: 2rem;
            margin-bottom: 2.25rem;
            .table-link {
                margin-bottom: 0.75rem;
            }
        }

        .data-table-section {
            margin-bottom: 3rem;
            margin-left: 33%;
        }
    }
}

#total-amount-by-provider {
    @apply flex;
    .chart {
        height: 12rem;
        width: 33%;
    }
    .table {
        flex-grow: 1;
    }
    margin-bottom: 3rem;
}

.legend {
    @apply flex items-center;

    .legend-icon {
        display: inline-block;
        width: 0.625rem;
        height: 0.625rem;
        border-radius: 100%;
        margin-right: 0.5rem;
    }

    .ratio {
        @apply text-label-md text-gray-500;
        margin-left: 0.5rem;
    }
}
</style>
