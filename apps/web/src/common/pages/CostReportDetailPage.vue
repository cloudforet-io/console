<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router/composables';

import dayjs from 'dayjs';
import type { PieSeriesOption } from 'echarts/charts';
import { init } from 'echarts/core';
import {
    sortBy, sum,
} from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PLink, PDataTable, PIconButton } from '@cloudforet/mirinae';
import type { DataTableFieldType } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';
import { numberFormatter } from '@cloudforet/utils';

import type { AnalyzeResponse } from '@/api-clients/_common/schema/api-verbs/analyze';
import type { CostReportDataAnalyzeParameters } from '@/api-clients/cost-analysis/cost-report-data/schema/api-verbs/analyze';
import type { CostReportGetParameters } from '@/api-clients/cost-analysis/cost-report/schema/api-verbs/get';
import type { CostReportModel } from '@/api-clients/cost-analysis/cost-report/schema/model';
import { setI18nLocale } from '@/translations';

import { ERROR_ROUTE } from '@/router/constant';

import { CURRENCY_SYMBOL } from '@/store/display/constant';
import type { Currency } from '@/store/display/type';
import { useDomainStore } from '@/store/domain/domain-store';
import type { ProviderReferenceMap } from '@/store/reference/provider-reference-store';
import { useProviderReferenceStore } from '@/store/reference/provider-reference-store';

import config from '@/lib/config';
import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';

import TableHeader from '@/common/components/cost-report-page/table-header.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { gray } from '@/styles/colors';
import { MASSIVE_CHART_COLORS } from '@/styles/colorsets';

import ConsoleLogo from '@/services/auth/components/ConsoleLogo.vue';



const router = useRouter();

type CostReportDataAnalyzeResult = {
    [groupBy: string]: string|any;
    value_sum?: Array<{
        [groupBy: string]: string|any;
        value: number
    }>|number;
    _total_value_sum?: number;
};
interface Props {
    accessToken?: string;
    costReportId?: string;
    language?: string;
}

const props = withDefaults(defineProps<Props>(), {
    accessToken: undefined,
    costReportId: undefined,
    language: 'en',
});

const chartContext = ref<HTMLElement|null>(null);
const providerReferenceStore = useProviderReferenceStore();
const domainStore = useDomainStore();

const storeState = reactive({
    providers: computed<ProviderReferenceMap>(() => providerReferenceStore.state.items ?? {}),
    domainName: computed<string>(() => {
        const domainSettings = domainStore.state.config?.settings;
        if (domainSettings?.display_name) return domainSettings?.display_name;
        return domainStore.state.name;
    }),
});

const state = reactive({
    loading: true,
    baseInfo: undefined as CostReportModel|undefined,
    currency: computed<Currency>(() => state.baseInfo?.currency ?? 'USD'),
    isExpired: false,
    reportDateRage: computed<string>(() => {
        const baseDate = dayjs(state.baseInfo?.issue_date);
        if (!baseDate) return '';
        const lastMonth = baseDate.subtract(1, 'month');
        const startDate = lastMonth.startOf('month').format('YYYY-MM-DD');
        const endDate = lastMonth.endOf('month').format('YYYY-MM-DD');
        return `${startDate} ~ ${endDate}`;
    }),
    totalCost: computed<number>(() => sum(tableState.costByProduct.map((d) => d._total_value_sum))),
    chartOptions: computed<PieSeriesOption>(() => ({
        color: MASSIVE_CHART_COLORS,
        grid: {
            containLabel: true,
        },
        tooltip: {
            trigger: 'item',
            position: 'inside',
            formatter: (params) => {
                const _name = storeState.providers[params.name]?.label ?? params.name;
                const _value = numberFormatter(params.value) || '';
                return `${params.marker} ${_name}: <b>${_value}</b>`;
            },
        },
        legend: {
            show: false,
        },
        series: [
            {
                type: 'pie',
                radius: ['30%', '70%'],
                center: ['30%', '50%'],
                data: state.chartData,
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)',
                    },
                },
                avoidLabelOverlap: false,
                label: {
                    show: false,
                },
            },
        ],
    })),
    chartData: [],
    numberFormatterOption: computed<Intl.NumberFormatOptions>(() => ({ currency: state.currency, style: 'decimal', notation: 'standard' })),
    printMode: false,
});

const ETC = config.get('COST_REPORT.ETC_CUSTOM_LABEL') ?? 'ETC';

