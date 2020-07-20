<template>
    <div class="pt-8 pb-16">
        <section>
            <slot name="buttons" :tools="tools" :selectedToolId="selectedToolId">
                <p-select-btn-group class="mb-8" :buttons="tools" :selected.sync="selectedToolId" />
            </slot>
        </section>
        <section class="mb-8">
            <slot name="legends">
                <span class="title">
                    {{ $t('WORD.RESOURCE') }}
                </span>
                <span class="ml-4 text-gray text-sm">
                    * {{ $t('ACTION.LIMIT_OF', {
                        limitCount: 10,
                        itemName: $t('WORD.RESOURCE')
                    }) }}
                </span>
                <div>
                    <div v-for="(resource, idx) in availableResources" :key="resource.id" class="legend">
                        <span class="flex-shrink-0 rounded-sm h-3 w-3 mr-2"
                              :style="{ backgroundColor: colors[idx] }"
                        />
                        <span v-tooltip.bottom="{content: legendFormatter(resource), delay: 200}"
                              class="truncate"
                        >{{ legendFormatter(resource) }}
                        </span>
                    </div>
                </div>
            </slot>
        </section>
        <section class="toolbox-section">
            <div class="inline-flex items-center">
                <span class="title mr-1 flex-shrink-0">{{ $t('WORD.TIME_RANGE') }}</span>
                <p-select-btn-group class="time-range" :buttons="timeRanges" :selected.sync="selectedTimeRange" />
            </div>
            <div class="inline-flex items-center">
                <span class="title mr-4 flex-shrink-0">{{ $t('WORD.STATISTICS') }}</span>
                <p-select-dropdown v-model="selectedStat" :items="statItems" />
                <p-icon-button class="ml-4 flex-shrink-0" name="ic_refresh" @click="listChartMetrics" />
            </div>
        </section>
        <section class="py-4">
            <i18n path="ACTION.TIMEZONE_OF" tag="p" class="text-sm text-gray mb-12">
                <template #timezone>
                    <strong>{{ $t('WORD.LOCAL_TIME') }}</strong>
                </template>
            </i18n>
            <div v-if="metricsLoading">
                <p-lottie name="spinner" auto />
            </div>
            <div v-else-if="metrics.length === 0" class="text-center text-gray">
                No Metrics
            </div>
            <template v-else>
                <p-grid-layout :items="chartMetrics" row-gap="3rem" column-gap="1rem"
                               card-height="auto"
                               card-min-width="23.125rem"
                               card-max-width="23.125rem"
                               :card-class="() => []"
                >
                    <template #card="{item, index}">
                        <p-metric-chart :loading="chartMetrics[index].loading"
                                        :labels="chartMetrics[index].labels"
                                        :dataset="chartMetrics[index].dataset"
                                        :colors="colors"
                                        :unit="item.metric.unit"
                                        :title="item.metric.name"
                                        :error="item.error"
                        />
                    </template>
                </p-grid-layout>
                <p-button v-if="chartMetrics.length !== metrics.length"
                          :outline="true"
                          style-type="black" class="more-btn"
                          @click="loadChartMetrics"
                >
                    MORE
                </p-button>
            </template>
        </section>
    </div>
</template>

<script lang="ts">
import {
    computed, defineComponent, onMounted, reactive, toRefs, watch,
} from '@vue/composition-api';
import {
    monitoringProps,
    MonitoringProps,
    MonitoringResourceType,
} from '@/components/organisms/monitoring/Monitoring.toolset';
import PSelectBtnGroup from '@/components/organisms/buttons/select-btn-group/SelectBtnGroup.vue';
import {
    blue, coral, green, peacock, violet, yellow,
} from '@/styles/colors';
import PSelectDropdown from '@/components/organisms/dropdown/select-dropdown/SelectDropdown.vue';
import _ from 'lodash';
import PIconButton from '@/components/molecules/buttons/icon-button/PIconButton.vue';
import { fluentApi, TimeStamp } from '@/lib/fluent-api';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';
import { BtnType } from '@/components/organisms/buttons/select-btn-group/SelectBtnGroup.toolset';
import {
    DataSourceResp,
    MetricListResp, MetricResp, MONITORING_TYPE, STATISTICS_TYPE,
} from '@/lib/fluent-api/monitoring/type';
import { GetMetricData, MetricList } from '@/lib/fluent-api/monitoring/metric';
import moment, { Moment } from 'moment';
import { getTimestamp } from '@/lib/util';
import PMetricChart from '@/components/organisms/charts/metric-chart/MetricChart.vue';
import PGridLayout from '@/components/molecules/layouts/grid-layout/PGridLayout.vue';
import PLottie from '@/components/molecules/lottie/PLottie.vue';
import PButton from '@/components/atoms/buttons/PButton.vue';

