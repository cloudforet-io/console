<template>
    <div class="project-region-service">
        <div v-if="!loading && data.length === 0" class="no-data-wrapper grid">
            <div class="m-auto">
                <img src="@/assets/images/illust_cloud.svg" class="empty-image hidden lg:block">
                <p class="text">
                    {{ $t('COMMON.WIDGETS.ALL_SUMMARY.NO_SERVICE', { service: $t('COMMON.WIDGETS.ALL_SUMMARY.REGION_SERVICE') }) }}
                </p>
            </div>
        </div>
        <div v-else class="grid grid-cols-12">
            <div class="col-span-3 chart-wrapper">
                <p-chart-loader :loading="loading">
                    <template #loader>
                        <div ref="loaderRef" />
                    </template>
                    <div ref="chartRef" class="chart" />
                </p-chart-loader>
            </div>
            <div class="col-span-9 summary-content-wrapper">
                <template v-if="loading">
                    <div v-for="v in skeletons" :key="v" class="flex items-center p-2 col-span-3">
                        <p-skeleton class="flex-grow" />
                    </div>
                </template>
                <template v-else>
                    <router-link v-for="(d, idx) of data" :key="idx"
                                 :to="d.to"
                                 class="summary-row col-span-3 md:col-span-1 lg:col-span-3"
                    >
                        <span class="circle" :style="{ 'background-color': d.color }" />
                        <div class="text-group">
                            <span :style="{ color: d.providerColor }">{{ d.provider }}</span>
                            <span class="type truncate">{{ d.region }}</span>
                        </div>
                        <span class="count">{{ d.count }}</span>
                    </router-link>
                </template>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { range, orderBy } from 'lodash';
import bytes from 'bytes';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';

import {
    PChartLoader, PSkeleton,
} from '@spaceone/design-system';

import {
    reactive, toRefs, watch, onUnmounted, computed,
} from '@vue/composition-api';

import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { QueryHelper } from '@spaceone/console-core-lib/query';
import {
    gray, violet, white, coral, yellow, secondary1,
} from '@/styles/colors';
import Color from 'color';
import { store } from '@/store';
import { Location } from 'vue-router';
import config from '@/lib/config';
import { INVENTORY_ROUTE } from '@/services/inventory/routes';
import ErrorHandler from '@/common/composables/error/errorHandler';


interface Data {
    provider: string;
    region_code: string;
    total: number;
}
const DEFAULT_COLORS = [violet[200], Color(violet[200]).alpha(0.5).toString()];

interface RegionData {
    provider: string;
    region_code: string;
    region_id: string;
}

