<template>
    <div class="spot-group-basic-info">
        <section class="title-section">
            <p class="title">
                {{ $t('AUTOMATION.SPOT_AUTOMATION.DETAIL.BASE_INFO.TITLE') }}
            </p>
            <div class="title-right">
                <p-button class="edit-button gray900 sm" :outline="true">
                    <span>{{ $t('AUTOMATION.SPOT_AUTOMATION.DETAIL.BASE_INFO.EDIT') }}</span>
                </p-button>
            </div>
        </section>
        <section class="content-section">
            <p class="spot-group-name-text">
                {{ title }}
            </p>
            <p-anchor class="link-text"
                      :text="`${$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.BASE_INFO.VIEW_DETAIL')} [${resourceName}]`"
                      :href="resourceLink"
                      highlight
            />
        </section>
        <section class="composition-chart-section">
            <spot-group-ratio-chart
                chart-type="short"
                :spot-group-id="spotGroup.spot_group_id"
            />
        </section>
        <section class="project-section">
            <span class="title">
                {{ $t('AUTOMATION.SPOT_AUTOMATION.DETAIL.BASE_INFO.PROJECT') }}
            </span>
            <p-anchor class="content"
                      :text="projectName"
                      :href="projectLink"
                      highlight
            />
        </section>
        <section class="using-instance-type-section">
            <p class="title">
                {{ $t('AUTOMATION.SPOT_AUTOMATION.DETAIL.BASE_INFO.USING_INSTANCE_TYPE') }}
            </p>
            <div class="chart-wrapper">
                <p-chart-loader :loading="loading">
                    <template #loader>
                        <div ref="loaderRef" />
                    </template>
                    <div ref="chartRef" class="chart" />
                </p-chart-loader>
                <div class="legend-group">
                    <template v-if="loading">
                        <div v-for="v in skeletons" :key="v" class="items-center p-2">
                            <p-skeleton class="flex-grow" />
                        </div>
                    </template>
                    <div v-for="d in data" :key="d.type" class="legend">
                        <span class="circle" :style="{ 'background-color': d.color }" />
                        <span class="type">{{ d.type }}</span>
                        <span class="count">{{ d.count }}</span>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import {
    get, isEmpty, map, range,
} from 'lodash';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import Color from 'color';

import {
    PAnchor, PButton, PChartLoader, PSkeleton,
} from '@spaceone/design-system';
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';
import {
    coral, gray, secondary1, violet, white, yellow,
} from '@/styles/colors';
import SpotGroupRatioChart from '@/views/automation/spot-automation/components/SpotGroupRatioChart.vue';
import { SpaceConnector } from '@/lib/space-connector';
import { referenceRouter } from '@/lib/reference/referenceRouter';
import { store } from '@/store';

am4core.useTheme(am4themes_animated);

const DEFAULT_COLORS = [violet[200], Color(violet[200]).alpha(0.5).toString()];

interface ChartData {
    type: string;
    count: number;
    color?: string;
}

