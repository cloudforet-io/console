<template>
    <p-widget-layout title="Resources by Region" class="resources-by-region">
        <div class="reverse">
            <div class="chart-container">
                <p-chart-loader :loading="loading" class="chart">
                    <template #loader>
                        <canvas ref="loaderRef" />
                    </template>
                    <canvas ref="chartRef" />
                </p-chart-loader>
            </div>
            <div class="legends">
                <template v-if="loading">
                    <div v-for="v in skeletons" :key="v" class="flex items-center p-4">
                        <p-skeleton width="1.5rem" height="1.5rem" class="mr-4 flex-shrink-0" />
                        <p-skeleton class="flex-grow" />
                    </div>
                </template>
                <p-grid-layout v-else :items="isNoData ? defaultItems : data" row-gap="0.5rem"
                               column-gap="0" :fix-column="1" card-min-width="0"
                               card-height="auto" :card-class="() => []"
                >
                    <template #card="{item, index}">
                        <p-selectable-item :icon-url="item.icon" theme="card"
                                           default-icon="ic_provider_other"
                                           @click="onSelected(item, index)"
                        >
                            <template #contents>
                                <div v-tooltip.bottom="{content: item.name, delay: {show: 500}}"
                                     class="mx-2 text-base truncate leading-tight"
                                >
                                    {{ item.name }}
                                </div>
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
        </div>
    </p-widget-layout>
</template>

<script lang="ts">
import {
    computed,
    getCurrentInstance, Ref, toRefs, watch,
} from '@vue/composition-api';
import PWidgetLayout from '@/components/organisms/layouts/widget-layout/PWidgetLayout.vue';
import PBadge from '@/components/atoms/badges/PBadge.vue';
import PGridLayout from '@/components/molecules/layouts/grid-layout/PGridLayout.vue';
import PSelectableItem from '@/components/molecules/selectable-item/PSelectableItem.vue';
import PSkeleton from '@/components/atoms/skeletons/PSkeleton.vue';
import PChartLoader from '@/components/organisms/charts/chart-loader/PChartLoader.vue';
import { SPieChart } from '@/lib/chart/pie-chart';
import { ProviderInfo, ProviderStoreType, useStore } from '@/store/toolset';
import {
    blue, coral, green, peacock, violet, yellow,
} from '@/styles/colors';
import _ from 'lodash';
import Color from 'color';
import { fluentApi } from '@/lib/fluent-api';
import { SChartToolSet } from '@/lib/chart/toolset';
import { STAT_OPERATORS } from '@/lib/fluent-api/statistics/type';
import {
    resourceByRegionProps,
    ResourcesByRegionProps,
} from '@/views/common/widgets/resources-by-region/ResourcesByRegion.toolset';

export default {
    name: 'ResourcesByRegion',
    components: {
        PWidgetLayout,
        PBadge,
        PGridLayout,
        PSelectableItem,
        PSkeleton,
        PChartLoader,
    },
    props: resourceByRegionProps,
    setup(props: ResourcesByRegionProps) {
        const vm: any = getCurrentInstance();

        const {
            provider,
        } = useStore();
        const providerStore: ProviderStoreType = provider;

            interface Value {
                provider: string;
                count: number;
                region_name: string;
            }

            const api = fluentApi.statisticsTest().resource().stat<Value>()
                .addGroupKey('provider', 'provider')
                .addGroupField('count', STAT_OPERATORS.count);

            interface Item {
                name: string;
                icon: string;
                color: string;
                count: number;
            }
            interface StateInterface {
                loaderRef: HTMLCanvasElement | null;
                data: Item[];
                loading: boolean;
                isNoData: Ref<boolean>;
            }

            const colors = [coral[500], blue[500], violet[500], yellow[500], green[400],
                coral[400], peacock[600], coral[200], peacock[400], green[200],
                coral[300], peacock[700], coral[300], peacock[300], green[300],
            ];
            const ts = new SChartToolSet<SPieChart, StateInterface>(SPieChart,
                chart => chart.addData(_.map(ts.state.data, d => d.count), 'Account')
                    .setLabels(_.map(ts.state.data, d => d.name))
                    .setDefaultCount(4)
                    .setColors(colors)
                    .apply(), {
                    loaderRef: null,
                    data: [],
                    loading: true,
                    isNoData: computed(() => ts.state.data.length === 0),
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

            const defaultItems = _.range(4).map((d, index) => ({
                name: 'region',
                color: colors[index],
                count: 0,
                icon: 'ic_provider_other',
            }));

            const getData = async (): Promise<void> => {
                ts.state.loading = true;
                ts.state.data = [];
                await providerStore.getProvider();
                const providers: ProviderInfo = providerStore.state.providers;
                try {
                    const res = await props.getAction(api).execute();
                    ts.state.data = res.data.results.map((item, index) => ({
                        name: item.region_name,
                        count: item.count,
                        provider: item.provider,
                        icon: providers[item.provider].icon,
                        color: colors[index],
                    }));
                } catch (e) {
                    console.error(e);
                } finally {
                    ts.state.loading = false;
                }
            };

            setTimeout(() => {
                getData();
            }, 1000);

            return {
                ...toRefs(ts.state),
                skeletons: _.range(4),
                defaultItems,
                onSelected(item) {
                    if (props.projectFilter && props.isServer) {
                        vm.$router.push({
                            path: `/inventory/server?&f=data.compute.region_name%3A${item.name}${props.projectFilter}`,
                        });
                    }
                    if (props.projectFilter && !props.isServer) {
                        vm.$router.push({
                            path: `/inventory/cloud-service?provider=${item.provider || 'all'}${props.projectFilter}&f=data.region_name%3A${item.name}`,
                        });
                    }
                },
            };
            ///inventory/cloud-service?f=project_id%3A&f=project_id%3A%3Dproject-22ba4e072a5f&f=data.region_name%3Aap-northeast-2
            ///inventory/cloud-service?f=project_id%3A%3Dproject-22ba4e072a5f&f=data.region_name%3Aap-northeast-2
    },
};
</script>

<style lang="postcss" scoped>
    .resources-by-region {
        border:none;
        height: 27.1rem;
    &::v-deep .widget-contents {
         overflow-y: auto;
         margin-bottom: 2rem;
     }
    }
    .chart {
        height: 11.25rem;
    }
    .count {
        font-size: 0.875rem;
        font-weight: bold;
    }
    .legends {
        @apply w-full flex-grow justify-center items-center m-auto;
    }
    .chart-container {
        @apply flex justify-center items-center mb-4;
    }
    .reverse {
        @apply block mb-0;
    }

    @screen md {
        .reverse {
            @apply flex flex-row-reverse;
        .chart-container {
            min-width: 40%;
            .chart {
                height: 13.3rem;
            }
        }
      }
    }
</style>
