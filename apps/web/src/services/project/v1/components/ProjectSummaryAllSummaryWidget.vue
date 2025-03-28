<script lang="ts" setup>
import {
    computed, onUnmounted, reactive, ref, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';
import type { Location } from 'vue-router';

import type { TimeUnit } from '@amcharts/amcharts5/.internal/core/util/Time';
import type { XYChart } from '@amcharts/amcharts5/xy';
import type { Unit } from 'bytes';
import dayjs from 'dayjs';
import {
    cloneDeep, forEach, orderBy, range,
} from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PBalloonTab, PSelectButton, PDataLoader, PSkeleton, PSpinner,
} from '@cloudforet/mirinae';
import { byteFormatter, numberFormatter } from '@cloudforet/utils';

import { i18n } from '@/translations';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProviderReferenceMap } from '@/store/reference/provider-reference-store';

import { MENU_ID } from '@/lib/menu/config';
import { arrayToQueryString } from '@/lib/router-query-string';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import { useContentsAccessibility } from '@/common/composables/contents-accessibility';
import ErrorHandler from '@/common/composables/error/errorHandler';

import {
    primary,
} from '@/styles/colors';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import type {
    CloudServiceDetailPageUrlQuery,
    CloudServiceMainPageUrlQuery,
} from '@/services/asset-inventory/types/cloud-service-page-type';
import ProjectSummaryAllSummaryWidgetRegionService
    from '@/services/project/v1/components/ProjectSummaryAllSummaryWidgetRegionService.vue';
import { SERVICE_CATEGORY } from '@/services/project/v1/constants/project-summary-constant';
import type { DateType, ServiceCategory } from '@/services/project/v1/types/project-summary-type';


interface ChartData {
    date: string;
    count: number;
}
interface SummaryData {
    type: string;
    provider: string;
    label: string | TranslateResult;
    count: number | string;
    to: string | Location;
    color?: string;
}

interface Props {
    projectId: string;
}
const props = defineProps<Props>();

const DAY_COUNT = 14;
const MONTH_COUNT = 12;
const allReferenceStore = useAllReferenceStore();

const chartContext = ref<HTMLElement|null>(null);
const chartHelper = useAmcharts5(chartContext);
const userWorkspaceStore = useUserWorkspaceStore();

const { visibleContents } = useContentsAccessibility(MENU_ID.ASSET_INVENTORY);

const storeState = reactive({
    providers: computed<ProviderReferenceMap>(() => allReferenceStore.getters.provider),
    currentWorkspaceId: computed<string|undefined>(() => userWorkspaceStore.getters.currentWorkspaceId),
});
const state = reactive({
    loading: true,
    summaryLoading: true,
    chart: null as null | XYChart,
    skeletons: range(4),
    //
    selectedDateType: 'DAILY' as DateType,
    dateTypes: computed(() => ([
        { name: 'DAILY', label: i18n.t('COMMON.WIDGETS.ALL_SUMMARY.DAY') },
        { name: 'MONTHLY', label: i18n.t('COMMON.WIDGETS.ALL_SUMMARY.MONTH') },
    ])),
    //
    storageSuffix: 'TB' as Unit,
    storageTrendSuffix: 'TB' as Unit,
    tabs: Object.values(SERVICE_CATEGORY),
    activeTab: SERVICE_CATEGORY.SERVER as ServiceCategory,
    labelMap: computed(() => ({
        [SERVICE_CATEGORY.SERVER]: i18n.t('COMMON.WIDGETS.ALL_SUMMARY.SERVER'),
        [SERVICE_CATEGORY.CONTAINER]: i18n.t('COMMON.WIDGETS.ALL_SUMMARY.CONTAINER'),
        [SERVICE_CATEGORY.DATABASE]: i18n.t('COMMON.WIDGETS.ALL_SUMMARY.DATABASE'),
        [SERVICE_CATEGORY.NETWORKING]: i18n.t('COMMON.WIDGETS.ALL_SUMMARY.NETWORKING'),
        [SERVICE_CATEGORY.STORAGE]: i18n.t('COMMON.WIDGETS.ALL_SUMMARY.STORAGE'),
        [SERVICE_CATEGORY.SECURITY]: i18n.t('COMMON.WIDGETS.ALL_SUMMARY.SECURITY'),
        [SERVICE_CATEGORY.ANALYTICS]: i18n.t('COMMON.WIDGETS.ALL_SUMMARY.ANALYTICS'),
        [SERVICE_CATEGORY.ALL]: i18n.t('COMMON.WIDGETS.ALL_SUMMARY.ALL'),
    })),
    countMap: {},
    summaryData: [] as SummaryData[],
});
const chartState = reactive({
    loading: true,
    registry: {},
    data: [] as ChartData[],
});

