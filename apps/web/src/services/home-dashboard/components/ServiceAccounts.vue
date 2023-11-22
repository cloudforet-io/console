<script lang="ts" setup>
import {
    computed, reactive, watch, ref, onBeforeUnmount,
} from 'vue';
import type { Location } from 'vue-router';

import {
    PDataLoader, PDataTable, PI, PEmpty, PSkeleton,
} from '@spaceone/design-system';
import {
    cloneDeep, debounce, forEach, isEmpty, sum,
} from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { store } from '@/store';
import { i18n } from '@/translations';

import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';

import WidgetLayout from '@/common/components/layouts/WidgetLayout.vue';
import { useAmcharts5 } from '@/common/composables/amcharts5';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { white } from '@/styles/colors';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-config';


interface Data {
    provider?: string;
    providerLabel: string;
    service_account_count: number;
    href: string;
    pieSettings: {
        fill: string;
    };
}
interface Props {
    extraParams?: object;
}

const props = withDefaults(defineProps<Props>(), {
    extraParams: () => ({}),
});
const CATEGORY_KEY = 'providerLabel';
const VALUE_KEY = 'service_account_count';

const chartContext = ref<HTMLElement|null>(null);
const chartHelper = useAmcharts5(chartContext);
const state = reactive({
    providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
    loading: true,
    data: [] as Data[],
    totalServiceAccountCount: computed<number>(() => sum(state.data.map((d) => d.service_account_count))),
    fields: computed(() => [
        { name: 'provider', label: i18n.t('COMMON.WIDGETS.SERVICE_ACCOUNTS_PROVIDER') },
        { name: 'service_account_count', label: i18n.t('COMMON.WIDGETS.SERVICE_ACCOUNTS_ACCOUNT') },
    ]),
});

/* Util */
const drawChart = () => {
    // refresh chart root
    chartHelper.refreshRoot();

    // create donut chart
    const chart = chartHelper.createDonutChart();

    // create pie series
    const seriesSettings = {
        categoryField: CATEGORY_KEY,
        valueField: VALUE_KEY,
        strokeWidth: 1,
    };
    const series = chartHelper.createPieSeries(seriesSettings);
    chart.series.push(series);
    series.slices.template.setAll({
        stroke: chartHelper.color(white),
        templateField: 'pieSettings',
    });

    // create tooltip
    const tooltip = chartHelper.createTooltip();
    chartHelper.setPieTooltipText(series, tooltip);
    series.slices.template.set('tooltip', tooltip);

    // set data to series
    series.data.setAll(cloneDeep(state.data));

    // create label text inside pie
    chartHelper.setPieLabelText(chart, {
        fontSize: 25,
        text: state.totalServiceAccountCount,
    });
};

const getLink = (data): Location => ({
    name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT._NAME,
    query: {
        provider: data.provider,
    },
});

/* Api */
const getData = debounce(async () => {
    state.loading = true;
    const data: Data[] = [];
    try {
        const { results } = await SpaceConnector.client.statistics.topic.serviceAccountByProvider(props.extraParams);
        forEach(results, (d) => {
            data.push({
                ...d,
                provider: d.provider,
                providerLabel: state.providers[d.provider]?.label,
                href: getLink(d),
                pieSettings: {
                    fill: state.providers[d.provider].color || '',
                },
            });
        });
        state.data = data;
    } catch (e) {
        state.data = [];
        ErrorHandler.handleError(e);
    } finally {
        state.loading = false;
    }
}, 300);

/* Init */
(async () => {
    await store.dispatch('reference/provider/load', true);
})();

/* Watcher */
watch(() => state.providers, (providers) => {
    if (!isEmpty(providers)) getData();
}, { immediate: true });
watch([() => state.loading, () => chartContext.value], ([loading, _chartContext]) => {
    if (!loading && _chartContext) {
        drawChart();
    }
}, { immediate: true });

onBeforeUnmount(() => {
    chartHelper.disposeRoot();
});
</script>

<template>
    <widget-layout class="service-accounts">
        <template #title>
            <div class="top">
                <p class="title">
                    {{ $t('COMMON.WIDGETS.SERVICE_ACCOUNTS') }}
                </p>
                <router-link :to="{ name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT._NAME }"
                             class="add-btn"
                >
                    <p-i name="ic_plus"
                         width="1rem"
                         height="1rem"
                         color="inherit"
                    /> {{ $t('COMMON.WIDGETS.SERVICE_ACCOUNTS_ADD') }}
                </router-link>
            </div>
        </template>
        <div class="content-wrapper">
            <p-data-loader :loading="state.loading"
                           :data="state.data"
                           class="chart"
            >
                <template #loader>
                    <div class="loader-wrapper">
                        <p-skeleton width="6.25rem"
                                    height="6.25rem"
                                    class="mb-6 mt-6"
                        />
                        <div class="text-left">
                            <p-skeleton width="80%"
                                        height="0.625rem"
                            />
                            <p-skeleton width="100%"
                                        height="0.625rem"
                            />
                        </div>
                    </div>
                </template>
                <div ref="chartContext"
                     class="chart"
                />
                <div class="table-wrapper">
                    <p-data-table :loading="state.loading"
                                  :fields="state.fields"
                                  :items="state.data"
                                  :bordered="false"
                    >
                        <template #col-provider-format="{ item }">
                            <router-link :to="getLink(item)">
                                <span :style="{color: item.color}"
                                      class="provider-label"
                                >{{ state.providers[item.provider].label }}</span>
                            </router-link>
                        </template>
                    </p-data-table>
                </div>
                <template #no-data>
                    <p-empty
                        show-image
                        class="no-data-wrapper"
                        :title="$t('COMMON.WIDGETS.SERVICE_ACCOUNTS_NO_ACCOUNT')"
                    />
                </template>
            </p-data-loader>
        </div>
    </widget-layout>
</template>

<style lang="postcss" scoped>
.top {
    @apply flex justify-between items-center pb-4;
    .title {
        @apply text-gray-900;
        font-size: 1rem;
        line-height: 1.2;
        font-weight: bold;
    }
    .add-btn {
        @apply flex-shrink-0 flex justify-end items-center text-blue-600;
        line-height: 1.2;
        font-size: 0.75rem;
        &:hover {
            @apply text-blue-800;
        }
    }
}

.content-wrapper {
    @apply flex justify-center items-center mb-4;

    .loader-wrapper {
        width: 100%;
        text-align: center;
    }

    .chart {
        min-height: 11.25rem;
        width: 100%;
    }

    .table-wrapper {
        @apply w-full flex-grow justify-center items-center m-auto overflow-y-auto;
    }

    /* custom design-system component - p-data-loader */
    :deep(.p-data-loader) {
        .no-data-wrapper {
            display: flex;
            height: 100%;
        }
    }
}

/* custom design-system component - p-data-table */
:deep(.p-data-table) {
    @apply rounded-xs;
    margin-top: 1rem;
    min-height: auto;
    overflow-x: hidden;
    &.default th {
        @apply bg-gray-100 text-gray-400;
        height: 1.5rem;
        border: none;
        font-size: 0.75rem;
        width: 3.75rem;
    }
    td {
        width: 3.75rem;
        height: 2rem;
    }
}
.provider-label {
    &:hover {
        text-decoration: underline;
    }
}

/* custom design-system component - p-empty */
:deep(.p-empty) {
    padding-top: 1.25rem;
}
</style>