export default {
    name: 'ProjectRegionService',
    components: {
        PChartLoader,
        PSkeleton,
    },
    props: {
        label: {
            type: String,
            default: undefined,
        },
        projectId: {
            type: String,
            required: true,
        },
        count: {
            type: Number,
            default: undefined,
        },
    },
    setup(props) {
        const queryHelper = new QueryHelper();
        const state = reactive({
            loading: true,
            skeletons: range(3),
            providers: computed(() => store.state.resource.provider.items),
            regions: computed(() => store.state.resource.region.items),
            loaderRef: null,
            chartRef: null as HTMLElement | null,
            data: [] as Data[],
            chart: null as null | any,
            chartRegistry: {},
        });

        /* util */
        const byteFormatter = (num, option = {}) => bytes(num, { ...option, unitSeparator: ' ', decimalPlaces: 1 });
        const disposeChart = (ctx) => {
            if (state.chartRegistry[ctx]) {
                state.chartRegistry[ctx].dispose();
                delete state.chartRegistry[ctx];
            }
        };
        const drawChart = (ctx, isLoading) => {
            const createChart = () => {
                disposeChart(ctx);
                state.chartRegistry[ctx] = am4core.create(ctx, am4charts.PieChart);
                return state.chartRegistry[ctx];
            };
            const chart = createChart();
            state.chart = chart;
            if (!config.get('AMCHARTS_LICENSE.ENABLED')) chart.logo.disabled = true;
            chart.responsive.enabled = true;
            chart.innerRadius = am4core.percent(63);

            if (isLoading) {
                chart.data = [{
                    provider: 'Dummy',
                    service_account_count: 1000,
                    color: DEFAULT_COLORS[0],
                }];
            } else {
                chart.data = state.data;
            }

            const series = chart.series.create();
            series.slices.template.togglable = false;
            series.slices.template.clickable = false;
            series.dataFields.value = 'total';
            series.dataFields.category = 'region';
            series.slices.template.fill = am4core.color(gray[400]);
            series.slices.template.propertyFields.fill = 'color';
            series.slices.template.stroke = am4core.color(white);
            series.slices.template.strokeWidth = 2;
            series.slices.template.strokeOpacity = 1;
            series.slices.template.states.getKey('hover').properties.scale = 1;
            series.tooltip.disabled = true;
            series.ticks.template.disabled = true;
            series.labels.template.text = '';

            const label = new am4core.Label();
            label.parent = series;
            label.horizontalCenter = 'middle';
            label.verticalCenter = 'middle';
            label.fontSize = 16;
            label.fontWeight = 'lighter';
            label.fill = am4core.color(gray[900]);
            if (isLoading) label.text = '';
            else if (props.count) {
                if (props.label === 'Storage') {
                    label.text = byteFormatter(props.count).split(' ')[0];
                } else {
                    label.text = props.count;
                }
            } else {
                label.text = '{values.value.sum}';
            }

            state.chart = chart;
        };

        const getLocation = (provider, region) => {
            const query: Location['query'] = {
                provider,
                region,
            };
            if (props.label !== 'All') query.service = props.label;

            // set filters
            queryHelper.setFilters([{ k: 'project_id', o: '=', v: props.projectId }]);

            const location: Location = {
                name: INVENTORY_ROUTE.CLOUD_SERVICE.TYPE._NAME,
                query: {
                    filters: queryHelper.rawQueryStrings,
                    ...query,
                },
            };
            return location;
        };

        /* api */
        const getData = async () => {
            try {
                state.loading = true;
                state.data = [];
                const param: any = {
                    project_id: props.projectId,
                    aggregation: 'inventory.Region',
                    labels: [props.label],
                };
                const res = await SpaceConnector.client.statistics.topic.cloudServiceSummary(param);
                const colors = [coral[500], yellow[400], secondary1];
                let data = orderBy(res.results, ['total'], ['desc']);
                data = data.map((d, idx) => ({
                    provider: state.providers[d.provider].label,
                    region: d.region_code,
                    total: d.total,
                    count: d.label === 'Storage' ? byteFormatter(d.total) : d.total,
                    providerColor: state.providers[d.provider].color,
                    color: colors[idx] || gray[400],
                    to: getLocation(d.provider, d.region_code),
                }));
                state.data = data;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.data = [];
            } finally {
                state.loading = false;
            }
        };

        watch(() => state.providers, (providers) => {
            if (providers) getData();
        }, { immediate: false });
        watch([() => state.loading, () => state.loaderRef, () => state.chartRef], ([loading, loaderCtx, chartCtx]) => {
            if (loading && loaderCtx) {
                drawChart(loaderCtx, true);
            } else if (!loading && chartCtx) {
                drawChart(chartCtx, false);
            }
        }, { immediate: true });
        watch(() => props.label, async () => {
            await getData();
        }, { immediate: false });

        onUnmounted(() => {
            if (state.chart) state.chart.dispose();
        });

        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>
.project-region-service {
    .no-data-wrapper {
        height: 13rem;
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
    .chart-wrapper {
        .chart {
            max-width: 6rem;
            max-height: 6rem;
            margin: auto;

            @screen md {
                position: absolute;
                top: -1rem;
            }
        }
    }
    .summary-content-wrapper {
        overflow-y: auto;
        height: 13rem;
    }
    .summary-row {
        position: relative;
        display: block;
        font-size: 0.875rem;
        line-height: 1.2;
        cursor: pointer;
        padding: 0.25rem 0.5rem;
        margin: auto 0;

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

        .circle {
            display: inline-block;
            width: 0.5rem;
            height: 0.5rem;
            border-radius: 50%;
            margin-bottom: 0.25rem;
            margin-right: 0.25rem;
        }

        .text-group {
            display: inline-block;
            width: 75%;
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

    @screen mobile {
        .summary-content-wrapper {
            height: auto;
        }
    }
}
</style>
