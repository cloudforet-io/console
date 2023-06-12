<template>
    <widget-frame v-bind="widgetFrameProps"
                  class="severity-status-by-service"
                  @refresh="refreshWidget"
    >
        <div class="data-container">
            <div class="chart-wrapper"
                 :style="{'grid-template-columns': `repeat(auto-fill, ${state.boxWidth-4}px)`}"
            >
                <div v-for="(data, idx) in state.data"
                     :key="`box-${idx}`"
                     v-tooltip.bottom="`${data.service}: ${data.value}`"
                     class="status-box"
                     :style="{'background-color': SEVERITY_STATUS_MAP[data.severity].color}"
                >
                    <span class="text">{{ data.service }}</span>
                </div>
            </div>
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
<script setup lang="ts">
import type { ComputedRef } from 'vue';
import {
    computed, defineExpose, defineProps, reactive, toRefs,
} from 'vue';

import dayjs from 'dayjs';
import { min } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { DateRange } from '@/services/dashboards/config';
import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrame.vue';
import type { ComplianceStatus, Severity } from '@/services/dashboards/widgets/_configs/asset-config';
import { SEVERITY_STATUS_MAP } from '@/services/dashboards/widgets/_configs/asset-config';
import type { WidgetExpose, WidgetProps } from '@/services/dashboards/widgets/_configs/config';
import { useWidgetFrameProps } from '@/services/dashboards/widgets/_hooks/use-widget-frame-props';
// eslint-disable-next-line import/no-cycle
import { useWidgetLifecycle } from '@/services/dashboards/widgets/_hooks/use-widget-lifecycle';
// eslint-disable-next-line import/no-cycle
import { useWidgetState } from '@/services/dashboards/widgets/_hooks/use-widget-state';


interface Data {
    service: string;
    complianceStatus: ComplianceStatus;
    severity: Severity;
    value: number;
}

const BOX_MIN_WIDTH = 112;
const SEVERITY_PRIORITY_MAP: Record<number, Severity> = {};
Object.values(SEVERITY_STATUS_MAP).forEach((s) => { SEVERITY_PRIORITY_MAP[s.priority] = s.name; });

const DATE_FORMAT = 'YYYY-MM';
const SEVERITY_STATUS_MAP_VALUES = Object.values(SEVERITY_STATUS_MAP);
const props = defineProps<WidgetProps>();
const state = reactive({
    ...toRefs(useWidgetState<Data[]>(props)),
    dateRange: computed<DateRange>(() => ({
        start: dayjs.utc(state.settings?.date_range?.start).format(DATE_FORMAT),
        end: dayjs.utc(state.settings?.date_range?.end).format(DATE_FORMAT),
    })),
    boxWidth: computed<number>(() => {
        if (!props.width) return BOX_MIN_WIDTH;
        const widgetPadding = 24;
        const widgetContentWidth = props.width - (widgetPadding * 2);
        if (props.width >= 990) return widgetContentWidth / 8;
        return widgetContentWidth / 7 < BOX_MIN_WIDTH ? BOX_MIN_WIDTH : widgetContentWidth / 7;
    }),
});
const widgetFrameProps:ComputedRef = useWidgetFrameProps(props, state);


/* Api */
const fetchData = async (): Promise<Data[]> => {
    try {
        const apiQueryHelper = new ApiQueryHelper();
        apiQueryHelper
            .setFilters(state.consoleFilters)
            .addFilter({ k: 'ref_cloud_service_type.labels', v: 'Compliance', o: '=' });
        const results = await SpaceConnector.clientV2.inventory.cloudService.analyze({
            query: {
                group_by: ['data.service'],
                fields: {
                    status: {
                        key: 'data.status',
                        operator: 'add_to_set',
                    },
                    severity: {
                        key: 'data.severity',
                        operator: 'add_to_set',
                    },
                    fail_finding_count: {
                        key: 'data.stats.checks.fail',
                        operator: 'sum',
                    },
                },
                sort: [{
                    key: 'service',
                    desc: false,
                }],
                page: {
                    limit: 80,
                    start: 1,
                },
                ...apiQueryHelper.data,
            },
        });
        return refineData(results);
    } catch (e) {
        ErrorHandler.handleError(e);
        return [];
    }
};


/* Util */
const refineData = (data): Data[] => {
    const { results } = data;
    return results.map((result) => {
        const minSeverityPriority: number = min(result.severity.map((s) => SEVERITY_STATUS_MAP[s].priority)) ?? 0; // ex. 1
        const severity = SEVERITY_PRIORITY_MAP[minSeverityPriority]; // ex. 'CRITICAL'
        const complianceStatus = result.status.includes('FAIL') ? 'FAIL' : 'PASS';
        return {
            service: result.service,
            severity,
            complianceStatus,
            value: result.fail_finding_count,
        };
    });
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
    state,
});
defineExpose<WidgetExpose>({
    initWidget,
    refreshWidget,
});
</script>
<style lang="postcss" scoped>
.severity-status-by-service {
    .data-container {
        .chart-wrapper {
            display: grid;
            grid-auto-flow: row;
            gap: 0.25rem;
            .status-box {
                height: 4.5rem;
                font-weight: 500;
                padding: 0.5rem;
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
