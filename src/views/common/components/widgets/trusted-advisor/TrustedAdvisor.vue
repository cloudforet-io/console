<template>
    <widget-layout>
        <template #title>
            <div class="title">
                <span :style="{ 'color': providers.aws ? providers.aws.color : '' }">AWS </span>
                <span>{{ $t('COMMON.WIDGETS.TRUSTED_ADVISOR.TITLE') }}</span>
            </div>
        </template>
        <div class="content-wrapper grid grid-cols-12 gap-6">
            <div class="overall-wrapper col-span-12 lg:col-span-3">
                <div class="title">
                    <span class="text">{{ $t('COMMON.WIDGETS.TRUSTED_ADVISOR.SUB_TITLE_OVERALL') }}</span>
                </div>
                <div class="chart-wrapper">
                    <div ref="chartRef" class="chart" />
                </div>
                <div class="legend-wrapper">
                    <div v-for="([k, v]) of Object.entries(legendData)" :key="k"
                         class="legend-row"
                    >
                        <div class="left-part">
                            <span class="legend-circle" :style="{ 'background-color': v.color }" />
                            <span class="legend-text">{{ v.label }}</span>
                        </div>
                        <div class="right-part">
                            <span :style="{ 'color': v.color }">{{ v.count }}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="project-summary-wrapper col-span-12 lg:col-span-9">
                <div class="title">
                    <span class="text">{{ $t('COMMON.WIDGETS.TRUSTED_ADVISOR.SUB_TITLE_PROJECT_SUMMARY') }}</span>
                    <p-text-pagination
                        :this-page.sync="thisPage"
                        :all-page="allPage"
                        @pageChange="changePageNumber"
                    />
                </div>
                <div class="table-wrapper">
                    <div v-for="rowNum of range(-1, 5)" :key="rowNum"
                         class="table-row" :class="{ 'project-name-row': rowNum === -1 }"
                    >
                        <div class="left-part">
                            <div v-if="rowNum > -1" class="label-wrapper">
                                <p-i :name="tableData[rowNum].icon"
                                     width="0.875rem" height="0.875rem"
                                     color="inherit transparent"
                                />
                                <span class="text">{{ tableData[rowNum].label }}</span>
                            </div>
                        </div>
                        <div class="right-part grid grid-cols-12 gap-1">
                            <div v-for="colNum of range(6)" :key="colNum"
                                 class="col-wrapper col-span-2"
                            >
                                <template v-if="rowNum === -1">
                                    <span v-if="projectSummaryData[colNum * thisPage]" class="project-name">
                                        {{ projectSummaryData[colNum * thisPage].projectName }}
                                    </span>
                                </template>
                                <template v-else>
                                    <div class="box" :class="getProjectBoxClass(rowNum, colNum * thisPage)">
                                        <span class="box-text">
                                            {{ getProjectBoxText(rowNum, colNum * thisPage) }}
                                        </span>
                                    </div>
                                </template>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </widget-layout>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import { range, size, forEach } from 'lodash';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';

import {
    computed, reactive, toRefs, watch,
    getCurrentInstance, ComponentRenderProxy,
} from '@vue/composition-api';

import WidgetLayout from '@/views/common/components/layouts/WidgetLayout.vue';
import PTextPagination from '@/components/organisms/paginations/text-pagination/PTextPagination.vue';
import PI from '@/components/atoms/icons/PI.vue';
import { getAllPage } from '@/components/organisms/paginations/text-pagination/helper';

import { SpaceConnector } from '@/lib/space-connector';
import {
    red, green, yellow,
} from '@/styles/colors';

am4core.useTheme(am4themes_animated);

enum STATUS {
    error = 'error',
    warning = 'warning',
    ok = 'ok',
}
enum CATEGORY {
    cost_optimizing,
    performance,
    security,
    fault_tolerance,
    service_limits,
}

interface OverallData {
    status: keyof typeof STATUS;
    count: number;
}
interface LegendData {
    label: string;
    color: string;
    count: number;
}
interface ProjectSummaryData {
    projectId: string;
    projectName: string;
    counts: [STATUS, number][];
}

const ERROR_COLOR = red[500];
const WARNING_COLOR = yellow[500];
const OK_COLOR = green[500];

