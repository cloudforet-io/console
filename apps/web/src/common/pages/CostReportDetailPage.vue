<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router/composables';

import dayjs from 'dayjs';
import type { PieSeriesOption } from 'echarts/charts';
import type { EChartsType, ComposeOption } from 'echarts/core';
import { init } from 'echarts/core';
import {
    groupBy, sum,
} from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import type { AnalyzeQuery } from '@cloudforet/core-lib/space-connector/type';
import {
    PLink, PDataTable, PIconButton, PI, PButton,
} from '@cloudforet/mirinae';
import type { DataTableFieldType, DataTableField } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';
import { numberFormatter } from '@cloudforet/utils';

import { useCostReportApi } from '@/api-clients/cost-analysis/cost-report/composables/use-cost-report-api';
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

import { MASSIVE_CHART_COLORS } from '@/styles/colorsets';

import ConsoleLogo from '@/services/auth/components/ConsoleLogo.vue';
import { useCostReportDataAnalyzeQuery } from '@/services/cost-explorer/composables/use-cost-report-data-analyze-query';


const router = useRouter();

type CostReportDataAnalyzeResult = {
    [groupBy: string]: string|any;
    value_sum?: Array<{
        [groupBy: string]: string|any;
        value: number
    }>|number;
    _total_value_sum?: number;
};

type AdjustmentProductData = Array<{
    product: string;
    value: number;
}>;
type CostReportDataAnalyzeResultByProduct = {
    [provider: string]: {
        [serviceAccount: string]: Array<{
            [product: string]: CostReportDataAnalyzeResult;
        }>;
    };
};
type CostReportAdjustedDataAnalyzeResultByProvider = {
    [provider: string]: CostReportDataAnalyzeResult[];
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
const { costReportAPI } = useCostReportApi();

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
    isExpired: false,
    chartData: [] as Array<{ name: string; value: number | undefined; itemStyle: { color: string } }>,
    chart: null as EChartsType | null,
    printMode: false,
    collapsedState: {} as Record<string, boolean>,
});

const ETC = config.get('COST_REPORT.ETC_CUSTOM_LABEL') ?? 'ETC';
const currency = computed<Currency>(() => state.baseInfo?.currency ?? 'USD');
const numberFormatterOption = computed<Intl.NumberFormatOptions>(() => ({ currency: currency.value, style: 'decimal', notation: 'standard' }));

/* Query */
const createBaseQueryParams = (_groupBy: string[], fieldGroup?: string[]): AnalyzeQuery|null => {
    if (!state.baseInfo?.cost_report_config_id || !props.costReportId) return null;

    return {
        group_by: _groupBy,
        fields: {
            value_sum: {
                key: `cost.${state.baseInfo?.currency}`,
                operator: 'sum',
            },
        },
        field_group: fieldGroup ?? [],
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
        sort: [{ key: 'value_sum', desc: true }, { key: 'value', desc: true }],
    };
};

const providerQueryParams = computed<AnalyzeQuery|null>(() => createBaseQueryParams(['provider']));
const productQueryParams = computed<AnalyzeQuery|null>(() => createBaseQueryParams(['provider', 'service_account_name', 'product', 'is_adjusted'], ['product']));
const projectQueryParams = computed<AnalyzeQuery|null>(() => createBaseQueryParams(['project_name', 'product', 'is_adjusted'], ['product']));

const { costReportDataAnalyzeData: providerData } = useCostReportDataAnalyzeQuery({
    query: providerQueryParams,
    isCostReportPage: false,
});
const { costReportDataAnalyzeData: productData } = useCostReportDataAnalyzeQuery({
    query: productQueryParams,
    isCostReportPage: false,
});
const { costReportDataAnalyzeData: projectData } = useCostReportDataAnalyzeQuery({
    query: projectQueryParams,
    isCostReportPage: false,
});