export default {
    name: 'SMonitoring',
    components: {
        PButton,
        PLottie,
        PGridLayout,
        PSelectDropdown,
        PSelectBtnGroup,
        PIconButton,
        PMetricChart,
    },
    props: monitoringProps,
    setup(props: MonitoringProps) {
        const colors = [coral[500], blue[500], violet[500], yellow[500], green[400], coral[400], peacock[600], coral[200], peacock[400], green[200]];
        const timeRanges = ['1h', '3h', '6h', '12h', '1d', '3d', '1w', '2w'];
        const LOAD_LIMIT = 12;

        interface ChartMetric {
            loading: boolean;
            labels: string[];
            dataset: {[resourceKey: string]: number[]};
            metric: MetricResp;
            error?: boolean;
        }

        interface DataToolType {
            id: string;
            name: string;
            statisticsTypes: STATISTICS_TYPE[];
        }

        interface State {
            dataTools: DataToolType[];
            tools: readonly BtnType[];
            selectedToolId: string;
            selectedTimeRange: string;
            statisticsTypes: readonly STATISTICS_TYPE[];
            statItems: readonly {type: string; label: string; name: string}[];
            selectedStat: STATISTICS_TYPE;
            metricsLoading: boolean;
            metrics: MetricResp[];
            chartMetrics: ChartMetric[];
            availableResources: MonitoringResourceType[];
            noData: boolean;
            metricListApi: MetricList;
            chartMetricApi: GetMetricData;
        }

        const state: UnwrapRef<State> = reactive({
            dataTools: [],
            selectedToolId: '',
            tools: computed(() => state.dataTools.map(d => ({
                name: d.id,
                label: d.name,
                vbind: { styleType: 'black', outline: state.selectedToolId !== d.id },
            }))),
            selectedTimeRange: '1h',
            statisticsTypes: computed(() => {
                const tool = _.find(
                    state.dataTools,
                    { id: state.selectedToolId },
                );
                return tool ? tool.statisticsTypes : [STATISTICS_TYPE.average];
            }),
            statItems: computed(() => state.statisticsTypes.map(d => ({
                type: 'item', label: _.capitalize(d), name: d,
            }))),
            selectedStat: STATISTICS_TYPE.average,
            metricsLoading: true,
            metrics: [],
            chartMetrics: [],
            availableResources: [],
            noData: false,
            metricListApi: computed(() => fluentApi.monitoring().metric().list()
                .setResourceType(props.resourceType)
                .setId(state.selectedToolId)
                .setResources(...props.resources.map(d => d.id))),
            chartMetricApi: computed(() => fluentApi.monitoring().metric().getData()
                .setId(state.selectedToolId)
                .setResourceType(props.resourceType)
                .setStat(state.selectedStat)),
        });

        const dataSourceApi = fluentApi.monitoring().dataSource().list().setMonitoringType(MONITORING_TYPE.metric);

        const listDataSources = async () => {
            try {
                const res = await dataSourceApi.execute();
                state.dataTools = _.chain(res.data.results)
                    .map((d) => {
                        if (d.plugin_info.options.supported_resource_type.some(t => props.resourceType === t)) {
                            return {
                                id: d.data_source_id,
                                name: d.name,
                                statisticsTypes: d.plugin_info.options.supported_stat || [STATISTICS_TYPE.average],
                            };
                        }
                        return undefined;
                    }).compact().uniqBy('id')
                    .value();
                state.selectedToolId = state.dataTools[0].id;
            } catch (e) {
                console.error(e);
            }
        };

        const listMetrics = async (): Promise<MetricListResp> => {
            state.metricsLoading = true;
            try {
                if (state.dataTools.length === 0) await listDataSources();
                const res = await state.metricListApi.execute();
                return res.data;
            } catch (e) {
                console.error(e);
            } finally {
                state.metricsLoading = false;
            }
            return {
                metrics: [],
                // eslint-disable-next-line camelcase
                available_resources: {},
            };
        };

        const getStartTimestamp = (end: Moment): TimeStamp => {
            const units = state.selectedTimeRange.match(/[^0-9]/g) || [];
            return getTimestamp(end.subtract(
                _.parseInt(state.selectedTimeRange),
                    units[0] as 'w'|'d'|'h',
            ));
        };


        const getChartMetric = async (api: GetMetricData, chart: ChartMetric): Promise<void> => {
            chart.loading = true;
            try {
                const res = await api.setMetricKey(chart.metric.key).execute();
                chart.labels = res.data.labels;
                chart.dataset = res.data.resource_values;
                chart.error = false;
            } catch (e) {
                console.error(e);
                chart.error = true;
            } finally {
                chart.loading = false;
            }
        };

        const getChartMetricApi = (): GetMetricData => {
            const now = moment();
            return state.chartMetricApi.setEnd(getTimestamp(now))
                .setStart(getStartTimestamp(now))
                .setResources(...state.availableResources.map(d => d.id));
        };

        const listChartMetrics = _.debounce(async (start = 0): Promise<void> => {
            if (state.availableResources.length === 0) return;
            try {
                const api = getChartMetricApi();

                await Promise.all(
                    _.range(start, state.chartMetrics.length)
                        .map(i => getChartMetric(
                            api.clone(),
                            state.chartMetrics[i],
                        )),
                );
            } catch (e) {
                console.error(e);
            }
        }, 300);

        const setAvailableResources = (data): void => {
            let count = 0;
            state.availableResources = [];
            _.some(props.resources, (resource, i) => {
                if (data[resource.id]) {
                    state.availableResources.push(resource);
                    count++;
                }
                return count === 10;
            });
        };

        const initChartMetrics = (start = 0): void => {
            let endIdx = start + LOAD_LIMIT;
            if (endIdx > state.metrics.length) endIdx = state.metrics.length;

            _.range(start, endIdx).forEach((current) => {
                state.chartMetrics[current] = {
                    dataset: {},
                    labels: [],
                    loading: true,
                    metric: state.metrics[current],
                };
            });
            state.chartMetrics = [...state.chartMetrics];
        };

        const reset = (): void => {
            state.metricsLoading = true;
            state.chartMetrics = [];
            state.metrics = [];
            state.availableResources = [];
        };

        const loadChartMetrics = async () => {
            const start = state.chartMetrics.length;
            initChartMetrics(start);
            await listChartMetrics(start);
        };

        const listAll = _.debounce(async (): Promise<void> => {
            reset();

            const metricInfo = await listMetrics();
            state.metrics = _.sortBy(metricInfo.metrics, m => m.name);

            setAvailableResources(metricInfo.available_resources);

            if (state.metrics.length === 0) return;
            initChartMetrics();
            await listChartMetrics();
        }, 300);


        onMounted(() => {
            watch(() => state.statisticsTypes, (types) => {
                if (types) state.selectedStat = types[0] || STATISTICS_TYPE.average;
            });

            watch([() => props.resources, () => state.selectedToolId], (resources, toolId) => {
                if (resources.length > 0 && toolId) listAll();
            }, {
                lazy: true,
            });

            watch([() => state.selectedTimeRange, () => state.selectedStat], (timeRange, stat) => {
                if (timeRange && stat) listChartMetrics();
            }, {
                lazy: true,
            });

            listAll();
        });

        return {
            ...toRefs(state),
            colors,
            timeRanges,
            legendFormatter(resource): string {
                return resource.name ? `${resource.id}(${resource.name})` : resource.id;
            },
            listChartMetrics,
            loadChartMetrics,
        };
    },
};
</script>

<style lang="postcss" scoped>
    section {
        @apply px-4;
    }
    .toolbox-section {
        @apply flex justify-between border-t border-b border-gray-200 py-4;
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
            font-size: 0.875rem;
            &.active {
                @apply text-secondary font-bold;
            }
        }
    }
    .more-btn::v-deep {
        @apply border-gray-300 mt-12 block mx-auto;
        max-width: 38rem;
        width: 40%;
    }
</style>
