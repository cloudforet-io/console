<template>
    <widget-layout>
        <template #title>
            <div class="title">
                <span :style="{ 'color': providers.aws ? providers.aws.color : '' }">AWS </span>
                <span>{{ $t('COMMON.WIDGETS.TRUSTED_ADVISOR.TITLE') }}</span>
            </div>
        </template>
        <div class="content-wrapper grid grid-cols-12 gap-6">
            <div class="overall-wrapper col-span-12 xs:col-span-2 lg:col-span-3 grid grid-cols-12">
                <div class="title col-span-12">
                    <span class="text">{{ $t('COMMON.WIDGETS.TRUSTED_ADVISOR.SUB_TITLE_OVERALL') }}</span>
                </div>
                <div class="chart-wrapper col-span-4 xs:col-span-12">
                    <div ref="chartRef" class="chart" />
                </div>
                <div class="legend-wrapper col-span-8 xs:col-span-12">
                    <template v-for="([k, v]) of Object.entries(legendData)">
                        <router-link :key="k"
                                     :to="overallLinkFormatter(v.name)"
                                     class="legend-row" :class="v.name"
                        >
                            <div class="left-part">
                                <span class="legend-circle" :style="{ 'background-color': v.color }" />
                                <span class="legend-text inline-block xs:hidden lg:inline-block" :class="v.name">{{ v.label }}</span>
                            </div>
                            <div class="right-part relative lg:absolute">
                                <span :style="{ 'color': v.color }">{{ v.count }}</span>
                            </div>
                        </router-link>
                    </template>
                </div>
            </div>
            <div class="project-summary-wrapper col-span-12 xs:col-span-10 lg:col-span-9">
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
                                <span class="text hidden lg:inline-block">{{ tableData[rowNum].label }}</span>
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
                                    <router-link v-if="getProjectBoxCount(rowNum, colNum * thisPage) > 0"
                                                 :to="projectSummaryLinkFormatter(rowNum, colNum * thisPage)"
                                    >
                                        <div class="box" :class="getProjectBoxStatus(rowNum, colNum * thisPage)">
                                            <span class="box-text">{{ getProjectBoxCount(rowNum, colNum * thisPage) }}</span>
                                        </div>
                                    </router-link>
                                    <div v-else class="box empty">
                                        <span class="box-text">0</span>
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
import {
    findKey, forEach, range, size,
} from 'lodash';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';

import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';

import WidgetLayout from '@/views/common/components/layouts/WidgetLayout.vue';
import PTextPagination from '@/components/organisms/paginations/text-pagination/PTextPagination.vue';
import PI from '@/components/atoms/icons/PI.vue';
import { getAllPage } from '@/components/organisms/paginations/text-pagination/helper';

import { SpaceConnector } from '@/lib/space-connector';
import { referenceRouter } from '@/lib/reference/referenceRouter';
import { QueryStoreFilter } from '@/lib/query/type';
import { QueryHelper } from '@/lib/query';
import { green, red, yellow } from '@/styles/colors';

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
    name: string;
    label: string;
    color: string;
    count: number;
}
interface ProjectSummaryData {
    projectId: string;
    projectName: string;
    counts: [STATUS, number][];
}