/* Computed */
const totalCost = computed<number>(() => sum(costByProviderTableData.value.map((d) => d.value_sum)));
const reportDateRange = computed<string>(() => {
    const baseDate = dayjs(state.baseInfo?.issue_date);
    if (!baseDate) return '';
    const lastMonth = baseDate.subtract(1, 'month');
    const startDate = lastMonth.startOf('month').format('YYYY-MM-DD');
    const endDate = lastMonth.endOf('month').format('YYYY-MM-DD');
    return `${startDate} ~ ${endDate}`;
});
const chartOptions = computed<ComposeOption<PieSeriesOption>>(() => ({
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
            center: ['50%', '50%'],
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
}));
const costByProductFields = computed<DataTableField[]>(() => makeTableFields({
    name: 'product',
    label: 'Product',
}));
const costByProjectFields = computed<DataTableField[]>(() => makeTableFields({
    name: 'project_name',
    label: 'Project',
}, '_total_value_sum'));
const costByProviderFields = computed<DataTableField[]>(() => ([
    {
        name: 'provider',
        label: 'Provider',
    },
    {
        name: 'value_sum',
        label: `Amount (${CURRENCY_SYMBOL[currency.value]})`,
        textAlign: 'right',
        sortable: false,
    },
]));
const costByProductTableData = computed<CostReportDataAnalyzeResultByProduct>(() => getConvertedProductTableData(productData.value?.results || []));
const costByProviderTableData = computed<CostReportDataAnalyzeResult[]>(() => providerData.value?.results || []);
const costByProjectTableData = computed<CostReportDataAnalyzeResult[]>(() => (projectData.value?.results || []).filter((d) => !d.is_adjusted));
const adjustedProviderData = computed<CostReportAdjustedDataAnalyzeResultByProvider>(() => {
    const results: CostReportAdjustedDataAnalyzeResultByProvider = {};
    const adjustedData = (productData.value?.results || []).filter((d) => d.is_adjusted);
    adjustedData.forEach((d) => {
        if (Array.isArray(d.value_sum)) {
            results[d.provider] = d.value_sum;
        }
    });
    return results;
});
const adjustedProjectData = computed<AdjustmentProductData>(() => {
    const adjustedData = (projectData.value?.results || []).filter((d) => d.is_adjusted);
    if (adjustedData.length === 0) return [];
    const valueSum = adjustedData[0].value_sum;
    if (Array.isArray(valueSum)) {
        return valueSum;
    }
    return [];
});

/* Util */
const makeTableFields = (customField:DataTableFieldType, valueFieldName = 'value'): DataTableField[] => ([
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
        label: `Amount (${CURRENCY_SYMBOL[currency.value]})`,
        textAlign: 'right',
        sortable: false,
    },
]);
const getConvertedProductTableData = (rawData: CostReportDataAnalyzeResult[]): CostReportDataAnalyzeResultByProduct => {
    const results: CostReportDataAnalyzeResultByProduct = {};
    const originalData = rawData.filter((d) => !d.is_adjusted);
    const providerGroupBy = groupBy(originalData, 'provider');
    Object.entries(providerGroupBy).forEach(([provider, providerDataItems]) => {
        const accountGroupBy = groupBy(providerDataItems, 'service_account_name');
        Object.entries(accountGroupBy).forEach(([account, accountData]) => {
            const valueSum = accountData[0].value_sum;
            if (Array.isArray(valueSum)) {
                results[provider] = {
                    ...(results[provider] ?? {}),
                    [account]: valueSum.sort((a, b) => b.value - a.value),
                };
            }
        });
    });
    return results;
};
const getFormattedProductTotalValue = (provider: string, serviceAccount: string): string => {
    const productDataItem = (productData.value?.results || []).find((d) => d.provider === provider && d.service_account_name === serviceAccount);
    return currencyMoneyFormatter(productDataItem?._total_value_sum ?? 0, numberFormatterOption.value) ?? '';
};

const drawChart = () => {
    state.chartData = costByProviderTableData.value.map((d) => ({
        name: d.provider,
        value: typeof d.value_sum === 'number' ? d.value_sum : 0,
        itemStyle: {
            color: storeState.providers[d.provider]?.color,
        },
    }));

    state.chart = init(chartContext.value);
    state.chart.setOption(chartOptions.value, true);
};

