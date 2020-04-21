<template>
    <div>
        <section>
            <slot name="buttons" :tools="tools" :selectedToolId="selectedToolId">
                <p-select-btn-group class="mb-8" :buttons="tools" :selected.sync="selectedToolId" />
            </slot>
        </section>
        <section class="mb-8">
            <slot name="legends">
                <p class="title">
                    {{ $t('WORD.RESOURCE') }}
                </p>
                <template v-for="(resource, idx) in resources">
                    <div v-if="availableResources[resource.id]" :key="resource.id" class="legend">
                        <span class="flex-shrink-0 rounded-sm h-3 w-3 mr-2"
                              :style="{ backgroundColor: colors[idx] }"
                        />
                        <span v-tooltip.bottom="{content: legendFormatter(resource), delay: 200}"
                              class="truncate"
                        >{{ legendFormatter(resource) }}
                        </span>
                    </div>
                </template>
                <span v-if="showLimitMsg" class="text-gray text-sm">
                    * {{ $t('ACTION.LIMIT_OF', {
                        limitCount: 10,
                        itemName: $t('WORD.RESOURCE')
                    }) }}
                </span>
            </slot>
        </section>
        <section class="flex justify-between border-t border-b border-gray-200 py-4">
            <div class="inline-flex items-center">
                <span class="title mr-1 flex-shrink-0">{{ $t('WORD.TIME_RANGE') }}</span>
                <p-select-btn-group class="time-range" :buttons="timeRanges" :selected.sync="selectedTimeRange" />
            </div>
            <div class="inline-flex items-center">
                <span class="title mr-4 flex-shrink-0">{{ $t('WORD.STATISTICS') }}</span>
                <p-select-dropdown v-model="selectedStat" :items="statItems" />
                <p-icon-button class="ml-4 flex-shrink-0" name="ic_refresh" />
            </div>
        </section>
        <section class="py-4">
            <i18n path="ACTION.TIMEZONE_OF" tag="p" class="text-sm text-gray mb-12">
                <template #timezone>
                    <strong>{{ $t('WORD.LOCAL_TIME') }}</strong>
                </template>
            </i18n>
            <div v-for="metric in metrics" :key="metric.key">
                <p-metric-chart :loading="!chartDatasets[metric.key]"
                                :labels="chartDatasets[metric.key] ? chartDatasets[metric.key].labels : []"
                                :dataset="chartDatasets[metric.key] ? chartDatasets[metric.key].dataset : {}"
                                :colors="colors"
                />
            </div>
        </section>
    </div>
</template>

<script lang="ts">
import {
    computed, defineComponent, reactive, toRefs,
} from '@vue/composition-api';
import {
    monitoringProps,
    MonitoringProps,
    MonitoringResourceType,
} from '@/components/organisms/monitoring/Monitoring.toolset';
import PSelectBtnGroup from '@/components/organisms/buttons/select-btn-group/SelectBtnGroup.vue';
import {
    coral, blue, violet, yellow, green, peacock,
} from '@/styles/colors';
import PSelectDropdown from '@/components/organisms/dropdown/select-dropdown/SelectDropdown.vue';
import _ from 'lodash';
import PIconButton from '@/components/molecules/buttons/IconButton.vue';
import { fluentApi } from '@/lib/fluent-api';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';
import { BtnType } from '@/components/organisms/buttons/select-btn-group/SelectBtnGroup.toolset';
import { MetricResp, STATISTICS_TYPE } from '@/lib/fluent-api/monitoring/type';
import { GetMetricData, MetricList } from '@/lib/fluent-api/monitoring/metric';
import moment, { Moment } from 'moment';
import { getTimestamp } from '@/lib/util';
import PMetricChart from '@/components/organisms/charts/metric-chart/MetricChart.vue';
import { SChartToolSet } from '@/lib/chart/toolset';
import { SLineChart } from '@/lib/chart/line-chart';

