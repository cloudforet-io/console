<template>
    <p-widget-layout class="service-accounts" title="Service Accounts">
        <div class="flex justify-center">
            <p-chart-loader :loading="loading" class="chart">
                <canvas ref="chartRef" />
            </p-chart-loader>
        </div>
        <div class="mt-4">
            <p-selectable-list :items="data" :mapper="mapper" theme="card"
                               :loading="loading"
                               @selected="onSelected"
            >
                <template #contents="{item}">
                    <span class="ml-2 text-base">{{ item.name }}</span>
                </template>
                <template #extra="{item}">
                    <p-badge :background-color="item.tags.color" class="count">
                        {{ item.count }}
                    </p-badge>
                </template>
            </p-selectable-list>
        </div>
    </p-widget-layout>
</template>

<script lang="ts">
import {
    defineComponent, getCurrentInstance, toRefs,
} from '@vue/composition-api';
import PWidgetLayout from '@/components/organisms/layouts/widget-layout/WidgetLayout.vue';
import PLazyImg from '@/components/organisms/lazy-img/LazyImg.vue';
import PBadge from '@/components/atoms/badges/Badge.vue';
import PSelectableList from '@/components/organisms/lists/selectable-list/SelectableList.vue';
import PChartLoader from '@/components/organisms/charts/chart-loader/ChartLoader.vue';
import { SPieChart } from '@/lib/chart/pie-chart';
import { SChartToolSet } from '@/lib/chart/toolset';

export default defineComponent({
    name: 'ServiceAccounts',
    components: {
        PWidgetLayout,
        PLazyImg,
        PBadge,
        PSelectableList,
        PChartLoader,
    },
    setup() {
        const vm: any = getCurrentInstance();

        type DataType = {
            name: string;
            tags: {
                description?: string;
                icon: string;
                color: string;
            };
            count: number;
        };
        interface StateInterface {
            data: DataType[];
            loading: boolean;
        }

        const ts = new SChartToolSet<SPieChart, StateInterface>(SPieChart,
            (chart => chart.addData(ts.state.data.map(d => d.count), 'Account')
                .setLabels(ts.state.data.map(d => d.name))
                .setColors(ts.state.data.map(d => d.tags.color))
                .apply()), {
                data: [],
                loading: true,
            });

        const api = async (): Promise<DataType[]> => new Promise<DataType[]>((resolve) => {
            setTimeout(() => {
                resolve([{
                    name: 'AWS',
                    tags: {
                        icon: 'http://',
                        color: '#ff9900',
                    },
                    count: 3,
                }, {
                    name: 'GCP',
                    tags: {
                        description: 'GCP', // front-end data = name
                        icon: 'http://', // front-end data
                        color: '#4285F4', // front-end data
                    },
                    count: 4,
                }, {
                    name: 'Azure',
                    tags: {
                        icon: 'http://',
                        color: '#00BCF2',
                    },
                    count: 0,
                }, {
                    name: 'Others',
                    tags: {
                        icon: 'http://',
                        color: '#FFCE02',
                    },
                    count: 0,
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
            mapper: {
                key: 'name',
                iconUrl: 'tags.icon',
                title: 'name',
            },
            onSelected(item): void {
                vm.$router.push('/identity/service-account');
            },
        };
    },
});
</script>

<style lang="postcss" scoped>
    .service-accounts {
        min-width: 330px;
    }
    .chart {
        width: 180px;
        height: 180px;
    }
    .count {
        font-size: 0.875rem;
        font-weight: bold;
    }
</style>