export default {
    name: 'TrustedAdvisor',
    components: {
        PTextPagination,
        WidgetLayout,
        PI,
    },
    props: {
        providers: {
            type: Object,
            default: () => ({}),
        },
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const chartState = reactive({
            loading: true,
            data: [] as OverallData[],
            colors: {
                error: ERROR_COLOR,
                warning: WARNING_COLOR,
                ok: OK_COLOR,
            },
        });
        const state = reactive({
            loading: false,
            chartRef: null as HTMLElement | null,
            thisPage: 1,
            allPage: 1,
            projects: computed(() => vm.$store.state.resource.project.items),
            legendData: computed(() => ({
                error: {
                    label: vm.$t('COMMON.WIDGETS.TRUSTED_ADVISOR.LABEL_ERROR'),
                    color: ERROR_COLOR,
                    count: chartState.data.find(d => d.status === STATUS.error)?.count,
                },
                warning: {
                    label: vm.$t('COMMON.WIDGETS.TRUSTED_ADVISOR.LABEL_WARNING'),
                    color: WARNING_COLOR,
                    count: chartState.data.find(d => d.status === STATUS.warning)?.count,
                },
                ok: {
                    label: vm.$t('COMMON.WIDGETS.TRUSTED_ADVISOR.LABEL_OK'),
                    color: OK_COLOR,
                    count: chartState.data.find(d => d.status === STATUS.ok)?.count,
                },
            } as Record<string, LegendData>)),
            tableData: computed(() => ([
                {
                    label: vm.$t('COMMON.WIDGETS.TRUSTED_ADVISOR.LABEL_COST_OPTIMIZATION'),
                    icon: 'ic_cost_optimization',
                },
                {
                    label: vm.$t('COMMON.WIDGETS.TRUSTED_ADVISOR.LABEL_PERFORMANCE'),
                    icon: 'ic_performance',
                },
                {
                    label: vm.$t('COMMON.WIDGETS.TRUSTED_ADVISOR.LABEL_SECURITY'),
                    icon: 'ic_security',
                },
                {
                    label: vm.$t('COMMON.WIDGETS.TRUSTED_ADVISOR.LABEL_FAULT_TOLERANCE'),
                    icon: 'ic_fault_tolerance',
                },
                {
                    label: vm.$t('COMMON.WIDGETS.TRUSTED_ADVISOR.LABEL_SERVICE_LIMITS'),
                    icon: 'ic_service_limits',
                },
            ])),
            projectSummaryData: [] as ProjectSummaryData[],
        });

        /* util */
        const drawChart = (chartContext) => {
            const chart = am4core.create(chartContext, am4charts.PieChart);
            chart.logo.disabled = true;
            chart.paddingTop = 12;
            chart.data = chartState.data;

            const series = chart.series.push(new am4charts.PieSeries());
            series.labels.template.disabled = true;
            series.ticks.template.disabled = true;
            series.dataFields.value = 'count';
            series.dataFields.category = 'status';

            series.slices.template.togglable = false;
            series.slices.template.clickable = false;
            series.slices.template.stroke = am4core.color('#fff');
            series.slices.template.tooltipText = '';
            series.slices.template.strokeWidth = 1;
            // @ts-ignore
            series.slices.template.states.getKey('hover').properties.scale = 1;
            series.slices.template.adapter.add('fill', (fill, target) => {
                // @ts-ignore
                if (target.dataItem) return am4core.color(chartState.colors[target.dataItem.category]);
                return fill;
            });

            // animation
            series.hiddenState.properties.opacity = 1;
            series.hiddenState.properties.endAngle = -90;
            series.hiddenState.properties.startAngle = -90;
        };
        const changePageNumber = (page) => {
            state.thisPage = page;
        };
        const getProjectBoxClass = (rowNum, colNum) => {
            const projectData = state.projectSummaryData[colNum];
            const htmlClass: any = {};
            if (!projectData) {
                htmlClass.empty = true;
            } else {
                const type = projectData.counts[rowNum][0];
                const count = projectData.counts[rowNum][1];
                if (count === 0) {
                    htmlClass.empty = true;
                } else {
                    htmlClass[type] = true;
                }
            }
            return htmlClass;
        };
        const getProjectBoxText = (rowNum, colNum) => (state.projectSummaryData[colNum] ? state.projectSummaryData[colNum].counts[rowNum][1] : '0');

        /* api */
        const getOverallData = async () => {
            chartState.loading = true;
            try {
                const res = await SpaceConnector.client.statistics.topic.trustedAdvisorSummary();
                chartState.data = res.results;
            } catch (e) {
                console.error(e);
            } finally {
                chartState.loading = false;
            }
        };
        const getProjectSummary = async () => {
            state.loading = true;
            try {
                const res = await SpaceConnector.client.statistics.topic.trustedAdvisorByProject();
                state.allPage = getAllPage(size(res), 6);

                const projectSummaryData: ProjectSummaryData[] = [];
                forEach(res, (projectData, projectId) => {
                    // todo: to be fixed...
                    const counts: [STATUS, number][] = Array(5).fill([STATUS.error, 0]);
                    forEach(projectData, (countData, category) => {
                        let count = 0;
                        let type = STATUS.error;
                        if (countData.error_count > 0) {
                            count = countData.error_count;
                        } else if (countData.warning_count > 0) {
                            count = countData.warning_count;
                            type = STATUS.warning;
                        } else if (countData.ok_count > 0) {
                            count = countData.ok_count;
                            type = STATUS.ok;
                        }
                        counts.splice(CATEGORY[category], 1, [type, count]);
                    });
                    projectSummaryData.push({
                        projectId,
                        projectName: state.projects[projectId]?.name,
                        counts,
                    });
                });
                state.projectSummaryData = projectSummaryData;
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        const init = () => {
            getOverallData();
        };
        const asyncInit = async () => {
            // await vm.$store.dispatch('favorite/project/load');
            await vm.$store.dispatch('resource/project/load');
            await getProjectSummary();
        };
        init();
        asyncInit();

        watch([() => chartState.loading, () => state.chartRef], async ([loading, chartContext]) => {
            if (!loading && chartContext) {
                drawChart(chartContext);
            }
        }, { immediate: false });

        return {
            ...toRefs(state),
            chartState,
            changePageNumber,
            range,
            getProjectBoxClass,
            getProjectBoxText,
        };
    },
};
</script>

<style lang="postcss" scoped>
.widget-layout::v-deep {
    .title {
        font-size: 1.125rem;
        font-weight: bold;
    }
}
.content-wrapper {
    margin-top: 0.625rem;
    .title {
        position: relative;
        display: flex;
        height: 2rem;
        font-size: 1rem;
        font-weight: bold;
        line-height: 1.2;
        .text {
            margin: auto 0;
        }
        .text-pagination {
            position: absolute;
            right: 0;
        }
    }
    .legend-wrapper {
        .legend-row {
            position: relative;
            display: flex;
            font-size: 0.875rem;
            padding: 0.25rem 0;
            .left-part {
                display: table-cell;
                .legend-circle {
                    display: inline-block;
                    width: 0.5rem;
                    height: 0.5rem;
                    border-radius: 50%;
                    margin-right: 0.25rem;
                }
                .legend-text {
                    @apply text-gray-700;
                    line-height: 1.4;
                }
            }
            .right-part {
                position: absolute;
                right: 0;
            }
        }
    }
    .table-wrapper {
        padding-top: 0.5rem;
        .table-row {
            display: flex;
            width: 100%;
            padding: 2px 0;
            &.project-name-row {
                height: 5.5rem;
            }

            .left-part {
                width: 20%;
                .label-wrapper {
                    @apply text-gray-400;
                    font-size: 0.75rem;
                    padding: 6px 0;
                    .text {
                        @apply text-gray-500;
                        margin-left: 0.25rem;
                    }
                }
            }
            .right-part {
                width: 80%;
                font-size: 0.75rem;
                .col-wrapper {
                    position: relative;
                }
                .project-name {
                    @apply text-gray-700;
                    position: absolute;
                    display: block;
                    bottom: 1.5rem;
                    left: 0;
                    transform: rotate(-50deg);
                }
                .box {
                    @apply border;
                    position: relative;
                    display: table;
                    width: 100%;
                    height: 100%;
                    font-weight: bold;
                    text-align: center;
                    vertical-align: middle;
                    &.error {
                        @apply bg-coral-100 border border-red-500 text-red-500;
                    }
                    &.warning {
                        @apply border border-yellow-500 text-yellow-500;
                    }
                    &.ok {
                        @apply border border-green-500 text-green-500;
                    }
                    &.empty {
                        @apply border border-gray-200 text-gray-300;
                    }
                    .box-text {
                        display: table-cell;
                    }
                }
            }
        }
    }
}
</style>
