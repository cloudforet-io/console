<template>
    <p-widget-layout title="Top 5 Resource Managing Projects" help="Check project ranking with most resources and service." class="top-projects">
        <div class="flex flex-col h-full">
            <p-chart-loader :loading="loading" class="chart">
                <template #loader>
                    <p-skeleton width="100%" height="100%" />
                </template>
                <canvas ref="chartRef" />
            </p-chart-loader>
            <div v-if="!loading && data.length === 0"
                 class="flex flex-col h-full justify-center items-center pt-16 pb-10"
            >
                <p class="text-2xl font-bold capitalize mb-4 text-primary text-center leading-tight">
                    {{ $t('DASHBOARD.ACTION.CRT_DBD') }}
                </p>
                <p class="text-primary1 text-sm capitalize mb-4 text-center leading-normal">
                    {{ $t('DASHBOARD.ACTION.CRT_GUIDE') }}
                </p>
                <router-link to="/project" tag="div" class="">
                    <p-icon-text-button name="ic_back" icon-direction="right"
                                        size="lg" dir="down"
                                        style-type="primary" icon-color="transparent inherit"
                                        width="1.5rem" height="1.5rem"
                                        class="getstarted"
                    >
                        {{ $t('DASHBOARD.BTN.GET_START') }}
                    </p-icon-text-button>
                </router-link>
            </div>
            <p-data-table v-else
                          :fields="fields"
                          :sortable="false"
                          :selectable="false"
                          :loading="loading"
                          :items="data"
                          :top-border="false"
                          :bordered="false"
                          :responsive-style="{
                              overflow: 'auto',
                              marginTop: '1rem'
                          }"
                          class="data-table"
                          @rowLeftClick="onRowClick"
            >
                <template #skeleton-rank>
                    <p-skeleton width="1.5rem" height="1.5rem" />
                </template>

                <!-- th -->
                <template #th-rank="{field}">
                    <div class="text-center text-gray">
                        {{ field.label }}
                    </div>
                </template>
                <template #th-servers="{field}">
                    <div class="custom-th"
                         :style="{color: colors.servers}"
                    >
                        <span class="color" />
                        {{ field.label }}
                    </div>
                </template>
                <template #th-cloud_services="{field}">
                    <div class="custom-th"
                         :style="{color: colors.cloud_services}"
                    >
                        <span class="color" />
                        {{ field.label }}
                    </div>
                </template>

                <!-- top 1 row -->
                <template #row-0="{index, fields, item}">
                    <p-tr @click="onRowClick(item)">
                        <p-td class="text-center">
                            <p-i name="ic_top1" />
                        </p-td>
                        <p-td v-tooltip.bottom="{content: item.project_group, delay: {show: 500}}" class="project-field">
                            {{ item.project_group }}
                        </p-td>
                        <p-td v-tooltip.bottom="{content: item.project, delay: {show: 500}}" class="project-field">
                            {{ item.project }}
                        </p-td>
                        <p-td class="text-center">
                            <p-badge :background-color="colors.servers">
                                {{ item.servers || 0 }}
                            </p-badge>
                        </p-td>
                        <p-td class="text-center">
                            <p-badge :background-color="colors.cloud_services">
                                {{ item.cloud_services || 0 }}
                            </p-badge>
                        </p-td>
                    </p-tr>
                </template>

                <!-- others -->
                <template #col-project_group="{value}">
                    <p-td v-tooltip.bottom="{content: value, delay: {show: 500}}">
                        {{ value || 0 }}
                    </p-td>
                </template>
                <template #col-project="{value}">
                    <p-td v-tooltip.bottom="{content: value, delay: {show: 500}}">
                        {{ value || 0 }}
                    </p-td>
                </template>
                <template #col-rank-format="{index}">
                    <div class="text-center">
                        {{ index + 1 }}
                    </div>
                </template>
                <template #col-servers-format="{value}">
                    <div class="text-center font-bold" :style="{color: colors.servers}">
                        {{ value || 0 }}
                    </div>
                </template>
                <template #col-cloud_services-format="{value}">
                    <div class="text-center font-bold" :style="{color: colors.cloud_services}">
                        {{ value || 0 }}
                    </div>
                </template>
            </p-data-table>
        </div>
    </p-widget-layout>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import _ from 'lodash';
import {
    computed, defineComponent, getCurrentInstance, Ref, toRefs,
} from '@vue/composition-api';
import PWidgetLayout from '@/components/organisms/layouts/widget-layout/WidgetLayout.vue';
import PBadge from '@/components/atoms/badges/Badge.vue';
import PDataTable from '@/components/organisms/tables/data-table/DataTable.vue';
import { makeTrItems } from '@/lib/view-helper';
import { secondary, secondary1 } from '@/styles/colors';
import PTr from '@/components/atoms/table/Tr.vue';
import PTd from '@/components/atoms/table/Td.vue';
import PI from '@/components/atoms/icons/PI.vue';
import PChartLoader from '@/components/organisms/charts/chart-loader/ChartLoader.vue';
import { SChartToolSet } from '@/lib/chart/toolset';
import { SBarChart } from '@/lib/chart/bar-chart';
import PSkeleton from '@/components/atoms/skeletons/Skeleton.vue';
import { fluentApi } from '@/lib/fluent-api';
import { STAT_OPERATORS } from '@/lib/fluent-api/statistics/type';
import PIconTextButton from '@/components/molecules/buttons/IconTextButton.vue';

