<template>
    <p-widget-layout title="Resources by Top 5 Projects" help="Top 5 Projects">
        <div class="flex justify-center">
            <p-dynamic-chart :dataset="dataset" type="horizontalBar"
                             :labels="labels"
                             :loading="loading"
                             :theme-props="themeProps"
                             class="chart"
            />
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
                            <!--                            {{ index + 1 }}-->
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
import _ from 'lodash';
import {
    computed, defineComponent, reactive, toRefs,
} from '@vue/composition-api';
import PWidgetLayout from '@/components/organisms/layouts/widget-layout/WidgetLayout.vue';
import PDynamicChart from '@/components/organisms/charts/dynamic-chart/DynamicChart.vue';
import PBadge from '@/components/atoms/badges/Badge.vue';
import PDataTable from '@/components/organisms/tables/data-table/DataTable.vue';
import { ChartData } from '@/components/organisms/charts/dynamic-chart/DynamicChart.toolset';
import { barDefaultThemeProps } from '@/components/organisms/charts/dynamic-chart/themes/bar-chart';
import { makeTrItems } from '@/lib/view-helper';
import { secondary, secondary1 } from '@/styles/colors';
import PTr from '@/components/atoms/table/Tr.vue';
import PTd from '@/components/atoms/table/Td.vue';
import PI from '@/components/atoms/icons/PI.vue';

export default defineComponent({
    name: 'TopProjects',
    components: {
        PWidgetLayout,
        PDynamicChart,
        PBadge,
        PDataTable,
        PTr,
        PTd,
        PI,
    },
    setup(props) {
        const state = reactive({
            data: [],
            loading: true,
            dataset: computed(() => [
                new ChartData('Server', state.data.map(d => d.servers)),
                new ChartData('Cloud Service', state.data.map(d => d.cloud_services)),
            ]),
            labels: computed(() => state.data.map((d, i) => `Top ${i + 1}`)),
            themeProps: computed(() => ({
                ...barDefaultThemeProps,
                colors: _.values(state.colors),
                stacked: true,
            })),
            fields: computed(() => makeTrItems([['rank', 'FIELD.RANK'],
                ['project_group', 'FIELD.PROJECT_GRP'],
                ['project', 'FIELD.PROJECT'],
                ['servers', 'FIELD.SERVER'],
                ['cloud_services', 'FIELD.CLOUD_SERVICE'],
            ])),
            colors: {
                servers: secondary,
                cloud_services: secondary1,
            },
        });

        const api = async () => new Promise((resolve) => {
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

        const getData = async () => {
            state.loading = true;
            state.data = await api();
            state.loading = false;
        };

        getData();

        return {
            ...toRefs(state),
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
