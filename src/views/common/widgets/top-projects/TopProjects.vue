<template>
    <p-widget-layout title="Resources by Top 5 Projects" help="Top 5 Projects">
        <div class="flex justify-center">
            <p-chart-loader :loading="loading" class="chart">
                <canvas ref="chartRef" />
            </p-chart-loader>
        </div>
        <div class="mt-4">
            <p-data-table :fields="fields"
                          :sortable="false"
                          :selectable="false"
                          :loading="loading"
                          :items="data"
                          :top-border="false"
                          striped
            >
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
                    <p-tr>
                        <p-td class="text-center">
                            <p-i name="ic_top1" />
                        </p-td>
                        <p-td class="project-field">
                            {{ item.project_group }}
                        </p-td>
                        <p-td class="project-field">
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
    computed, defineComponent, Ref, toRefs,
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
    },
    setup() {
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
                .setBarPercentage(0.8)
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
            setTimeout(() => {
                resolve([{
                    project_group: 'Group',
                    project: 'Project',
                    servers: 300,
                    cloud_services: 325,
                }, {
                    project_group: 'Group',
                    project: 'Project',
                    servers: 200,
                    cloud_services: 325,
                }, {
                    project_group: 'Group',
                    project: 'Project',
                    servers: 200,
                    cloud_services: 325,
                }, {
                    project_group: 'Group',
                    project: 'Project',
                    servers: 100,
                    cloud_services: 325,
                }, {
                    project_group: 'Group',
                    project: 'Project',
                    servers: 50,
                    cloud_services: 325,
                }]);
            }, 1000);
        });


        const getData = async (): Promise<void> => {
            ts.state.loading = true;
            ts.state.data = await api();
            ts.state.loading = false;
        };

        getData();

        return {
            ...toRefs(ts.state),
        };
    },
});
</script>

<style lang="postcss" scoped>
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
    @apply flex items-center justify-center uppercase font-bold;
    font-family: theme('fontFamily.sans');
}
.project-field {
    font-family: theme('fontFamily.sans');
    font-size: 0.875rem;
    font-weight: bold;
}
.p-badge {
    font-weight: bold;
    font-size: 0.875rem;
}
</style>