/* Util */
const drawChart = () => {
    // refresh root for deleting previous chart
    chartHelper.refreshRoot();

    // set date formatter for tooltip text
    if (state.selectedDateType === 'DAILY') {
        chartHelper.root.value?.dateFormatter.setAll({
            dateFormat: 'd MMM, yyyy',
            dateFields: ['valueX'],
        });
    }

    let timeUnit: TimeUnit = 'day';
    if (state.selectedDateType === 'MONTHLY') timeUnit = 'month';

    const { chart, xAxis, yAxis } = chartHelper.createXYDateChart({
        paddingLeft: -5,
        paddingTop: 10,
        paddingBottom: 0,
    });

    // set base interval of xAxis
    xAxis.get('baseInterval').timeUnit = timeUnit;
    yAxis.set('extraMax', 0.02);

    // create column series
    const columnSeries = chartHelper.createXYColumnSeries(chart, {
        name: 'date',
        valueYField: 'count',
        stacked: true,
    });
    columnSeries.columns.template.setAll({
        width: chartHelper.percent(25),
        cornerRadiusTL: 3,
        cornerRadiusTR: 3,
    });

    // set data processor
    let dateFormat = 'yyyy-MM-dd';
    if (state.selectedDateType === 'MONTHLY') dateFormat = 'yyyy-MM';
    columnSeries.data.processor = chartHelper.createDataProcessor({
        dateFormat,
        dateFields: ['date'],
    });

    // create bullet
    columnSeries.bullets.push(() => {
        const label = chartHelper.createLabel({
            text: '{bulletText}',
            populateText: true,
            fontSize: 14,
            fill: chartHelper.color(primary),
            textAlign: 'center',
            centerX: chartHelper.percent(50),
            centerY: chartHelper.percent(80),
        });
        return chartHelper.createBullet({
            locationX: 0.5,
            locationY: 1,
            sprite: label,
            dynamic: true,
        });
    });

    // set series to chart and set data
    columnSeries.data.setAll(cloneDeep(chartState.data));
    chart.series.push(columnSeries);

    // create tooltip
    const tooltip = chartHelper.createTooltip();
    chartHelper.setXYSingleTooltipText(chart, tooltip);
    columnSeries.set('tooltip', tooltip);

    state.chart = chart;
};
const getLocation = (type: ServiceCategory) => {
    const query: CloudServiceMainPageUrlQuery = {
        project: arrayToQueryString([props.projectId]),
    };
    if (type !== SERVICE_CATEGORY.ALL) {
        query.service = type;
    }
    const location: Location = {
        name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE._NAME,
        query,
    };
    return location;
};