/* Api */
const fetchReportData = async () => {
    try {
        const { costReportId } = props;
        if (!costReportId) return;
        state.baseInfo = await costReportAPI.get({
            cost_report_id: costReportId,
        });
    } catch (e: any) {
        ErrorHandler.handleError(e);
        await router.push({ name: ERROR_ROUTE.EXPIRED_LINK._NAME });
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

const handleToggleServiceAccountCollapsed = (provider: string, serviceAccount: string) => {
    state.collapsedState = {
        ...state.collapsedState,
        [`${provider}-${serviceAccount}`]: !state.collapsedState[`${provider}-${serviceAccount}`],
    };
};

const handleCollapseAll = () => {
    state.collapsedState = Object.keys(costByProductTableData.value).reduce((acc, key) => {
        Object.keys(costByProductTableData.value[key]).forEach((serviceAccount) => {
            acc[`${key}-${serviceAccount}`] = true;
        });
        return acc;
    }, {} as Record<string, boolean>);
};

(async () => {
    setMetaTag();
    state.loading = true;
    const isSucceeded = await initStatesByUrlSSOToken();
    if (!isSucceeded) return;
    await fetchReportData();
    await setI18nLocale(props.language);
    await providerReferenceStore.load();
    state.loading = false;
    drawChart();
    setRootTagStyle();
})();
</script>

<template>
    <div class="cost-report-detail-page">
        <div class="invoice-container">
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
                    <label>{{ $t('COMMON.COST_REPORT.ISSUE_DATE') }}:</label>{{ state.baseInfo?.issue_date }} <span class="real-date-range">({{ reportDateRange }})</span>
                </p>
            </div>
            <div class="total">
                <p class="title">
                    {{ $t('COMMON.COST_REPORT.TOTAL') }}
                </p>
                <div class="total-value-wrapper">
                    <div class="total-cost">
                        <span class="currency-symbol">{{ CURRENCY_SYMBOL[currency] }}</span>
                        <span class="total-text">{{ currencyMoneyFormatter(totalCost, numberFormatterOption) }}</span>
                    </div>
                    <div class="currency-value">
                        {{ currency }}
                    </div>
                </div>
            </div>
            <div class="index-wrapper">
                <p class="title mb-2">
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
            </div>
            <div v-if="!config.get('COST_REPORT.EXCLUDE.CONTENTS.provider.ui')"
                 id="total-amount-by-provider"
            >
                <div class="table">
                    <div class="data-table-title-wrapper">
                        <p class="title">
                            {{ $t('COMMON.COST_REPORT.DETAILS_BY_PROVIDER') }}
                        </p>
                    </div>
                    <p-data-table :fields="costByProviderFields"
                                  :items="costByProviderTableData"
                                  :selectable="false"
                                  :disable-copy="true"
                                  :disable-hover="true"
                                  :loading="state.loading"
                    >
                        <template #col-provider-format="{item, value}">
                            <div class="legend">
                                <span class="legend-icon"
                                      :style="{ backgroundColor: storeState.providers[value]?.color }"
                                /><span>{{ storeState.providers[value]?.label ?? value }}</span>
                                <span v-if="totalCost && !config.get('COST_REPORT.EXCLUDE.CONTENTS.provider.percentage')"
                                      class="ratio"
                                >{{ ((item.value_sum / totalCost) * 100).toFixed(0) }}%</span>
                            </div>
                        </template>
                        <template #col-value_sum-format="{value}">
                            {{ currencyMoneyFormatter(value, numberFormatterOption) }}
                        </template>
                    </p-data-table>
                </div>
                <div ref="chartContext"
                     class="chart"
                />
            </div>
            <div v-if="!config.get('COST_REPORT.EXCLUDE.CONTENTS.product')"
                 id="details-by-product"
                 class="data-table-section"
            >
                <div class="data-table-title-wrapper">
                    <p class="title">
                        {{ $t('COMMON.COST_REPORT.DETAILS_BY_PRODUCT') }}
                    </p>
                    <p-button name="ic_chevron-down"
                              class="service-account-collapsible-icon"
                              size="sm"
                              style-type="tertiary"
                              icon-left="ic_arrows-collapse-vertical"
                              @click="handleCollapseAll"
                    >
                        {{ $t('COMMON.COST_REPORT.COLLAPSE_ALL') }}
                    </p-button>
                </div>
                <div v-for="({ provider }, idx) in costByProviderTableData"
                     :key="`${provider}-${idx}`"
                     class="mb-6"
                >
                    <table-header :title="storeState.providers[provider]?.label"
                                  :sub-total="currencyMoneyFormatter(costByProviderTableData.find((d) => d.provider === provider)?.value_sum ?? 0, numberFormatterOption)"
                                  :provider-icon-src="storeState.providers[provider]?.icon"
                                  class="table-header"
                    />
                    <div v-for="([serviceAccount, _productData], pIdx) in Object.entries(costByProductTableData[provider] ?? {})"
                         :key="`${provider}-${serviceAccount}-${pIdx}`"
                    >
                        <div class="service-account-collapsible-wrapper"
                             @click="handleToggleServiceAccountCollapsed(provider, serviceAccount)"
                        >
                            <div class="left-part">
                                <p-i :name="state.collapsedState[`${provider}-${serviceAccount}`] ? 'ic_chevron-right' : 'ic_chevron-down'"
                                     class="service-account-collapsible-icon"
                                />
                                {{ serviceAccount === 'Unknown' ? ETC : serviceAccount }}
                            </div>
                            <div class="right-part text-paragraph-md">
                                {{ getFormattedProductTotalValue(provider, serviceAccount) }}
                            </div>
                        </div>
                        <p-data-table v-if="!state.collapsedState[`${provider}-${serviceAccount}`]"
                                      :fields="costByProductFields"
                                      :items="_productData"
                                      :stripe="false"
                                      :selectable="false"
                                      :disable-copy="true"
                                      :disable-hover="true"
                                      :loading="state.loading"
                        >
                            <template #col-index-format="{rowIndex}">
                                {{ rowIndex + 1 }}
                            </template>
                            <template #col-product-format="{value}">
                                {{ value === 'Unknown' ? ETC : value }}
                            </template>
                            <template #col-value-format="{value}">
                                {{ currencyMoneyFormatter(value, numberFormatterOption) }}
                            </template>
                        </p-data-table>
                    </div>
                    <template v-if="adjustedProviderData[provider]">
                        <div v-for="adjustedData in adjustedProviderData[provider]"
                             :key="adjustedData.product"
                             class="adjusted-data-wrapper"
                        >
                            <p class="label">
                                {{ adjustedData.product }}
                            </p>
                            <p class="value">
                                {{ numberFormatter(adjustedData.value) }}
                            </p>
                        </div>
                    </template>
                </div>
            </div>
            <div v-if="!config.get('COST_REPORT.EXCLUDE.CONTENTS.project')"
                 id="details-by-project"
                 class="data-table-section"
            >
                <div class="data-table-title-wrapper">
                    <p class="title">
                        {{ $t('COMMON.COST_REPORT.DETAILS_BY_PROJECT') }}
                    </p>
                </div>
                <p-data-table :fields="costByProjectFields"
                              :items="costByProjectTableData"
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
                    <template #col-_total_value_sum-format="{value}">
                        {{ currencyMoneyFormatter(value, numberFormatterOption) }}
                    </template>
                </p-data-table>
                <template v-for="adjustedData in adjustedProjectData">
                    <div :key="`adjusted-${adjustedData.product}`"
                         class="adjusted-data-wrapper"
                    >
                        <p class="label">
                            {{ adjustedData.product }}
                        </p>
                        <p class="value">
                            {{ numberFormatter(adjustedData.value) }}
                        </p>
                    </div>
                </template>
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
.data-table-title-wrapper {
    @apply flex items-center justify-between;
    padding-bottom: 0.75rem;
}
.title {
    @apply text-label-xl font-bold;
}

/* custom design-system component - p-data-table */
:deep(.p-data-table) {
    min-height: auto;
}

.cost-report-detail-page {
    @apply flex justify-center bg-white;
    font-size: 0.9625rem;
    font-family: Helvetica, Arial, sans-serif;
    color: #232533;
    font-weight: 400;
    overflow: auto;
    .invoice-container {
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
            @apply border-t border-b flex justify-between border-gray-300;
            padding-top: 0.875rem;
            height: 4.75rem;
            border-top-width: 2px;

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
            margin-bottom: 5rem;

            .table-header {
                @apply bg-gray-100;
                padding: 0.75rem 1rem;
                margin-bottom: 0.25rem;
            }
            .service-account-collapsible-wrapper {
                @apply flex items-center justify-between border-b border-gray-300;
                cursor: pointer;
                padding: 0.75rem 1rem;
            }
            .adjusted-data-wrapper {
                @apply flex items-center justify-between border-b border-gray-300 bg-violet-100 text-label-md;
                padding: 0.75rem 1rem;
                .label {
                    @apply font-bold;
                }
            }
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