export default defineComponent({
    name: 'SMonitoring',
    components: {
        PSelectDropdown,
        PSelectBtnGroup,
        PIconButton,
        PMetricChart,
    },
    props: monitoringProps,
    setup(props: MonitoringProps) {
        console.debug('resources: ', props.resources);
        console.debug('props.dataTools: ', props.dataTools);

        const colors = [coral[500], blue[500], violet[500], yellow[500], green[400], coral[400], peacock[600], coral[200], peacock[400], green[200]];
        const timeRanges = ['1h', '3h', '6h', '12h', '1d', '3d', '1w', '2w'];

        interface State {
            tools: readonly BtnType[];
            selectedToolId: string;
            selectedTimeRange: string;
            statItems: readonly {type: string; label: string; name: string}[];
            selectedStat: STATISTICS_TYPE;
            metrics: MetricResp[];
            availableResources: {[key: string]: boolean};
            loading: boolean;
            chartDatasets: {
                [metricKey: string]: {
                    labels: string[];
                    dataset: {[resourceKey: string]: number[]};
                };
            };
            metricListApi: MetricList;
            metricDataApi: GetMetricData;
        }

        const state: UnwrapRef<State> = reactive({
            tools: computed(() => props.dataTools.map(d => ({
                name: d.id,
                label: d.name,
                vbind: { styleType: 'black', outline: state.selectedToolId !== d.id },
            }))),
            selectedToolId: props.dataTools[0].id,
            selectedTimeRange: '1w',
            statItems: computed(() => props.statisticsTypes.map(d => ({
                type: 'item', label: _.capitalize(d), name: d,
            }))),
            selectedStat: props.statisticsTypes[0],
            metrics: [],
            availableResources: {},
            showLimitMsg: computed(() => {
                let count = 0;
                return _.some(state.availableResources, (v) => {
                    if (v) count++;
                    return count > 10;
                });
            }),
            loading: true,
            chartDatasets: {},
            metricListApi: computed(() => fluentApi.monitoring().metric().list()
                .setResourceType(props.resourceType)
                .setId(state.selectedToolId)
                .setResources(...props.resources.map(d => d.id))),
            metricDataApi: computed(() => fluentApi.monitoring().metric().getData()
                .setId(state.selectedToolId)
                .setResourceType(props.resourceType)
                .setResources(...props.resources.map(d => d.id))
                .setStat(state.selectedStat))
            ,
        });

        const listMetricInfo = async () => {
            state.loading = true;
            state.metrics = [];
            state.availableResources = {};
            state.chartDatasets = {};
            try {
                const res = await state.metricListApi.execute();
                state.availableResources = res.data.available_resources;
                state.metrics = res.data.metrics;
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        const getStartTimestamp = (end: Moment) => {
            const units = state.selectedTimeRange.match(/[^0-9]/g) || [];
            return getTimestamp(end.subtract(
                _.parseInt(state.selectedTimeRange),
                    units[0] as 'w'|'d'|'h',
            ));
        };

        const getMetricData = async (api: GetMetricData, metricKey: string) => {
            // state.metrics.forEach(m => )
            try {
                const res = await api.setMetricKey(metricKey).execute();
                state.chartDatasets[metricKey] = {
                    labels: res.data.labels,
                    dataset: res.data.resource_values,
                };
            } catch (e) {
                console.error(e);
            }
        };

        const listMetrics = async () => {
            const now = moment();
            const api = state.metricDataApi.setEnd(getTimestamp(now))
                .setStart(getStartTimestamp(now));
            try {
                await listMetricInfo();
                await Promise.all(state.metrics.map((m, i) => getMetricData(
                    api,
                    m.key,
                )));
            } catch (e) {
                console.error(e);
            }
        };

        listMetrics();

        return {
            ...toRefs(state),
            colors,
            timeRanges,
            legendFormatter(resource) {
                return resource.name ? `${resource.id}(${resource.name})` : resource.id;
            },
        };
    },
});
</script>

<style lang="postcss" scoped>
    section {
        @apply px-4;
    }
    .title {
        @apply text-sm font-bold capitalize;
    }
    .legend {
        @apply inline-flex items-center text-sm leading-normal mr-4;
        max-width: 17rem;
        margin-top: 0.625rem;
    }
    .time-range::v-deep {
        &.p-select-btn-group .select-btn {
            margin-right: 0;
            padding: 0 0.75rem;
            font-weight: normal;
            &.active {
                @apply text-secondary font-bold;
            }
        }
    }
</style>
