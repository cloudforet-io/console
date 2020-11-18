<template>
    <p-widget-layout :title="$t('COMMON.WIDGETS.SERVICE_ACCOUNTS')">
        <template #extra>
            <span class="add-btn">
                <p-i name="ic_plus_bold" width="0.75rem" height="0.75rem"
                     color="inherit"
                /> add</span>
        </template>
        <div class="chart-container">
            <p-chart-loader :loading="loading" class="chart">
                <template #loader>
                    <div ref="loaderRef" class="w-full h-full" />
                </template>
                <div ref="chartRef" class="w-full h-full" />
            </p-chart-loader>
        </div>
        <div class="legends">
            <template v-if="loading">
                <div v-for="v in skeletons" :key="v" class="flex items-center p-4">
                    <p-skeleton width="1.5rem" height="1.5rem" class="mr-4 flex-shrink-0" />
                    <p-skeleton class="flex-grow" />
                </div>
            </template>
            <p-data-table v-else
                          :loading="loading"
                          :fields="fields"
                          :items="data"
                          :bordered="false"
            >
                <template #col-provider-format="{ index, field, item }">
                    <router-link :to="`/identity/service-account?provider=${item.provider}`">
                        <span :style="{color: data[index].color}">{{ item.providerLabel }}</span>
                    </router-link>
                </template>
            </p-data-table>
            <!--            <p-grid-layout v-else :items="data" row-gap="0.5rem"-->
            <!--                           column-gap="0" :fix-column="1" card-min-width="0"-->
            <!--                           card-height="auto" :card-class="() => []"-->
            <!--            >-->
            <!--                <template #card="{item, index}">-->
            <!--                    <router-link :to="item.href">-->
            <!--                        <p-selectable-item :icon-url="item.icon" theme="card"-->
            <!--                                           default-icon="ic_provider_other"-->
            <!--                        >-->
            <!--                            <template #contents>-->
            <!--                                <div class="truncate">-->
            <!--                                    {{ item.name }}-->
            <!--                                </div>-->
            <!--                            </template>-->
            <!--                            <template #extra>-->
            <!--                                <p-badge :background-color="item.color" class="count">-->
            <!--                                    {{ item.count }}-->
            <!--                                </p-badge>-->
            <!--                            </template>-->
            <!--                        </p-selectable-item>-->
            <!--                    </router-link>-->
            <!--                </template>-->
            <!--            </p-grid-layout>-->
        </div>
    </p-widget-layout>
</template>

<script lang="ts">
import { map, forEach, range } from 'lodash';
import Chart, { ChartDataSets, ChartOptions } from 'chart.js';
import Color from 'color';

import {
    ComponentRenderProxy,
    computed, getCurrentInstance,
    onMounted, onUnmounted,
    reactive, toRefs, watch,
} from '@vue/composition-api';

import PWidgetLayout from '@/components/organisms/layouts/widget-layout/PWidgetLayout.vue';
import PSkeleton from '@/components/atoms/skeletons/PSkeleton.vue';
import PChartLoader from '@/components/organisms/charts/chart-loader/PChartLoader.vue';

import {
    black, gray, violet, white, yellow,
} from '@/styles/colors';
import { SpaceChart, tooltips } from '@/lib/chart/space-chart';
import { SpaceConnector } from '@/lib/space-connector';
import { store } from '@/store';

import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import PDataTable from '@/components/organisms/tables/data-table/PDataTable.vue';
import PI from '@/components/atoms/icons/PI.vue';

am4core.useTheme(am4themes_animated);

const DEFAULT_COUNT = 4;
const DEFAULT_COLORS = [violet[200], Color(violet[200]).alpha(0.5).toString()];

interface Data {
    providerLabel?: string;
    provider?: string;
    // name: string;
    // icon: string;
    color: string;
    count: number;
    href: string;
}