/* Api */
const getCloudServiceSummary = async () => {
    try {
        state.summaryLoading = true;
        const { results } = await SpaceConnector.client.statistics.topic.cloudServiceSummary({
            project_id: props.projectId,
            labels: Object.values(SERVICE_CATEGORY),
            workspace_id: storeState.currentWorkspaceId,
        });

        state.countMap = {};
        Object.values(SERVICE_CATEGORY).forEach((serviceName) => {
            const result = results.find((d) => d.label === serviceName);
            const count = result?.total || 0;
            state.countMap[serviceName] = count;
            if (serviceName === SERVICE_CATEGORY.STORAGE) {
                state.storageSuffix = byteFormatter(count).split(' ')[1] as Unit;
            }
        });
    } catch (e) {
        state.countMap = {};
        ErrorHandler.handleError(e);
    } finally {
        state.summaryLoading = false;
    }
};
const getTrend = async (type) => {
    const dateRange = state.selectedDateType === 'MONTHLY' ? MONTH_COUNT : DAY_COUNT;
    const dateUnit = state.selectedDateType === 'MONTHLY' ? 'month' : 'day';
    const dateFormat = state.selectedDateType === 'MONTHLY' ? 'YYYY-MM' : 'YYYY-MM-DD';

    try {
        const param: any = {
            granularity: state.selectedDateType,
            project_id: props.projectId,
        };
        if (type !== SERVICE_CATEGORY.ALL) param.label = type;
        const res = await SpaceConnector.client.statistics.topic.dailyCloudServiceSummary({
            ...param,
            workspace_id: storeState.currentWorkspaceId,
        });
        const data = res.results;

        if (type === SERVICE_CATEGORY.STORAGE) {
            const smallestCount = Math.min(...data.map((d) => d.total));
            const formattedSize = byteFormatter(smallestCount);
            if (formattedSize) state.storageTrendSuffix = formattedSize.split(' ')[1] as Unit;
        }
        const chartData = data.map((d) => {
            let count = d.total;
            if (type === SERVICE_CATEGORY.STORAGE) {
                const formattedSize = byteFormatter(d.total, { unit: state.storageTrendSuffix });
                if (formattedSize) count = formattedSize.split(' ')[0];
            }
            return {
                date: d.date,
                count,
            };
        });

        forEach(range(0, dateRange), (i) => {
            const date = dayjs.utc().subtract(i, dateUnit);
            if (chartData.find((d) => date.format(dateFormat) === d.date)) {
                chartData.push(chartData.find((d) => date.format(dateFormat) === d.date));
            } else {
                chartData.push({ date: date.format(dateFormat), count: null });
            }
        });

        const orderedData = orderBy(chartData, ['date'], ['asc']);
        chartState.data = orderedData.map((d, idx) => {
            let bulletText: string|undefined;
            if (idx % 3 === 1) {
                if (type !== SERVICE_CATEGORY.STORAGE) {
                    bulletText = numberFormatter(d.count, { notation: 'compact' });
                } else {
                    bulletText = d.count;
                }
            }
            return {
                date: d.date,
                count: d.count,
                bulletText,
            };
        });
    } catch (e) {
        ErrorHandler.handleError(e);
        chartState.data = [];
    }
};
const apiQueryHelper = new ApiQueryHelper();
const getApiParameter = (type) => {
    apiQueryHelper
        .setSort('count', true)
        .setFilters([{ k: 'project_id', v: props.projectId, o: '=' }]);
    const defaultParam: any = {
        query: apiQueryHelper.data,
    };
    if (type !== SERVICE_CATEGORY.ALL) defaultParam.labels = [type];
    if (type !== SERVICE_CATEGORY.STORAGE) {
        return {
            ...defaultParam,
            is_primary: true,
        };
    }

    // STORAGE
    apiQueryHelper.setSort('size', true);
    return {
        ...defaultParam,
        is_major: true,
        query: apiQueryHelper.data,
        fields: [{
            name: 'size',
            operator: 'sum',
            key: 'data.size',
        }],
    };
};
const getSummaryInfo = async (type) => {
    try {
        state.loading = true;
        const param = getApiParameter(type);
        const res = await SpaceConnector.client.statistics.topic.cloudServiceResources({
            ...param,
            workspace_id: storeState.currentWorkspaceId,
        });
        const summaryData: SummaryData[] = [];
        const query: CloudServiceDetailPageUrlQuery = {
            project: arrayToQueryString([props.projectId]),
        };

        res.results.forEach((d) => {
            summaryData.push({
                provider: d.provider,
                label: storeState.providers[d.provider]?.label,
                type: d.display_name || d.cloud_service_group,
                count: type === SERVICE_CATEGORY.STORAGE ? byteFormatter(d.size) : numberFormatter(d.count),
                to: {
                    name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
                    params: {
                        provider: d.provider,
                        group: d.cloud_service_group,
                        name: d.cloud_service_type,
                    },
                    query,
                },
                color: storeState.providers[d.provider]?.color,
            });
        });
        state.summaryData = summaryData;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.summaryData = [];
    } finally {
        state.loading = false;
    }
};

/* Event */
const handleChangeTab = async (type) => {
    await Promise.all([getSummaryInfo(type), getTrend(type)]);
    drawChart();
};
const handleChangeDateType = async (dateType: DateType) => {
    state.selectedDateType = dateType;
    await getTrend(state.activeTab);
    drawChart();
};

/* Init */
(async () => {
    await getCloudServiceSummary();
})();
const chartInit = async () => {
    await getTrend(SERVICE_CATEGORY.SERVER);
    setTimeout(() => {
        chartState.loading = false;
    }, 300);
};
chartInit();

