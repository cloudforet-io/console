<script setup lang="ts">
import {
    computed, defineExpose, defineProps, reactive,
} from 'vue';

import { PDataLoader } from '@spaceone/design-system';
import dayjs from 'dayjs';
import { flattenDeep, min } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { DateRange } from '@/services/dashboards/config';
import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrameNew.vue';
import type {
    CloudServiceStatsModel, ComplianceStatus, Severity,
} from '@/services/dashboards/widgets/_configs/asset-config';
import { SEVERITY_STATUS_MAP } from '@/services/dashboards/widgets/_configs/asset-config';
import type { WidgetExpose, WidgetProps, WidgetEmit } from '@/services/dashboards/widgets/_configs/config';
import { useWidgetLifecycle } from '@/services/dashboards/widgets/_hooks/use-widget-lifecycle';
// eslint-disable-next-line import/no-cycle
import { useWidget } from '@/services/dashboards/widgets/_hooks/use-widget/use-widget';


interface Data extends CloudServiceStatsModel {
    service: string;
    value: number;
    severity: Severity[];
    status: ComplianceStatus[];
}
interface RefinedData {
    service: string;
    severity: Severity;
    value: number;
}

const BOX_MIN_WIDTH = 112;
const SEVERITY_PRIORITY_MAP: Record<number, Severity> = {};
Object.values(SEVERITY_STATUS_MAP).forEach((s) => { SEVERITY_PRIORITY_MAP[s.priority] = s.name; });

const DATE_FORMAT = 'YYYY-MM';
const SEVERITY_STATUS_MAP_VALUES = Object.values(SEVERITY_STATUS_MAP);
const props = defineProps<WidgetProps>();
const emit = defineEmits<WidgetEmit>();

const { widgetState, widgetFrameProps, widgetFrameEventHandlers } = useWidget(props, emit, {
    dateRange: computed<DateRange>(() => ({
        end: dayjs.utc(widgetState.settings?.date_range?.end).format(DATE_FORMAT),
    })),
});

const state = reactive({
    loading: true,
    data: null as Data[] | null,
    boxWidth: computed<number>(() => {
        if (!props.width) return BOX_MIN_WIDTH;
        const widgetPadding = 24;
        const widgetContentWidth = props.width - (widgetPadding * 2);
        if (props.width >= 990) return widgetContentWidth / 8;
        return widgetContentWidth / 7 < BOX_MIN_WIDTH ? BOX_MIN_WIDTH : widgetContentWidth / 7;
    }),
    refinedData: computed<RefinedData[]>(() => refineData(state.data)),
});

/* Api */
const apiQueryHelper = new ApiQueryHelper();
const fetchCloudServiceStatsAnalyze = getCancellableFetcher<{results: Data[]}>(SpaceConnector.clientV2.inventory.cloudServiceStats.analyze);
const fetchData = async (): Promise<Data[]> => {
    try {
        apiQueryHelper
            .setFilters(widgetState.cloudServiceStatsConsoleFilters)
            .addFilter({ k: 'ref_cloud_service_type.labels', v: 'Compliance', o: '=' })
            .addFilter({ k: 'key', v: ['fail_finding_count', 'pass_finding_count'], o: '' });
        const prevMonth = dayjs.utc(widgetState.dateRange.end).subtract(1, 'month').format(DATE_FORMAT);
        const { status, response } = await fetchCloudServiceStatsAnalyze({
            query: {
                group_by: ['key', 'unit', 'additional_info.service'],
                granularity: 'MONTHLY',
                start: prevMonth,
                end: widgetState.dateRange.end,
                fields: {
                    value: {
                        key: 'value',
                        operator: 'sum',
                    },
                    status: {
                        key: 'additional_info.status',
                        operator: 'add_to_set',
                    },
                    severity: {
                        key: 'additional_info.severity',
                        operator: 'add_to_set',
                    },
                },
                sort: [{ key: 'service' }, { key: 'key' }],
                page: {
                    limit: 80,
                    start: 1,
                },
                ...apiQueryHelper.data,
            },
        });
        if (status === 'succeed') return response.results;
    } catch (e) {
        ErrorHandler.handleError(e);
    }
    return [];
};