const tableState = reactive({
    costByProduct: [] as CostReportDataAnalyzeResult[],
    costByProject: [] as CostReportDataAnalyzeResult[],
    costByServiceAccount: [] as CostReportDataAnalyzeResult[],
    costByProductFields: computed(() => makeTableFields({
        name: 'product',
        label: 'Product',
    }, state.baseInfo?.currency)),
    costByServiceAccountFields: computed(() => makeTableFields({
        name: 'service_account_name',
        label: 'Service Account Name',
    }, state.baseInfo?.currency)),
    costByProjectFields: computed(() => makeTableFields({
        name: 'project_name',
        label: 'Project',
    }, state.baseInfo?.currency, 'value_sum')),
    costByProviderFields: computed(() => ([
        {
            name: 'provider',
            label: 'Provider',
        },
        {
            name: '_total_value_sum',
            label: `Amount (${CURRENCY_SYMBOL[state.baseInfo?.currency]})`,
            textAlign: 'right',
            sortable: false,
        },
    ])),
});

/* Util */
const makeTableFields = (customField:DataTableFieldType, currency:string, valueFieldName = 'value') => ([
    {
        name: 'index',
        label: 'no',
        width: '3.125rem',
    },
    {
        textAlign: 'left',
        sortable: false,
        ...customField,
    },
    {
        name: valueFieldName,
        label: `Amount (${CURRENCY_SYMBOL[currency]})`,
        textAlign: 'right',
        sortable: false,
    },
]);
const getSortedTableData = (rawData: CostReportDataAnalyzeResult[]):CostReportDataAnalyzeResult[] => {
    const results: CostReportDataAnalyzeResult[] = [];
    rawData.forEach((data) => {
        results.push({
            ...data,
            value_sum: sortBy(data.value_sum, 'value').reverse(),
        });
    });
    return results;
};
const drawChart = () => {
    state.chartData = tableState.costByProduct.map((d) => ({
        name: d.provider,
        value: d._total_value_sum,
        itemStyle: {
            color: storeState.providers[d.provider]?.color,
        },
    }));

    state.chart = init(chartContext.value);
    state.chart.setOption(state.chartOptions, true);
};

/* Api */
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