/* Watcher */
watch(() => storeState.providers, (providers) => {
    if (providers) getSummaryInfo(SERVICE_CATEGORY.SERVER);
}, { immediate: true });
watch([() => chartState.loading, () => chartContext.value], async ([loading, _chartContext]) => {
    if (!loading && _chartContext) {
        drawChart();
    }
}, { immediate: true });

onUnmounted(() => {
    if (state.chart) state.chart.dispose();
});
</script>

<template>
    <div>
        <div class="title">
            <span>{{ $t('COMMON.WIDGETS.ALL_SUMMARY.TITLE') }}</span>
        </div>
        <p-balloon-tab v-model="state.activeTab"
                       size="sm"
                       style-type="primary"
                       :tabs="state.tabs"
                       tail
                       @change="handleChangeTab"
        >
            <template #tab="{name}">
                <div class="box"
                     :class="{selected: name === state.activeTab}"
                >
                    <span>{{ state.labelMap[name] }}</span>
                    <span v-if="name === SERVICE_CATEGORY.STORAGE"
                          class="suffix"
                    >({{ state.storageSuffix }})</span>
                    <p-spinner v-if="state.summaryLoading"
                               size="sm"
                    />
                    <span v-else
                          class="count"
                    > {{ name === SERVICE_CATEGORY.STORAGE ? byteFormatter(state.countMap[name]).split(' ')[0] : numberFormatter(state.countMap[name]) }}</span>
                </div>
            </template>
        </p-balloon-tab>
        <div class="bottom-part">
            <div class="content-wrapper">
                <div class="chart-wrapper">
                    <div class="sub-title">
                        <span>{{ $t('COMMON.WIDGETS.ALL_SUMMARY.TREND_TITLE') }}</span>
                        <span v-if="state.activeTab === SERVICE_CATEGORY.STORAGE"
                              class="suffix"
                        >({{ state.storageTrendSuffix }})</span>
                    </div>
                    <div class="toggle-button-group">
                        <p-select-button v-for="(d, idx) in state.dateTypes"
                                         :key="`date-${d.name}-${idx}`"
                                         :class="{'selected': state.selectedDateType === d.name}"
                                         style-type="gray"
                                         size="sm"
                                         @click="handleChangeDateType(d.name)"
                        >
                            {{ d.label }}
                        </p-select-button>
                    </div>
                    <p-data-loader :loading="chartState.loading">
                        <template #loader>
                            <p-skeleton width="100%"
                                        height="100%"
                            />
                        </template>
                        <div ref="chartContext"
                             class="chart"
                        />
                    </p-data-loader>
                </div>
                <div class="summary-wrapper">
                    <div class="sub-title">
                        {{ $t('COMMON.WIDGETS.ALL_SUMMARY.TYPE_TITLE', { service: state.labelMap[state.activeTab] }) }}
                    </div>
                    <template v-if="!state.loading && state.summaryData.length > 0">
                        <div class="summary-content-wrapper">
                            <component :is="visibleContents ? 'router-link' : 'div'"
                                       class="summary-row"
                                       :class="{ 'text-only': !visibleContents }"
                                       :to="getLocation(state.activeTab)"
                            >
                                <div class="text-group">
                                    <span>{{ $t('COMMON.WIDGETS.ALL_SUMMARY.ALL') }}</span>
                                </div>
                                <span class="count">
                                    {{ state.activeTab === SERVICE_CATEGORY.STORAGE ? byteFormatter(state.countMap[state.activeTab]) : numberFormatter(state.countMap[state.activeTab]) }}
                                </span>
                            </component>
                            <component :is="visibleContents ? 'router-link' : 'div'"
                                       v-for="(data, idx) of state.summaryData"
                                       :key="idx"
                                       class="summary-row"
                                       :class="{ 'text-only': !visibleContents }"
                                       :to="data.to"
                            >
                                <div class="text-group">
                                    <span class="provider"
                                          :style="{ color: data.color }"
                                    >{{ data.label }}</span>
                                    <span class="type">{{ data.type }}</span>
                                </div>
                                <span class="count">{{ data.count }}</span>
                            </component>
                        </div>
                    </template>
                    <template v-else-if="!state.loading">
                        <div class="summary-content-wrapper no-data-wrapper">
                            <div class="m-auto">
                                <img src="@/assets/images/illust_cloud.svg"
                                     class="empty-image hidden lg:block"
                                >
                                <p class="text">
                                    {{ $t('COMMON.WIDGETS.ALL_SUMMARY.NO_SERVICE', { service: state.labelMap[state.activeTab] }) }}
                                </p>
                            </div>
                        </div>
                    </template>
                    <template v-else>
                        <div v-for="v in state.skeletons"
                             :key="v"
                             class="flex items-center p-2 col-span-3"
                        >
                            <p-skeleton class="flex-grow" />
                        </div>
                    </template>
                </div>
                <div class="region-service-wrapper">
                    <div class="sub-title">
                        <span>{{ $t('COMMON.WIDGETS.ALL_SUMMARY.REGION_SERVICE_TITLE') }}</span>
                    </div>
                    <project-summary-all-summary-widget-region-service
                        :project-id="projectId"
                        :label="state.activeTab"
                        :count="state.countMap[state.activeTab]"
                        :visible-contents="visibleContents"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.title {
    font-size: 1.5rem;
    line-height: 1.6;
    margin-bottom: 0.5rem;
}
.sub-title {
    font-size: 0.875rem;
    line-height: 1.5;
    font-weight: bold;
    margin-bottom: 1rem;
    .suffix {
        font-size: 0.75rem;
        font-weight: normal;
        padding-left: 0.5rem;
    }
}
.box {
    display: flex;
    align-items: center;
    .suffix {
        @apply text-gray-500;
        font-size: 0.75rem;
        padding-left: 0.125rem;
    }
    .count {
        @apply text-primary1;
        font-weight: bold;
        padding-left: 0.25rem;
    }

    &.selected {
        .suffix, .count {
            @apply text-white;
        }
    }
    .p-spinner {
        padding-left: 0.25rem;
    }
}