const TRUSTED_ADVISER = 'TrustedAdvisor';
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
        const queryHelper = new QueryHelper();

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
            trustedAdvisorId: computed<string>(() => {
                const cloudServiceTypes = vm.$store.state.resource.cloudServiceType.items;
                const trustedAdvisorId = findKey(cloudServiceTypes, { name: TRUSTED_ADVISER });
                return trustedAdvisorId || '';
            }),
            legendData: computed(() => ({
                error: {
                    name: STATUS.error,
                    label: vm.$t('COMMON.WIDGETS.TRUSTED_ADVISOR.LABEL_ERROR'),
                    color: ERROR_COLOR,
                    count: chartState.data.find(d => d.status === STATUS.error)?.count,
                },
                warning: {
                    name: STATUS.warning,
                    label: vm.$t('COMMON.WIDGETS.TRUSTED_ADVISOR.LABEL_WARNING'),
                    color: WARNING_COLOR,
                    count: chartState.data.find(d => d.status === STATUS.warning)?.count,
                },
                ok: {
                    name: STATUS.ok,
                    label: vm.$t('COMMON.WIDGETS.TRUSTED_ADVISOR.LABEL_OK'),
                    color: OK_COLOR,
                    count: chartState.data.find(d => d.status === STATUS.ok)?.count,
                },
            })),
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
        const getProjectBoxStatus = (rowNum, colNum) => {
            const projectData = state.projectSummaryData[colNum];
            if (projectData) {
                const type = projectData.counts[rowNum][0];
                const count = projectData.counts[rowNum][1];
                if (count === 0) return 'empty';
                return type;
            }
            return 'empty';
        };
        const getProjectBoxCount = (rowNum, colNum) => (state.projectSummaryData[colNum] ? state.projectSummaryData[colNum].counts[rowNum][1] : 0);
        const overallLinkFormatter = (status) => {
            const filters: QueryStoreFilter[] = [];
            filters.push({ k: 'data.status', o: '=', v: status });

            if (state.trustedAdvisorId) {
                return referenceRouter(
                    state.trustedAdvisorId,
                    { resource_type: 'inventory.CloudServiceType' },
                    { filters: queryHelper.setFilters(filters).rawQueryStrings },
                );
            }
            return '';
        };
        const projectSummaryLinkFormatter = (rowNum, colNum) => {
            const status = getProjectBoxStatus(rowNum, colNum * state.thisPage);
            const category = CATEGORY[rowNum];
            const projectId = state.projectSummaryData[colNum]?.projectId;

            const filters: QueryStoreFilter[] = [];
            filters.push({ k: 'data.status', o: '=', v: status });
            if (category) filters.push({ k: 'data.category', o: '=', v: category });
            if (projectId) filters.push({ k: 'project_id', o: '=', v: projectId });

            return referenceRouter(
                state.trustedAdvisorId,
                { resource_type: 'inventory.CloudServiceType' },
                { filters: queryHelper.setFilters(filters).rawQueryStrings },
            );
        };

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
            getProjectBoxStatus,
            getProjectBoxCount,
            overallLinkFormatter,
            projectSummaryLinkFormatter,
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
        @media screen and (width < 1024px) {
            width: 50%;
            margin: auto;
        }

        @media screen and (width < 478px) {
            width: 90%;
            margin: auto;
        }
        .legend-row {
            position: relative;
            display: flex;
            height: 1.75rem;
            font-size: 0.875rem;
            cursor: pointer;
            padding: 0.25rem 0;
            &:hover {
                @apply bg-secondary2;
                .legend-text {
                    text-decoration: underline;
                    &.error {
                        @apply text-red-500;
                    }
                    &.warning {
                        @apply text-yellow-500;
                    }
                    &.ok {
                        @apply text-green-500;
                    }
                }
                .right-part {
                    text-decoration: underline;
                }
            }
            &.error {
                @apply text-red-500;
            }
            &.warning {
                @apply text-yellow-500;
            }
            &.ok {
                @apply text-green-500;
            }
            .left-part {
                display: inline-flex;
                width: 90%;
                .legend-circle {
                    display: inline-block;
                    width: 0.5rem;
                    height: 0.5rem;
                    border-radius: 50%;
                    margin: auto 0.25rem auto 0;
                }
                .legend-text {
                    @apply text-gray-700;
                    line-height: 1.4;
                    width: 95%;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
            }
            .right-part {
                position: absolute;
                right: 0;
                vertical-align: text-bottom;
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

                @media screen and (576px < width < 1024px) {
                    width: 4%;
                }

                @media screen and (width < 576px) {
                    width: 8%;
                }
                .label-wrapper {
                    @apply text-gray-400;
                    display: inline-flex;
                    font-size: 0.75rem;
                    padding: 6px 0;
                    .text {
                        @apply text-gray-500;
                        white-space: nowrap;
                        margin-left: 0.25rem;
                    }
                }
            }
            .right-part {
                width: 80%;

                @media screen and (576px < width < 1024px) {
                    width: 96%;
                }

                @media screen and (width < 576px) {
                    width: 92%;
                }
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
                    &:hover {
                        text-decoration: underline;
                        &.error {
                            @apply bg-coral-200;
                        }
                        &.warning {
                            @apply bg-yellow-100;
                        }
                        &.ok {
                            @apply bg-peacock-100;
                        }
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
