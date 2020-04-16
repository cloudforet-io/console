<template>
    <p-widget-layout title="Service Accounts">
        <div class="flex justify-center">
            <p-chart-loader :loading="loading" class="chart">
                <template #loader>
                    <canvas ref="loaderRef" />
                </template>
                <canvas ref="chartRef" />
            </p-chart-loader>
        </div>
        <div class="mt-4">
            <template v-if="loading">
                <div v-for="v in skeletons" :key="v" class="flex items-center p-4">
                    <p-skeleton width="1.5rem" height="1.5rem" class="mr-4 flex-shrink-0" />
                    <p-skeleton height="0.75rem" class="flex-grow" />
                </div>
            </template>
            <p-grid-layout v-else :items="items" row-gap="0.5rem"
                           column-gap="0"
                           card-height="auto" :card-class="() => []"
            >
                <template #card="{item, index}">
                    <p-selectable-item :icon-url="item.icon" theme="card"
                                       default-icon="ic_provider_other"
                                       @click="onItemClick(item, idx)"
                    >
                        <template #contents>
                            <span class="ml-2 text-base">{{ item.name }}</span>
                        </template>
                        <template #extra>
                            <p-badge :background-color="item.color" class="count">
                                {{ item.count }}
                            </p-badge>
                        </template>
                    </p-selectable-item>
                </template>
            </p-grid-layout>
        </div>
    </p-widget-layout>
</template>

<script lang="ts">
import {
    computed, defineComponent, getCurrentInstance, onMounted, reactive, Ref, toRefs, watch,
} from '@vue/composition-api';
import PWidgetLayout from '@/components/organisms/layouts/widget-layout/WidgetLayout.vue';
import PLazyImg from '@/components/organisms/lazy-img/LazyImg.vue';
import PBadge from '@/components/atoms/badges/Badge.vue';
import PGridLayout from '@/components/molecules/layouts/grid-layout/GridLayout.vue';
import PSelectableItem from '@/components/molecules/selectable-item/SelectableItem.vue';
import PSkeleton from '@/components/atoms/skeletons/Skeleton.vue';
import PChartLoader from '@/components/organisms/charts/chart-loader/ChartLoader.vue';
import { SPieChart } from '@/lib/chart/pie-chart';
import { ProviderStoreType, useStore } from '@/store/toolset';
import { violet, yellow } from '@/styles/colors';
import _ from 'lodash';
import Color from 'color';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';
import { fluentApi } from '@/lib/fluent-api';
import { OPERATORS } from '@/lib/fluent-api/statistics/toolset';
import casual from '@/lib/casual';
import { SChartToolSet } from '@/lib/chart/toolset';

export default defineComponent({
    name: 'ServiceAccounts',
    components: {
        PWidgetLayout,
        PLazyImg,
        PBadge,
        PGridLayout,
        PSelectableItem,
        PSkeleton,
        PChartLoader,
    },
    setup() {
        const vm: any = getCurrentInstance();

        const {
            provider,
        } = useStore();
        const providerStore: ProviderStoreType = provider;

        interface Value {
            provider: string;
            count: number;
        }

        const api = fluentApi.statisticsTest().stat().query<Value>()
            .setServiceType('identity.service-account')
            .setGroupBy('provider')
            .addField('provider', OPERATORS.value, 'provider')
            .addField('service_account_id', OPERATORS.count, 'count')
            .setSort('provider');

        interface Data {
            name: string;
            icon: string;
            color: string;
            count: number;
        }
        interface Item extends Data {
            provider: string;
        }
        interface StateInterface {
            loaderRef: HTMLCanvasElement | null;
            data: {
                [provider: string]: Data;
            };
            loading: boolean;
            items: Ref<Readonly<Item[]>>;
        }

        const others = {
            name: 'Others',
            icon: 'ic_provider_other',
            color: yellow[500],
        };


        const ts = new SChartToolSet<SPieChart, StateInterface>(SPieChart,
            chart => chart.addData(_.map(ts.state.data, d => d.count), 'Account')
                .setLabels(_.map(ts.state.data, d => d.name))
                .setColors(_.map(ts.state.data, d => d.color))
                .apply(), {
                loaderRef: null,
                data: {},
                loading: true,
                items: computed(() => _.map(ts.state.data, (d: Data, k) => ({
                    provider: k,
                    ...d,
                }))),
            });

        watch(() => ts.state.loaderRef, () => {
            if (!ts.state.loaderRef) return;
            new SPieChart(ts.state.loaderRef)
                .addData([8, 2], '').setTooltipEnabled(false)
                .setColors([violet[200], Color(violet[200]).alpha(0.5).toString()])
                .setBorderWidth(0)
                .setShowTotalCount(false)
                .setAnimationDuration(0)
                .apply();
        });

        const getData = async (): Promise<void> => {
            ts.state.loading = true;
            ts.state.data = {};
            await providerStore.getProvider();
            try {
                const res = await api.execute();
                _.forEach(res.data.values, (d: Value) => {
                    if (providerStore.state.providers[d.provider]) {
                        ts.state.data[d.provider] = {
                            ...providerStore.state.providers[d.provider],
                            count: d.count,
                        };
                    } else {
                        ts.state.data.others = {
                            ...others,
                            count: d.count,
                        };
                    }
                });
            } catch (e) {
                console.error(e);
                // TODO: no data case
                ts.state.data = {
                    aws: { ...providerStore.state.providers.aws, count: casual.integer(0, 50) },
                    azure: { ...providerStore.state.providers.azure, count: casual.integer(0, 50) },
                    // eslint-disable-next-line camelcase
                    google_cloud: { ...providerStore.state.providers.google_cloud, count: casual.integer(0, 50) },
                    others: {
                        name: 'Others', icon: 'ic_provider_other', color: yellow[500], count: casual.integer(0, 50),
                    },
                };
            } finally {
                ts.state.loading = false;
            }
        };

        getData();

        return {
            ...toRefs(ts.state),
            skeletons: _.range(4),
            onSelected(item): void {
                vm.$router.push('/identity/service-account');
            },
        };
    },
});
</script>

<style lang="postcss" scoped>
    .chart {
        height: 11.25rem;
    }
    .count {
        font-size: 0.875rem;
        font-weight: bold;
    }
</style>