export default {
    name: 'TopProjects',
    components: {
        PIconTextButton,
        PWidgetLayout,
        PBadge,
        PDataTable,
        PTr,
        PTd,
        PI,
        PChartLoader,
        PSkeleton,
    },
    setup() {
        const vm: any = getCurrentInstance();

        interface Value {
            project_id: string;
            project: string;
            project_group: string;
            servers?: number;
            cloud_services?: number;
            total?: number;
        }

        interface InitDataType {
            data: Value[];
            loading: boolean;
            colors: {
                servers: string;
                cloud_services: string;
            };
            fields: Ref<Readonly<string[]>>;
        }

        const ts = new SChartToolSet<SBarChart, InitDataType>(SBarChart,
            (chart: SBarChart) => (chart.addData(ts.state.data.map(d => d.servers), 'Server')
                .addData(ts.state.data.map(d => d.cloud_services), 'Cloud Service')
                .setLabels(ts.state.data.map((d, i) => `Top ${i + 1}`))
                .setColors(_.values(ts.state.colors))
                .setTicksCount(7)
                .setCategoryPercentage(0.75)
                .setBarPercentage(0.5)
                .setStacked(true)
                .apply()), {
                data: [],
                loading: true,
                colors: {
                    servers: secondary,
                    cloud_services: secondary1,
                },
                fields: computed(() => makeTrItems([['rank', 'FIELD.RANK'],
                    ['project_group', 'FIELD.PROJECT_GRP'],
                    ['project', 'FIELD.PROJECT'],
                    ['servers', 'FIELD.SERVER'],
                    ['cloud_services', 'FIELD.CLOUD_SERVICE'],
                ])),
            }, { type: 'horizontalBar' });

        const api = fluentApi.statisticsTest().resource().stat<Value>()
            .setResourceType('identity.Project')
            .addGroupKey('project_id', 'project_id')
            .addGroupKey('name', 'project')
            .addGroupKey('project_group.name', 'project_group')
            .setJoinResourceType('inventory.Server')
            .addJoinKey('project_id')
            .addJoinGroupKey('project_id', 'project_id')
            .addJoinGroupField('servers', STAT_OPERATORS.count)
            .setJoinResourceType('inventory.CloudService', 1)
            .addJoinKey('project_id', 1)
            .addJoinGroupKey('project_id', 'project_id', 1)
            .addJoinGroupField('cloud_services', STAT_OPERATORS.count, undefined, 1)
            .addFormula('total', 'cloud_services + servers')
            .setSort('total')
            .setLimit(5);


        const getData = async (): Promise<void> => {
            ts.state.loading = true;
            try {
                const res = await api.execute();
                ts.state.data = res.data.results;
            } catch (e) {
                console.error(e);
            } finally {
                ts.state.loading = false;
            }
        };

        getData();

        return {
            ...toRefs(ts.state),
            onRowClick(item) {
                vm.$router.push(`/project/${item.project_id}`);
            },
        };
    },
};
</script>

<style lang="postcss" scoped>
.top-projects::v-deep .widget-contents {
    padding-bottom: 1.5rem;
}
.chart {
    height: 180px;
    width: 100%;
    flex-shrink: 0;
}
.color {
    display: inline-block;
    width: 0.75rem;
    height: 0.75rem;
    margin-right: 0.5rem;
    border-radius: 2px;
    background-color: currentColor;
}
.custom-th {
    @apply flex items-center justify-center uppercase font-bold px-1;
    font-size: 0.75rem;
}
.project-field {
    @apply truncate font-bold;
}
.p-badge {
    @apply font-bold;
}
.data-table::v-deep {
    .p-table {
        table-layout: fixed;
        font-size: 0.875rem;
    }
    tr {
        &:nth-child(2n+1) {
            @apply bg-primary4;
        }
    }
    td {
        @apply truncate cursor-pointer;
        &:first-child {
            padding: 0;
        }
    }
    th {
        .th-contents {
            @apply text-gray;
        }
        &:first-child {
            width: 2.75rem;
        }
        &:nth-child(2) {
            width: 8.875rem;
        }
        &:nth-child(3) {
            width: 6.25rem;
        }
        &:nth-child(4) {
            width: 6rem;
        }
        &:last-child {
            width: 9rem;
        }
    }
}
.getstarted{
    padding-left:1.2rem;
    width: 100%;
    max-width: 12rem;
}
</style>
