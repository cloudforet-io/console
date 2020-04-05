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
            <router-link v-for="(d, i) in data" :key="labels[i]"
                         to="/identity/service-account"
                         class="legend"
            >
                <div class="bar" :style="{backgroundColor: d.tags.color}" />
                <p-lazy-img :img-url="d.tags.icon" height="2rem" width="2rem" />
                <span class="name">{{ d.name }}</span>
                <p-badge :background-color="d.tags.color" class="count">
                    {{ d.count }}
                </p-badge>
            </router-link>
        </div>
    </p-widget-layout>
</template>

<script lang="ts">
import {
    computed, defineComponent, reactive, toRefs,
} from '@vue/composition-api';
import PWidgetLayout from '@/components/organisms/layouts/widget-layout/WidgetLayout.vue';
import PDynamicChart from '@/components/organisms/charts/dynamic-chart/DynamicChart.vue';
import PLazyImg from '@/components/organisms/lazy-img/LazyImg.vue';
import PBadge from '@/components/atoms/badges/Badge.vue';
import { ChartData } from '@/components/organisms/charts/dynamic-chart/DynamicChart.toolset';
import { pieDefaultThemeProps } from '@/components/organisms/charts/dynamic-chart/themes/pie-chart';

export default defineComponent({
    name: 'ServiceAccounts',
    components: {
        PWidgetLayout,
        PDynamicChart,
        PLazyImg,
        PBadge,
    },
    setup() {
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
    .legend {
        @apply border border-gray-200;
        border-radius: 2px;
        display: flex;
        width: 100%;
        align-items: center;
        height: 3rem;
        margin-top: 0.5rem;
        cursor: pointer;
        &:hover {
            @apply bg-blue-200;
        }
        .bar {
            border-radius: 2px 0 0 2px;
            width: 4px;
            margin-right: 0.625rem;
            height: 100%;
        }
        .name {
            margin-left: 1rem;
            flex-grow: 1;
        }
        .count {
            margin-right: 1rem;
            font-size: 0.875rem;
            font-weight: bold;
        }
    }
</style>
