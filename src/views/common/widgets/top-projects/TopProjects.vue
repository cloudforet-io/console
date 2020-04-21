<template>
    <p-widget-layout title="Resources by Top 5 Projects" help="Top 5 Projects" class="top-projects">
        <div class="flex justify-center">
            <p-chart-loader :loading="loading" class="chart">
                <template #loader>
                    <p-skeleton width="100%" height="100%" />
                </template>
                <canvas ref="chartRef" />
            </p-chart-loader>
        </div>
        <div class="mt-4 overflow-auto">
            <p-data-table :fields="fields"
                          :sortable="false"
                          :selectable="false"
                          :loading="loading"
                          :items="data"
                          :top-border="false"
                          class="data-table"
                          @rowLeftClick="onRowClick"
            >
                <template #skeleton-rank>
                    <p-skeleton width="1.5rem" height="1.5rem" />
                </template>
                <template #no-data="{fields}">
                    <p-tr key="noData" class="bg-primary3">
                        <p-td :colspan="3" class="rounded-l-sm" />
                        <p-td class="text-center">
                            <p-badge :background-color="colors.servers">
                                0
                            </p-badge>
                        </p-td>
                        <p-td class="text-center rounded-r-sm">
                            <p-badge :background-color="colors.cloud_services">
                                0
                            </p-badge>
                        </p-td>
                    </p-tr>
                    <p-tr key="blank" class="!bg-white h-2" />
                    <p-tr key="create-project" class="!bg-gray-100 cursor-pointer">
                        <router-link to="/identity/project" tag="td" :colspan="fields.length"
                                     class="rounded-sm text-center"
                        >
                            <p-i name="ic_plus_square" width="1rem" height="1rem"
                                 class="mr-4"
                            />
                            Create a Project
                        </router-link>
                    </p-tr>
                </template>

                <!-- th -->
                <template #th-rank="{field}">
                    <div class="text-center">
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
                    <p-tr @click="onRowClick">
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
                                {{ item.servers }}
                            </p-badge>
                        </p-td>
                        <p-td class="text-center">
                            <p-badge :background-color="colors.cloud_services">
                                {{ item.cloud_services }}
                            </p-badge>
                        </p-td>
                    </p-tr>
                </template>

                <!-- others -->
                <template #col-project_group="{value}">
                    <p-td v-tooltip.bottom="{content: value, delay: {show: 500}}">
                        {{ value }}
                    </p-td>
                </template>
                <template #col-project="{value}">
                    <p-td v-tooltip.bottom="{content: value, delay: {show: 500}}">
                        {{ value }}
                    </p-td>
                </template>
                <template #col-rank-format="{index}">
                    <div class="text-center">
                        {{ index + 1 }}
                    </div>
                </template>
                <template #col-servers-format="{value}">
                    <div class="text-center font-bold" :style="{color: colors.servers}">
                        {{ value }}
                    </div>
                </template>
                <template #col-cloud_services-format="{value}">
                    <div class="text-center font-bold" :style="{color: colors.cloud_services}">
                        {{ value }}
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
import {
    secondary, secondary1,
} from '@/styles/colors';
import PTr from '@/components/atoms/table/Tr.vue';
import PTd from '@/components/atoms/table/Td.vue';
import PI from '@/components/atoms/icons/PI.vue';
import PChartLoader from '@/components/organisms/charts/chart-loader/ChartLoader.vue';
import { SChartToolSet } from '@/lib/chart/toolset';
import { SBarChart } from '@/lib/chart/bar-chart';
import PSkeleton from '@/components/atoms/skeletons/Skeleton.vue';
import casual, { arrayOf } from '@/lib/casual';
import { languages } from 'monaco-editor';

import css = languages.css;


export default defineComponent({
    name: 'TopProjects',
    components: {
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

        interface DataType {
            project_group: string;
            project: string;
            servers: number;
            cloud_services: number;
        }

        interface InitDataType {
            data: Array<DataType | undefined>;
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

        const api = async (): Promise<DataType[]> => new Promise((resolve) => {
            resolve(arrayOf(5, () => ({
                project_group: casual.text,
                project: casual.text,
                servers: casual.integer(0, 300),
                cloud_services: casual.integer(0, 300),
            })) as DataType[]);
        });


        const getData = async (): Promise<void> => {
            ts.state.loading = true;
            ts.state.data = await api();
            ts.state.loading = false;
        };

        setTimeout(() => {
            getData();
        }, 1000);

        return {
            ...toRefs(ts.state),
            onRowClick() {
                vm.$router.push('/identity/project');
            },
        };
    },
});
</script>

<style lang="postcss" scoped>
.top-projects::v-deep .widget-contents {
    padding-bottom: 1.5rem;
}
.chart {
    height: 180px;
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
    td {
        @apply truncate cursor-pointer;
        &:first-child {
            padding: 0;
        }
    }
    th {
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
</style>
