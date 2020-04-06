<template>
    <p-widget-layout class="service-accounts" title="Service Accounts">
        <div class="flex justify-center">
            <p-dynamic-chart :dataset="dataset" type="doughnut"
                             :labels="labels"
                             :loading="loading"
                             :theme-props="themeProps"
                             class="chart"
            />
        </div>
        <div class="mt-4">
            <p-selectable-list :items="data" :mapper="mapper" theme="card"
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
    computed, defineComponent, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import PWidgetLayout from '@/components/organisms/layouts/widget-layout/WidgetLayout.vue';
import PDynamicChart from '@/components/organisms/charts/dynamic-chart/DynamicChart.vue';
import PLazyImg from '@/components/organisms/lazy-img/LazyImg.vue';
import PBadge from '@/components/atoms/badges/Badge.vue';
import { ChartData } from '@/components/organisms/charts/dynamic-chart/DynamicChart.toolset';
import { pieDefaultThemeProps } from '@/components/organisms/charts/dynamic-chart/themes/pie-chart';
import PSelectableList from '@/components/organisms/lists/selectable-list/SelectableList.vue';

export default defineComponent({
    name: 'ServiceAccounts',
    components: {
        PWidgetLayout,
        PDynamicChart,
        PLazyImg,
        PBadge,
        PSelectableList,
    },
    setup() {
        const vm: any = getCurrentInstance();

        const state = reactive({
            data: [],
            loading: true,
            dataset: computed(() => [new ChartData('Account', state.data.map(d => d.count))]),
            labels: computed(() => state.data.map(d => d.name)),
            colors: computed(() => state.data.map(d => d.tags.color)),
            themeProps: computed(() => ({
                ...pieDefaultThemeProps,
                colors: state.colors,
            })),
        });

        const api = async () => new Promise((resolve) => {
            setTimeout(() => {
                resolve([{
                    name: 'AWS',
                    tags: {
                        icon: 'http://',
                        color: '#ff9900',
                    },
                    count: 0,
                }, {
                    name: 'GCP',
                    tags: {
                        icon: 'http://',
                        color: '#4285F4',
                    },
                    count: 0,
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

        const getData = async () => {
            state.loading = true;
            state.data = await api();
            state.loading = false;
        };

        getData();

        return {
            ...toRefs(state),
            mapper: {
                key: 'name',
                iconUrl: 'tags.icon',
                title: 'name',
                color: 'tags.color',
            },
            onSelected(item) {
                vm.$router.push('/identity/service-account');
            },
        };
    },
});
</script>

<style lang="postcss" scoped>
    .service-accounts {
        min-width: 330px;
        max-width: 446px;
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