/* custom design-system component - p-balloon-tab */
:deep(.p-balloon-tab) {
    .tab-pane {
        padding-bottom: 0;
    }
}
.bottom-part {
    margin-top: 0.625rem;

    .content-wrapper {
        @apply bg-white border border-gray-200 rounded-md grid-cols-12 gap-2;
        position: relative;
        display: grid;
        height: auto;
        padding: 1rem;

        @screen lg {
            height: 17.5rem;
        }

        .chart-wrapper {
            @apply col-span-12;
            position: relative;

            @apply lg:col-span-7;
            .toggle-button-group {
                position: absolute;
                right: 0.5rem;
                top: 0;
                .p-select-button {
                    margin-right: 0.375rem;
                    min-width: 2.4375rem;
                }
            }
            .chart {
                height: 13rem;
            }
        }
        .summary-wrapper {
            @apply col-span-12 md:col-span-4 lg:col-span-2;

            .sub-title {
                padding-left: 0.5rem;
            }
            .summary-content-wrapper {
                height: 5rem;
                overflow-y: auto;
                overflow-x: hidden;

                @screen lg {
                    height: 13rem;
                }

                &.no-data-wrapper {
                    display: grid;
                    .empty-image {
                        margin: 0 auto 0.5rem auto;
                    }

                    .text {
                        @apply text-primary2;
                        font-size: 0.875rem;
                        font-weight: bold;
                        line-height: 1.5;
                        text-align: center;
                        opacity: 0.7;
                        margin-bottom: 0.625rem;
                    }
                }
            }
            .summary-row {
                position: relative;
                display: block;
                font-size: 0.875rem;
                line-height: 1.2;
                cursor: pointer;
                padding: 0.25rem 0.5rem;
                margin: auto 0;

                &.text-only {
                    cursor: default;
                }

                &:not(.text-only) {
                    &:hover {
                        @apply bg-secondary2;
                        .provider {
                            text-decoration: underline;
                        }
                        .type {
                            text-decoration: underline;
                        }
                        .count {
                            text-decoration: underline;
                        }
                    }
                }

                .text-group {
                    display: inline-block;
                    width: 80%;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;

                    .type {
                        padding-left: 0.5rem;
                    }
                }

                .count {
                    @apply text-gray-600;
                    position: absolute;
                    right: 0.5rem;
                }
            }
        }
        .region-service-wrapper {
            @apply col-span-12 md:col-span-5 lg:col-span-3;

            .sub-title {
                padding-left: 0.5rem;
            }
        }
    }
}
</style>