/* Util */
const _getStatus = (targetServiceDataList: Data[]): ComplianceStatus => {
    const statusList = flattenDeep(targetServiceDataList.map((d) => d.status));
    if (statusList.includes('FAIL')) return 'FAIL';
    return 'PASS';
};
const _getSeverity = (targetServiceDataList: Data[], status: ComplianceStatus): Severity => {
    let severity: Severity = 'PASS';
    if (status === 'FAIL') {
        const severityList = flattenDeep(targetServiceDataList.map((d) => d.severity));
        const minSeverityPriority = min(severityList.map((d) => SEVERITY_STATUS_MAP[d].priority));
        if (minSeverityPriority) severity = SEVERITY_PRIORITY_MAP[minSeverityPriority];
    }
    return severity;
};
const _getValue = (targetServiceDataList: Data[], status: ComplianceStatus): number => {
    if (status === 'FAIL') {
        return targetServiceDataList.find((d) => d.key === 'fail_finding_count')?.value ?? 0;
    }
    return targetServiceDataList.find((d) => d.key === 'pass_finding_count')?.value ?? 0;
};
const refineData = (data?: Data[]): RefinedData[] => {
    if (!data?.length) return [];
    const serviceSet = new Set();
    data.forEach((result) => serviceSet.add(result.service));
    const refinedData: RefinedData[] = [];
    serviceSet.forEach((service) => {
        const targetServiceDataList = data.filter((result) => result.service === service);
        const status = _getStatus(targetServiceDataList);
        const severity = _getSeverity(targetServiceDataList, status);
        const value = _getValue(targetServiceDataList, status);

        refinedData.push({
            service: service as string,
            severity,
            value,
        });
    });
    return refinedData;
};
const initWidget = async (data?: Data[]): Promise<Data[]> => {
    state.loading = true;
    state.data = data ?? await fetchData();
    state.loading = false;
    return state.data;
};
const refreshWidget = async (): Promise<Data[]> => {
    state.loading = true;
    state.data = await fetchData();
    state.loading = false;
    return state.data;
};

useWidgetLifecycle({
    disposeWidget: undefined,
    refreshWidget,
    props,
    emit,
    widgetState,
});
defineExpose<WidgetExpose>({
    initWidget,
    refreshWidget,
});
</script>

<template>
    <widget-frame v-bind="widgetFrameProps"
                  class="severity-status-by-service"
                  v-on="widgetFrameEventHandlers"
    >
        <div class="data-container">
            <p-data-loader class="chart-wrapper"
                           :loading="state.loading"
                           :data="state.refinedData"
                           loader-type="skeleton"
                           :loader-backdrop-opacity="1"
                           show-data-from-scratch
            >
                <div class="box-wrapper"
                     :style="{'grid-template-columns': `repeat(auto-fill, ${state.boxWidth-4}px)`}"
                >
                    <div v-for="(data, idx) in state.refinedData"
                         :key="`box-${idx}`"
                         v-tooltip.bottom="`${data.service}: ${data.value}`"
                         class="status-box"
                         :style="{'background-color': SEVERITY_STATUS_MAP[data.severity].color}"
                    >
                        <span class="text">{{ data.service }}</span>
                    </div>
                </div>
            </p-data-loader>
            <div class="legend-wrapper">
                <div v-for="status in SEVERITY_STATUS_MAP_VALUES"
                     :key="`status-${status.label}`"
                     class="legend"
                >
                    <div class="circle"
                         :style="{ 'background-color': status.color }"
                    />
                    <div class="text">
                        {{ status.label }}
                    </div>
                </div>
            </div>
        </div>
    </widget-frame>
</template>

<style lang="postcss" scoped>
.severity-status-by-service {
    .data-container {
        .chart-wrapper {
            min-height: 16.5rem;
            .box-wrapper {
                height: 100%;
                display: grid;
                grid-auto-flow: row;
                gap: 0.25rem;
                .status-box {
                    height: 4.5rem;
                    font-weight: 500;
                    padding: 0.5rem;
                }
            }
        }
        .legend-wrapper {
            @apply text-gray-700 text-label-sm;
            display: flex;
            gap: 0.5rem;
            padding-top: 1rem;
            padding-bottom: 1.5rem;
            .legend {
                display: inline-flex;
                align-items: center;
            }
            .circle {
                @apply rounded-xl;
                width: 0.625rem;
                height: 0.625rem;
                margin-right: 0.25rem;
            }
        }
    }
}
</style>