const fetchAnalyzeData = async (groupBy: string[], fieldGroup?: string[]):Promise<AnalyzeResponse<CostReportDataAnalyzeResult>|undefined> => {
    try {
        return await SpaceConnector.clientV2.costAnalysis.costReportData.analyze<CostReportDataAnalyzeParameters, AnalyzeResponse<CostReportDataAnalyzeResult>>({
            is_confirmed: true,
            query: {
                group_by: groupBy,
                fields: {
                    value_sum: {
                        key: `cost.${state.baseInfo?.currency}`,
                        operator: 'sum',
                    },
                },
                field_group: fieldGroup,
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
                ],
                sort: [{ key: '_total_value_sum', desc: true }, { key: 'value_sum', desc: true }, { key: 'value', desc: true }],
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
    const results = await Promise.allSettled<AnalyzeResponse<CostReportDataAnalyzeResult>|undefined>([
        fetchAnalyzeData(['provider', 'product'], ['product']),
        fetchAnalyzeData(['project_name']),
        fetchAnalyzeData(['provider', 'service_account_name'], ['service_account_name']),
    ]);
    const [costByProduct, costByProject, costByServiceAccount] = results;
    tableState.costByProduct = getSortedTableData(costByProduct?.value?.results ?? []);
    tableState.costByProject = costByProject?.value?.results ?? [];
    tableState.costByServiceAccount = getSortedTableData(costByServiceAccount?.value?.results ?? []);
};

const setMetaTag = () => {
    const viewportEl = document.querySelector('head meta[name="viewport"]');
    if (viewportEl) (viewportEl as HTMLMetaElement).content = 'width=928';
};
const setRootTagStyle = () => {
    const htmlEl = document.querySelector('html');
    const bodyEl = document.querySelector('body');
    const appEl = document.querySelector('#app');
    if (htmlEl) {
        htmlEl.style.overflowY = 'auto';
    }
    if (bodyEl) bodyEl.style.height = 'unset';
    if (appEl) (appEl as HTMLElement).style.height = 'unset';
};

const handlePrint = () => {
    window.print();
};

(async () => {
    setMetaTag();
    state.loading = true;
    const isSucceeded = await initStatesByUrlSSOToken();
    if (!isSucceeded) return;
    await fetchReportData();
    await setI18nLocale(props.language);
    await fetchTableData();
    await providerReferenceStore.load();
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
                <p v-if="!config.get('COST_REPORT.EXCLUDE.HEADERS.report_number')"
                   class="report-info"
                >
                    <label>{{ $t('COMMON.COST_REPORT.REPORT_NUMBER') }}:</label>{{ state.baseInfo?.report_number }}
                </p>
                <p v-if="!config.get('COST_REPORT.EXCLUDE.HEADERS.from')"
                   class="report-info"
                >
                    <label>{{ $t('COMMON.COST_REPORT.FROM') }}:</label>{{ storeState.domainName }}
                </p>
                <p v-if="!config.get('COST_REPORT.EXCLUDE.HEADERS.to')"
                   class="report-info"
                >
                    <label>{{ $t('COMMON.COST_REPORT.TO') }}:</label>{{ state.baseInfo?.workspace_name }}
                </p>
                <p v-if="!config.get('COST_REPORT.EXCLUDE.HEADERS.currency_reference')"
                   class="report-info"
                >
                    <label>{{ $t('COMMON.COST_REPORT.CURRENCY_REFERENCE') }}:</label> {{ state.baseInfo?.currency_date }} ({{ state.baseInfo?.bank_name }})
                </p>
                <p v-if="!config.get('COST_REPORT.EXCLUDE.HEADERS.issue_date')"
                   class="report-info"
                >
                    <label>{{ $t('COMMON.COST_REPORT.ISSUE_DATE') }}:</label>{{ state.baseInfo?.issue_date }} <span class="real-date-range">({{ state.reportDateRage }})</span>
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
                <p-link v-if="!config.get('COST_REPORT.EXCLUDE.CONTENTS.provider.ui')"
                        :to="{ ...router.currentRoute, hash: '#total-amount-by-provider' }"
                        class="table-link"
                        highlight
                        use-anchor-scroll
                >
                    {{ $t('COMMON.COST_REPORT.DETAILS_BY_PROVIDER') }}
                </p-link>
                <p-link v-if="!config.get('COST_REPORT.EXCLUDE.CONTENTS.product')"
                        :to="{ ...router.currentRoute, hash: '#details-by-product' }"
                        class="table-link"
                        highlight
                        use-anchor-scroll
                >
                    {{ $t('COMMON.COST_REPORT.DETAILS_BY_PRODUCT') }}
                </p-link>
                <p-link v-if="!config.get('COST_REPORT.EXCLUDE.CONTENTS.project')"
                        :to="{ ...router.currentRoute, hash: '#details-by-project' }"
                        class="table-link"
                        highlight
                        use-anchor-scroll
                >
                    {{ $t('COMMON.COST_REPORT.DETAILS_BY_PROJECT') }}
                </p-link>
                <p-link v-if="!config.get('COST_REPORT.EXCLUDE.CONTENTS.service_account')"
                        :to="{ ...router.currentRoute, hash: '#details-by-service-account' }"
                        class="table-link"
                        highlight
                        use-anchor-scroll
                >
                    {{ $t('COMMON.COST_REPORT.DETAILS_BY_SERVICE_ACCOUNT') }}
                </p-link>
            </div>
            <div v-if="!config.get('COST_REPORT.EXCLUDE.CONTENTS.provider.ui')"
                 id="total-amount-by-provider"
            >
                <div ref="chartContext"
                     class="chart"
                />
                <div class="table">
                    <p class="title">
                        {{ $t('COMMON.COST_REPORT.DETAILS_BY_PROVIDER') }}
                    </p>
                    <p-data-table :fields="tableState.costByProviderFields"
                                  :items="tableState.costByProduct"
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
                                <span v-if="state.totalCost && !config.get('COST_REPORT.EXCLUDE.CONTENTS.provider.percentage')"
                                      class="ratio"
                                >{{ ((item._total_value_sum / state.totalCost) * 100).toFixed(0) }}%</span>
                            </div>
                        </template>
                        <template #col-_total_value_sum-format="{value}">
                            {{ currencyMoneyFormatter(value, state.numberFormatterOption) }}
                        </template>
                    </p-data-table>
                </div>
            </div>
            <div v-if="!config.get('COST_REPORT.EXCLUDE.CONTENTS.product')"
                 id="details-by-product"
                 class="data-table-section"
            >
                <p class="title">
                    {{ $t('COMMON.COST_REPORT.DETAILS_BY_PRODUCT') }}
                </p>
                <div v-for="(providerData, idx) in tableState.costByProduct"
                     :key="idx"
                >
                    <table-header :title="storeState.providers[providerData.provider]?.label"
                                  :sub-total="currencyMoneyFormatter(providerData._total_value_sum, state.numberFormatterOption)"
                                  :provider-icon-src="storeState.providers[providerData.provider]?.icon"
                    />
                    <p-data-table :fields="tableState.costByProductFields"
                                  :items="providerData.value_sum"
                                  :skeleton-rows="3"
                                  :stripe="false"
                                  :selectable="false"
                                  :disable-copy="true"
                                  :disable-hover="true"
                                  :loading="state.loading"
                                  class="budget-summary-table"
                    >
                        <template #col-index-format="{rowIndex}">
                            {{ rowIndex + 1 }}
                        </template>
                        <template #col-product-format="{value}">
                            {{ value === 'Unknown' ? ETC : value }}
                        </template>
                        <template #col-value-format="{value}">
                            {{ currencyMoneyFormatter(value, state.numberFormatterOption) }}
                        </template>
                    </p-data-table>
                </div>
            </div>
            <div v-if="!config.get('COST_REPORT.EXCLUDE.CONTENTS.project')"
                 id="details-by-project"
                 class="data-table-section"
            >
                <p class="title">
                    {{ $t('COMMON.COST_REPORT.DETAILS_BY_PROJECT') }}
                </p>
                <p-data-table :fields="tableState.costByProjectFields"
                              :items="tableState.costByProject"
                              :selectable="false"
                              :disable-copy="true"
                              :disable-hover="true"
                              :loading="state.loading"
                >
                    <template #col-index-format="{rowIndex}">
                        {{ rowIndex + 1 }}
                    </template>
                    <template #col-project_name-format="{value}">
                        {{ value === 'Unknown' ? ETC : value }}
                    </template>
                    <template #col-value_sum-format="{value}">
                        {{ currencyMoneyFormatter(value, state.numberFormatterOption) }}
                    </template>
                </p-data-table>
            </div>
            <div v-if="!config.get('COST_REPORT.EXCLUDE.CONTENTS.service_account')"
                 id="details-by-service-account"
                 class="data-table-section"
            >
                <p class="title">
                    {{ $t('COMMON.COST_REPORT.DETAILS_BY_SERVICE_ACCOUNT') }}
                </p>
                <div v-for="(providerData, idx) in tableState.costByServiceAccount"
                     :key="idx"
                >
                    <table-header :title="storeState.providers[providerData.provider]?.label ?? providerData.provider"
                                  :sub-total="currencyMoneyFormatter(providerData._total_value_sum, state.numberFormatterOption)"
                                  :provider="storeState.providers[providerData.provider]?.label"
                                  :provider-icon-src="storeState.providers[providerData.provider]?.icon"
                    />
                    <p-data-table :fields="tableState.costByServiceAccountFields"
                                  :items="providerData.value_sum"
                                  :skeleton-rows="3"
                                  :stripe="false"
                                  :selectable="false"
                                  :disable-copy="true"
                                  :disable-hover="true"
                                  :loading="state.loading"
                                  class="budget-summary-table"
                    >
                        <template #col-index-format="{rowIndex}">
                            {{ rowIndex + 1 }}
                        </template>
                        <template #col-service_account_name-format="{value}">
                            {{ value === 'Unknown' ? ETC : value }}
                        </template>
                        <template #col-value-format="{value}">
                            {{ currencyMoneyFormatter(value, state.numberFormatterOption) }}
                        </template>
                    </p-data-table>
                </div>
            </div>
        </div>
        <p-icon-button v-if="!state.printMode"
                       name="ic_print"
                       size="lg"
                       class="download-button"
                       style-type="tertiary"
                       @click="handlePrint"
        />
    </div>
</template>

<style lang="postcss" scoped>
.title {
    @apply text-label-xl font-bold;
    margin-bottom: 0.75rem;
}

/* custom design-system component - p-data-table */
:deep(.p-data-table) {
    min-height: 10rem;
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
        min-width: 7.4in;
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

.download-button {
    @apply fixed bottom-0 right-0;
    box-shadow: 0 2px 4px 0 #0000001a;
    margin: 2rem;
    z-index: 100;
}

@media print {
    .download-button {
        display: none;
    }
}
</style>
