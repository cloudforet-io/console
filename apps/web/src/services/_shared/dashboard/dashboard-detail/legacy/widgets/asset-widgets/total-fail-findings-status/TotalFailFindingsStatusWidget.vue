<script setup lang="ts">
import {
    computed, defineProps, reactive, toRef,
} from 'vue';

import { sortBy } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancellable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PProgressBar,
} from '@cloudforet/mirinae';
import { getRGBFromHex, numberFormatter } from '@cloudforet/utils';

import type { CloudServiceAnalyzeParameters } from '@/schema/inventory/cloud-service/api-verbs/analyze';

import ErrorHandler from '@/common/composables/error/errorHandler';

import WidgetFrame from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_components/WidgetFrame.vue';
import { useWidgetColorSet } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_composables/use-widget-color-set';
import { useWidgetLifecycle } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_composables/use-widget-lifecycle';
import { useWidget } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_composables/use-widget/use-widget';
import { SEVERITY_STATUS_MAP } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_constants/compliance-constant';
import type { Severity } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_types/compliance-type';
import type { WidgetProps, WidgetExpose, WidgetEmit } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_types/widget-type';


interface SubData {
    severity: Severity;
    value: number;
}
interface Data {
    pass_finding_count?: SubData[];
    fail_finding_count?: SubData[];
    _total_fail_finding_count?: number;
    _total_pass_finding_count?: number;
}
interface SeverityData {
    name: string;
    label: string;
    color: string;
    rgb: string;
    value: number;
    boxHeight?: number;
}

const SEVERITY_FAIL_STATUS_MAP_VALUES = Object.values(SEVERITY_STATUS_MAP).filter((status) => status.name !== 'PASS');

const props = defineProps<WidgetProps>();
const emit = defineEmits<WidgetEmit>();

const { widgetState, widgetFrameProps, widgetFrameEventHandlers } = useWidget(props, emit);
const { colorSet } = useWidgetColorSet({
    theme: toRef(props, 'theme'),
    dataSize: computed(() => widgetState.widgetConfig.theme?.inherit_count ?? 0),
});
const state = reactive({
    loading: true,
    data: null as Data|null,
    severityData: computed<SeverityData[]>(() => {
        if (!state.data?.fail_finding_count?.length) return [];
        const results: SeverityData[] = [];
        SEVERITY_FAIL_STATUS_MAP_VALUES.forEach((status) => {
            const targetSeverityValue = state.data.fail_finding_count?.find((severity) => severity.severity === status.name)?.value ?? 0;
            results.push({
                ...status,
                value: targetSeverityValue,
                rgb: getRGBFromHex(status.color),
            });
        });
        return setBoxHeightByValue(results);
    }),
    failureRate: computed<number>(() => {
        const passCount = state.data?._total_pass_finding_count ?? 0;
        const failCount = state.data?._total_fail_finding_count ?? 0;
        const totalCount = passCount + failCount;
        return totalCount ? Math.round((failCount / totalCount) * 100) : 0;
    }),
    totalCount: computed<number>(() => {
        const passCount = state.data?._total_pass_finding_count ?? 0;
        const failCount = state.data?._total_fail_finding_count ?? 0;
        return passCount + failCount;
    }),
});

/* API */
const apiQueryHelper = new ApiQueryHelper();
const fetchCloudServiceAnalyze = getCancellableFetcher<CloudServiceAnalyzeParameters, {results: Data[]}>(SpaceConnector.clientV2.inventory.cloudService.analyze);
const fetchRealtimeData = async (): Promise<Data> => {
    try {
        state.loading = true;
        apiQueryHelper
            .setFilters(widgetState.consoleFilters);
        const { status, response } = await fetchCloudServiceAnalyze({
            query: {
                group_by: ['data.severity'],
                fields: {
                    pass_finding_count: {
                        key: 'data.stats.findings.pass',
                        operator: 'sum',
                    },
                    fail_finding_count: {
                        key: 'data.stats.findings.fail',
                        operator: 'sum',
                    },
                },
                field_group: ['severity'],
                ...apiQueryHelper.data,
            },
        });
        if (status === 'succeed') {
            state.loading = false;
            return response.results[0] ?? {};
        }
        return state.data ?? {};
    } catch (e) {
        ErrorHandler.handleError(e);
        state.loading = false;
        return {};
    }
};

/* Util */
const initWidget = async (data?: Data[]): Promise<Data[]> => {
    if (data) {
        state.data = data;
    } else {
        state.data = await fetchRealtimeData();
    }
    return state.data;
};
const refreshWidget = async (): Promise<Data[]> => {
    state.data = await fetchRealtimeData();
    return state.data;
};
const setBoxHeightByValue = (severityDataList: SeverityData[]): SeverityData[] => {
    const sortedResults = sortBy(severityDataList, 'value');
    let boxHeight = 16;
    let prevValue: number;
    sortedResults.forEach((d) => {
        if (prevValue && (prevValue < d.value)) {
            boxHeight += 6;
        }
        prevValue = d.value;
        d.boxHeight = boxHeight;
    });
    return sortBy(sortedResults, 'priority') as SeverityData[];
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
                  class="total-fail-findings-status"
                  v-on="widgetFrameEventHandlers"
    >
        <div class="data-container">
            <div class="summary-wrapper">
                <p class="title">
                    Total failure count
                </p>
                <div class="count-wrapper">
                    <div class="left-part">
                        {{ numberFormatter(state.data?._total_fail_finding_count) }}
                    </div>
                    <div class="right-part">
                        <span class="text">out of </span>
                        <span class="count">{{ numberFormatter(state.totalCount) }}</span>
                    </div>
                </div>
            </div>
            <p-progress-bar :percentage="state.failureRate"
                            height="1.5rem"
                            :color="colorSet[0]"
            />
            <div class="rate-text">
                {{ state.failureRate }}%
            </div>
            <div class="severity-wrapper">
                <p class="title">
                    Severity
                </p>
                <div class="box-wrapper">
                    <div v-for="(data, idx) in state.severityData"
                         :key="`severity-status-box-${idx}`"
                         class="severity-status-box"
                         :style="{'background-color': `rgba(${data.rgb.r}, ${data.rgb.g}, ${data.rgb.b}, 0.7)`, 'height': `${data.boxHeight}%`}"
                    >
                        <div class="text">
                            {{ data.label }}
                        </div>
                        <div class="count">
                            {{ numberFormatter(data.value) }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </widget-frame>
</template>

<style lang="postcss" scoped>
.total-fail-findings-status {
    .data-container {
        .summary-wrapper {
            .title {
                @apply text-label-lg;
                padding-bottom: 0.25rem;
            }
            .count-wrapper {
                display: flex;
                justify-content: space-between;
                padding-bottom: 0.5rem;
                .left-part {
                    @apply text-display-lg;
                    font-weight: 700;
                }
                .right-part {
                    display: flex;
                    align-items: flex-end;
                    .text {
                        @apply text-gray-600 text-label-lg;
                        padding-right: 0.25rem;
                    }
                    .count {
                        @apply text-display-md;
                        font-weight: 500;
                    }
                }
            }
        }
        .rate-text {
            @apply text-display-md;
            padding-top: 0.5rem;
        }
        .severity-wrapper {
            padding: 1rem 0;
            .title {
                @apply text-label-lg;
                padding-bottom: 0.25rem;
            }
            .box-wrapper {
                height: 11.5rem;
                .severity-status-box {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0 0.5rem;
                    .text {
                        @apply text-gray-800 text-label-md;
                    }
                    .count {
                        @apply text-label-lg;
                    }
                }
            }
        }
    }
}
</style>
