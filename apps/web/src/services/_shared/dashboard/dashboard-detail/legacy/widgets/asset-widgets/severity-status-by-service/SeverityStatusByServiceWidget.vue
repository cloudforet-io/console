<script setup lang="ts">
import {
    computed, defineProps, reactive,
} from 'vue';

import { min } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancellable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import { PDataLoader } from '@cloudforet/mirinae';

import type { CloudServiceAnalyzeParameters } from '@/schema/inventory/cloud-service/api-verbs/analyze';

import ErrorHandler from '@/common/composables/error/errorHandler';

import WidgetFrame from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_components/WidgetFrame.vue';
import { useWidgetLifecycle } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_composables/use-widget-lifecycle';
import { useWidget } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_composables/use-widget/use-widget';
import { SEVERITY_STATUS_MAP } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_constants/compliance-constant';
import type { ComplianceStatus, Severity } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_types/compliance-type';
import type { WidgetExpose, WidgetProps, WidgetEmit } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_types/widget-type';


interface Data {
    service: string;
    pass_finding_count: number;
    fail_finding_count: number;
    severity: Severity[];
    status: ComplianceStatus[];
    date: string;
}
interface RefinedData {
    service: string;
    severity: Severity;
    value: number;
}

const BOX_MIN_WIDTH = 112;
const SEVERITY_PRIORITY_MAP: Record<number, Severity> = {};
Object.values(SEVERITY_STATUS_MAP).forEach((s) => { SEVERITY_PRIORITY_MAP[s.priority] = s.name; });

const SEVERITY_STATUS_MAP_VALUES = Object.values(SEVERITY_STATUS_MAP);
const props = defineProps<WidgetProps>();
const emit = defineEmits<WidgetEmit>();

const { widgetState, widgetFrameProps, widgetFrameEventHandlers } = useWidget(props, emit);

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
const fetchCloudServiceAnalyze = getCancellableFetcher<CloudServiceAnalyzeParameters, {results: Data[], more?: boolean}>(SpaceConnector.clientV2.inventory.cloudService.analyze);
const fetchData = async (): Promise<Data[]> => {
    try {
        apiQueryHelper
            .setFilters(widgetState.consoleFilters)
            .addFilter({ k: 'data.status', v: ['PASS', 'FAIL'], o: '=' });
        const { status, response } = await fetchCloudServiceAnalyze({
            query: {
                group_by: ['data.service'],
                fields: {
                    pass_finding_count: {
                        key: 'data.stats.findings.pass',
                        operator: 'sum',
                    },
                    fail_finding_count: {
                        key: 'data.stats.findings.fail',
                        operator: 'sum',
                    },
                    status: {
                        key: 'data.status',
                        operator: 'add_to_set',
                    },
                    severity: {
                        key: 'data.severity',
                        operator: 'add_to_set',
                    },
                },
                sort: [{ key: 'service' }],
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
const _getStatus = (statusList: ComplianceStatus[]): ComplianceStatus => {
    if (statusList.includes('FAIL')) return 'FAIL';
    return 'PASS';
};
const _getSeverity = (severityList: Severity[], status: ComplianceStatus): Severity => {
    let severity: Severity = 'PASS';
    if (status === 'FAIL') {
        const minSeverityPriority = min(severityList.map((d) => SEVERITY_STATUS_MAP[d].priority));
        if (minSeverityPriority) severity = SEVERITY_PRIORITY_MAP[minSeverityPriority];
    }
    return severity;
};
const refineData = (data?: Data[]): RefinedData[] => {
    if (!data?.length) return [];
    const refinedData: RefinedData[] = [];
    data.forEach((d) => {
        if (!d.service) return;
        const status = _getStatus(d.status);
        const severity = _getSeverity(d.severity, status);
        const value: number = status === 'FAIL' ? d.fail_finding_count : d.pass_finding_count;

        refinedData.push({
            service: d.service,
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
    initWidget,
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
                           :loading="props.loading || state.loading"
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