export default {
    name: 'SpotGroupBaseInfo',
    components: {
        SpotGroupRatioChart,
        PButton,
        PAnchor,
        PChartLoader,
        PSkeleton,
    },
    props: {
        spotGroup: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            loading: false,
            skeletons: range(3),
            title: '',
            resourceName: computed(() => props.spotGroup.resource_id), // todo: name 필드가 추가되면 name으로 바뀌어야 함
            projects: computed(() => store.state.resource.project.items),
            projectId: computed(() => props.spotGroup.project_id),
            projectName: computed(() => state.projects[state.projectId]?.label),
            projectLink: computed(() => {
                const projectRouter = referenceRouter(state.projectId, { resource_type: 'identity.Project' });
                return vm.$router.resolve(projectRouter).href;
            }),
            resourceLink: computed(() => {
                if (!isEmpty(props.spotGroup)) {
                    const referenceLink = referenceRouter(props.spotGroup.resource_id, {
                        resource_type: props.spotGroup.resource_type,
                        reference_key: 'cloud_service_id',
                    });
                    return vm.$router.resolve(referenceLink).href;
                }
                return '';
            }),
            loaderRef: null as HTMLElement | null,
            chartRef: null as HTMLElement | null,
            chart: null as null | any,
            chartRegistry: {},
            data: [] as ChartData[],
        });

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
            chart.logo.disabled = true;
            chart.responsive.enabled = true;
            chart.innerRadius = am4core.percent(60);

            if (isLoading) {
                chart.data = [{
                    type: 'Dummy',
                    count: 1000,
                    color: DEFAULT_COLORS[0],
                }];
            } else {
                chart.data = state.data;
            }

            const series = chart.series.create();
            series.slices.template.togglable = false;
            series.slices.template.clickable = false;
            series.dataFields.value = 'count';
            series.dataFields.category = 'type';
            series.slices.template.fill = am4core.color(gray[400]);
            series.slices.template.propertyFields.fill = 'color';
            series.slices.template.stroke = am4core.color(white);
            series.slices.template.strokeWidth = 2;
            series.slices.template.strokeOpacity = 1;
            series.slices.template.states.getKey('hover').properties.scale = 1;
            series.tooltip.disabled = true;
            series.ticks.template.disabled = true;

            const label = new am4core.Label();
            label.parent = series;
            label.horizontalCenter = 'middle';
            label.verticalCenter = 'middle';
            label.fontSize = 16;
            label.fontWeight = 'lighter';
            label.fill = am4core.color(gray[900]);
            label.text = '{values.value.sum}';
            if (isLoading) label.text = '';

            state.chart = chart;
        };

        /* api */
        const getRecommendedName = async (spotGroup) => {
            const cloudServiceType = get(spotGroup, 'cloud_service_type');
            try {
                const res = await SpaceConnector.client.spotAutomation.spotGroup.getSupportedResourceTypes();
                map(res, (d, k) => {
                    if (k.includes(cloudServiceType)) {
                        state.title = d.recommended_title;
                    }
                });
            } catch (e) {
                console.error(e);
            }
        };
        const getInstanceType = async (spotGroup) => {
            try {
                state.loading = true;
                const res = await SpaceConnector.client.spotAutomation.spotGroup.getSpotGroupInstanceTypes({
                    spot_groups: [spotGroup.spot_group_id],
                });
                const colors = [coral[500], yellow[400], secondary1];
                const instanceTypeData = get(res, `spot_groups.${spotGroup.spot_group_id}`);
                state.data = Object.entries(instanceTypeData).map(([k, v], idx) => ({
                    type: k,
                    count: v,
                    color: colors[idx] || gray[400],
                }));
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        watch(() => props.spotGroup, (spotGroup) => {
            getRecommendedName(spotGroup);
            getInstanceType(spotGroup);
        }, { immediate: false });
        watch([() => state.loading, () => state.loaderRef, () => state.chartRef], ([loading, loaderCtx, chartCtx]) => {
            if (loading && loaderCtx) {
                drawChart(loaderCtx, true);
            } else if (!loading && chartCtx) {
                drawChart(chartCtx, false);
            }
        }, { immediate: true });

        return {
            ...toRefs(state),
            referenceRouter,
        };
    },
};
</script>

<style lang="postcss" scoped>
.spot-group-basic-info {
    @apply border border-gray-200;
    padding: 1rem;

    .title-section {
        position: relative;
        display: flex;
        margin-bottom: 1rem;
        .title {
            @apply text-gray-900;
            font-size: 1rem;
            font-weight: bold;
            line-height: 1.6;
        }
        .title-right {
            position: absolute;
            right: 0;
            top: 0;
            margin-top: 0.125rem;
            .edit-button {
                min-width: auto;
                height: 1.25rem;
                line-height: 1.6;
                font-size: 0.75rem;
                padding: 0 0.5rem;
            }
        }
    }
    .content-section {
        .spot-group-name-text {
            font-size: 1rem;
            line-height: 1.4;
            margin-bottom: 0.25rem;
        }
        .link-text {
            font-size: 0.75rem;
            line-height: 1.5;
        }
    }
    .composition-chart-section {
        margin: 1rem 0;
    }
    .project-section {
        margin-bottom: 1rem;
        .title {
            @apply text-gray-400;
            font-size: 0.875rem;
            font-weight: bold;
            line-height: 1.5;
        }
        .content {
            font-size: 0.875rem;
            margin-left: 0.5rem;
        }
    }
    .using-instance-type-section {
        .title {
            @apply text-gray-400;
            font-size: 0.875rem;
            font-weight: bold;
            line-height: 1.5;
        }
        .chart-wrapper {
            display: inline-flex;
            width: 100%;
            .p-chart-loader {
                display: inline-block;
                width: 6rem;
                height: 6rem;
                .chart {
                    max-width: 6rem;
                    max-height: 6rem;
                }
            }
            .legend-group {
                display: inline-block;
                width: 65%;
                font-size: 0.875rem;
                padding: 0.25rem 0.5rem;
                .legend {
                    line-height: 1.5;
                    padding: 0 0.125rem;
                    margin-bottom: 0.25rem;
                    .circle {
                        display: inline-block;
                        width: 0.5rem;
                        height: 0.5rem;
                        border-radius: 50%;
                    }
                    .type {
                        padding: 0 0.25rem;
                    }
                    .count {
                        font-weight: bold;
                    }
                }
            }
        }
    }
}
</style>