export default {
    name: 'ServiceAccounts',
    components: {
        PI,
        PDataTable,
        PWidgetLayout,
        PSkeleton,
        PChartLoader,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
            skeletons: range(4),
            loading: true,
            //
            loaderRef: null,
            chartRef: null as HTMLElement|null,
            data: [] as Data[],
            chart: null as null|any,
            fields: computed(() => [
                { name: 'provider', label: 'Provider' },
                { name: 'count', label: 'Service Account' },
            ]),
        });

        const drawChart = (element, isLoading = false) => {
            const chart = am4core.create(element, am4charts.PieChart);
            chart.responsive.enabled = true;
            chart.logo.disabled = true;
            chart.innerRadius = am4core.percent(68);

            if (isLoading) {
                chart.data = [{
                    name: 'Dummy',
                    count: 1000,
                    color: DEFAULT_COLORS[0],
                }];
            } else {
                chart.data = state.data;
            }

            const series = chart.series.create();
            series.dataFields.value = 'count';
            series.dataFields.category = 'name';
            series.slices.template.propertyFields.fill = 'color';
            series.slices.template.stroke = am4core.color(white);
            series.slices.template.strokeWidth = 2;
            series.slices.template.strokeOpacity = 1;

            if (isLoading) {
                series.slices.template.tooltipText = '';
            } else {
                series.slices.template.tooltipText = '{category}: {value}';
                if (series.tooltip) {
                    series.tooltip.fontSize = 12;
                    series.tooltip.fontFamily = 'Noto Sans';
                }
            }

            const label = new am4core.Label();
            label.parent = series;
            label.horizontalCenter = 'middle';
            label.verticalCenter = 'middle';
            label.fontSize = 25;
            label.fontWeight = 'lighter';
            label.fill = am4core.color(gray[500]);
            if (isLoading) {
                label.text = '';
            } else {
                label.text = '{values.value.sum}';
            }

            state.chart = chart;
        };

        const getData = async () => {
            state.loading = true;
            state.data = [];
            await store.dispatch('resource/provider/load');
            try {
                const res = await SpaceConnector.client.statistics.topic.serviceAccountByProvider();
                // const others: Data = {
                //     name: 'Others',
                //     icon: 'ic_provider_other',
                //     color: yellow[500],
                //     count: 0,
                //     provider: '',
                //     href: '/identity/service-account',
                // };
                const providers = store.state.resource.provider.items;

                if (res.results.length > 0) {
                    forEach(res.results, (d) => {
                        if (providers[d.provider]) {
                            state.data.push({
                                providerLabel: providers[d.provider].label || d.provider,
                                provider: d.provider,
                                // icon: providers[d.provider].icon || '',
                                color: providers[d.provider].color || '',
                                href: `/identity/service-account?p=1&ps=15&provider=${d.provider}`,
                                count: d.count,
                            });
                        }
                        // else others.count += d.count;
                    });
                } else {
                    state.data = map(providers, p => ({
                        name: p.label || '', color: p.color || '', count: 0, href: '',
                    }));
                }
                // state.data.push(others);
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        const init = async () => {
            await getData();
        };
        init();

        // draw loader chart or data chart
        watch([() => state.loaderRef, () => state.chartRef], ([loaderCtx, chartCtx]) => {
            if (loaderCtx) {
                drawChart(loaderCtx, true);
            } else if (chartCtx) {
                drawChart(chartCtx, false);
            }
        }, { immediate: true });

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
.chart {
    height: 11.25rem;
    width: 100%;
}
.count {
    font-size: 0.875rem;
    font-weight: bold;
}
.add-btn {
    @apply text-blue-500 float-right;
}
.legends {
    @apply w-full flex-grow justify-center items-center m-auto overflow-y-auto;
}
.chart-container {
    @apply flex justify-center items-center mb-4;
}
.p-data-table::v-deep {
    margin-top: 1rem;
    overflow-x: hidden;
    .default th {
        @apply bg-gray-100 text-gray-400;
        height: 1.5rem;
        border: none;
        font-size: 0.75rem;
    }
    td {
        height: 2rem;
    }
}
</style>
