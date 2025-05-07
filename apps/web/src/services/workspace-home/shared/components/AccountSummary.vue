<script setup lang="ts">
import {
    computed, reactive, ref, toRef, watch,
} from 'vue';

import type { PieSeriesOption } from 'echarts/charts';
import type { EChartsType } from 'echarts/core';
import { init } from 'echarts/core';
import { countBy, isEmpty, map } from 'lodash';

import { QueryHelper } from '@cloudforet/core-lib/query';
import {
    PStatus, PFieldTitle, PLazyImg, PDivider, PLink, PSpinner, PProgressBar,
} from '@cloudforet/mirinae';
import { numberFormatter } from '@cloudforet/utils';

import { useServiceAccountApi } from '@/api-clients/identity/service-account/composables/use-service-account-api';
import type { ServiceAccountListParameters } from '@/api-clients/identity/service-account/schema/api-verbs/list';
import type { ServiceAccountModel } from '@/api-clients/identity/service-account/schema/model';
import { useScopedQuery } from '@/query/composables/use-scoped-query';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';
import { i18n } from '@/translations';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAuthorizationStore } from '@/store/authorization/authorization-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProviderReferenceMap } from '@/store/reference/provider-reference-store';

import { assetUrlConverter } from '@/lib/helper/asset-helper';
import { MENU_ID } from '@/lib/menu/config';

import { SERVICE_ACCOUNT_ROUTE } from '@/services/service-account/routes/route-constant';
import { serviceAccountStateSummaryFormatter } from '@/services/workspace-home/composables/use-workspace-home';
import EmptySummaryData from '@/services/workspace-home/shared/components/EmptySummaryData.vue';
import { SUMMARY_DATA_TYPE } from '@/services/workspace-home/shared/constants/summary-type-constant';
import type { EmptyData } from '@/services/workspace-home/shared/types/empty-data-type';
import type { WidgetMode } from '@/services/workspace-home/shared/types/widget-mode-type';

const props = withDefaults(defineProps<{
    projectIds?: string[];
    mode?: WidgetMode;
}>(), {
    projectIds: undefined,
    mode: 'workspace',
});


const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;
const userWorkspaceStore = useUserWorkspaceStore();
const userWorkspaceGetters = userWorkspaceStore.getters;
const authorizationStore = useAuthorizationStore();

const totalChartContext = ref<HTMLElement|null>(null);
const providerChartContext = ref<HTMLElement|null>(null);

const storeState = reactive({
    currentWorkspaceId: computed<string|undefined>(() => userWorkspaceGetters.currentWorkspaceId),
    provider: computed<ProviderReferenceMap>(() => allReferenceGetters.provider),
});

const { serviceAccountAPI } = useServiceAccountApi();
const { key: serviceAccountQueryKey, params } = useServiceQueryKey('identity', 'service-account', 'list', {
    params: computed<ServiceAccountListParameters>(() => ({
        query: {
            filter: props.projectIds?.length ? [{
                k: 'project_id',
                v: props.projectIds,
                o: 'in',
            }] : undefined,
        },
    })),
    contextKey: toRef(props, 'mode'),
});

const enabled = computed(() => {
    if (props.mode === 'workspace') return true;
    return props.projectIds && props.projectIds.length > 0;
});

const { data: serviceAccountData, isLoading: isLoadingServiceAccount } = useScopedQuery({
    queryKey: serviceAccountQueryKey,
    enabled,
    queryFn: () => serviceAccountAPI.list(params.value),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
}, ['WORKSPACE']);

const state = reactive({
    accessLink: computed<boolean>(() => !isEmpty(authorizationStore.getters.pageAccessPermissionMap[MENU_ID.SERVICE_ACCOUNT])),
    writableServiceAccount: computed<boolean|undefined>(() => authorizationStore.getters.pageAccessPermissionMap[MENU_ID.SERVICE_ACCOUNT]?.write),
    emptyData: computed<EmptyData|undefined>(() => {
        let result: EmptyData|undefined;
        if (isEmpty(serviceAccountData.value?.results)) {
            result = {
                to: state.writableServiceAccount ? { name: SERVICE_ACCOUNT_ROUTE._NAME } : undefined,
                title: i18n.t('HOME.NO_ACCOUNT'),
                desc: i18n.t('HOME.NO_ACCOUNT_DESC'),
                buttonText: state.writableServiceAccount ? i18n.t('HOME.NO_ACCOUNT_ADD_NEW') : undefined,
            };
        }
        return result;
    }),
    items: computed<ServiceAccountModel[]>(() => serviceAccountData.value?.results || []),
    itemsTotalCount: computed<number>(() => serviceAccountData.value?.total_count || 0),
    itemsByState: computed(() => {
        const stateCounts = countBy(state.items, 'state');
        return map(stateCounts, (count, i) => ({
            state: i,
            count,
        }));
    }),
    itemsByProvider: computed(() => {
        const providerCounts = countBy(state.items, 'provider');
        return map(providerCounts, (count, i) => ({
            provider: i,
            count,
        }));
    }),
    totalChartData: computed(() => state.itemsByState.map((item) => ({
        name: item.state,
        value: item.count,
        itemStyle: {
            color: serviceAccountStateSummaryFormatter(item.state).iconColor,
        },
    }))),
    totalChart: null as EChartsType | null,
    totalChartOptions: computed<PieSeriesOption>(() => ({
        width: 56,
        height: 56,
        tooltip: { show: false },
        series: [
            {
                name: 'Service Account Total Count',
                type: 'pie',
                radius: ['40%', '100%'],
                label: undefined,
                emphasis: undefined,
                labelLine: {
                    show: false,
                },
                data: state.totalChartData,
            },
        ],
    })),
    providerChartData: computed(() => state.itemsByProvider.map((item) => ({
        name: item.provider,
        value: item.count,
        itemStyle: {
            color: storeState.provider[item.provider].color,
        },
    }))),
    providerChart: null as EChartsType | null,
    providerChartOptions: computed<PieSeriesOption>(() => ({
        width: 214,
        height: 214,
        tooltip: {
            trigger: 'item',
            position: 'right',
            formatter: (p) => {
                const _name = storeState.provider[p.name].label;
                const _value = numberFormatter(p.value) || '';
                const percent = getPercent(p.value, state.itemsTotalCount);
                return `${p.marker} ${_name}: <b>${_value}</b> (${percent}%)`;
            },
        },
        series: [
            {
                name: 'Service Account Count By Provider',
                type: 'pie',
                radius: ['40%', '80%'],
                label: undefined,
                emphasis: undefined,
                labelLine: {
                    show: false,
                },
                data: state.providerChartData,
            },
        ],
    })),
});

const getPercent = (value: number, total: number) => {
    const _value = (value / total) * 100;
    const roundedValue = Math.ceil(_value * 100) / 100;
    return parseFloat(roundedValue.toFixed(2));
};

watch([() => state.totalChartData, () => totalChartContext.value], ([, chartCtx]) => {
    if (chartCtx) {
        state.totalChart = init(totalChartContext.value);
        state.totalChart.setOption(state.totalChartOptions, true);
    }
}, { immediate: true });
watch([() => state.providerChartData, () => providerChartContext.value], ([, chartCtx]) => {
    if (chartCtx) {
        state.providerChart = init(providerChartContext.value);
        state.providerChart.setOption(state.providerChartOptions, true);
    }
}, { immediate: true });

/* service account page filters */
const queryHelper = new QueryHelper();
const serviceAccountPageFiltersQueryString = computed(() => {
    if (props.mode === 'workspace' || !props.projectIds?.length) return undefined;
    queryHelper.setFilters([{
        k: 'project_id',
        v: props.projectIds,
        o: '=',
    }]);
    return queryHelper.rawQueryStrings;
});

</script>

<template>
    <div class="account-summary">
        <p-field-title :label="$t('HOME.ACCOUNT_SUMMARY')"
                       size="lg"
                       class="main-title"
        />
        <div v-if="isLoadingServiceAccount"
             class="loading"
        >
            <p-spinner size="lg" />
        </div>
        <div v-else>
            <div v-if="!state.emptyData"
                 class="content-container"
            >
                <div class="content-wrapper">
                    <div class="total-content-wrapper">
                        <div ref="totalChartContext"
                             class="total-chart"
                        />
                        <div class="info-wrapper">
                            <p class="title">
                                {{ $t('HOME.ACCOUNT_SUMMARY_CHART_TITLE') }}
                            </p>
                            <div class="info">
                                <span class="total-count">{{ state.itemsTotalCount }}</span>
                                <div v-for="(item, idx) in state.itemsByState"
                                     :key="idx"
                                     class="state-wrapper"
                                >
                                    <p-status :key="idx"
                                              class="capitalize state"
                                              v-bind="serviceAccountStateSummaryFormatter(item.state)"
                                    />
                                    <span>{{ item.count }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="main-content">
                        <p-field-title :label="$t('HOME.ACCOUNT_SUMMARY_BY_PROVIDER')"
                                       size="md"
                                       class="title"
                        />
                        <div class="content">
                            <div ref="providerChartContext"
                                 class="chart"
                            />
                            <div class="provider-list-wrapper">
                                <div v-for="(item, idx) in state.itemsByProvider"
                                     :key="idx"
                                     class="provider-item"
                                >
                                    <div class="image-wrapper">
                                        <p-lazy-img :src="assetUrlConverter(storeState.provider[item.provider].icon)"
                                                    width="1.5rem"
                                                    height="1.5rem"
                                                    class="provider-image"
                                        />
                                    </div>
                                    <div class="percent-wrapper">
                                        <div class="info">
                                            <span>{{ storeState.provider[item.provider].label }}</span>
                                            <p>
                                                <span>
                                                    <span class="percent">{{ getPercent(item.count, state.itemsTotalCount) }}</span>%
                                                </span>
                                                <span class="count">({{ item.count }})</span>
                                            </p>
                                        </div>
                                        <p-progress-bar :percentage="getPercent(item.count, state.itemsTotalCount)"
                                                        :color="storeState.provider[item.provider].color"
                                                        size="md"
                                                        height="0.375rem"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="state.accessLink"
                     class="route-wrapper"
                >
                    <p-divider class="divider" />
                    <p-link highlight
                            :to="{ name: SERVICE_ACCOUNT_ROUTE._NAME,
                                   query: {
                                       filters: serviceAccountPageFiltersQueryString,
                                   }
                            }"
                            action-icon="internal-link"
                            class="link"
                    >
                        {{ $t('HOME.ACCOUNT_SUMMARY_SHOW_MORE') }}
                    </p-link>
                </div>
            </div>
            <empty-summary-data v-else
                                :image-url="require('/images/home/img_workspace-home_account-summary_empty-state-background.png')"
                                :empty-data="state.emptyData"
                                :type="SUMMARY_DATA_TYPE.ACCOUNT"
            />
        </div>
    </div>
</template>

<style scoped lang="postcss">
.account-summary {
    @apply flex flex-col rounded-lg bg-white;
    min-height: 30.5rem;
    .main-title {
        @apply pt-6 px-6;
    }
    .loading {
        @apply flex items-center justify-center;
        min-height: 27.5rem;
    }
    .content-container {
        @apply flex flex-col;
        flex: 1;
        .content-wrapper {
            @apply flex flex-col;
            flex: 1;
            padding-top: 1.375rem;
            padding-right: 1.5rem;
            padding-left: 1.5rem;
            .total-content-wrapper {
                @apply flex;
                margin-bottom: 2.5rem;
                gap: 1rem;
                .total-chart {
                    width: 3.5rem;
                    height: 3.5rem;
                }
                .info-wrapper {
                    @apply flex flex-col;
                    gap: 0.375rem;
                    .title {
                        @apply text-label-md;
                    }
                    .info {
                        @apply flex items-center;
                        gap: 0.75rem;
                        .total-count {
                            @apply font-medium text-display-sm;
                        }
                        .state-wrapper {
                            @apply flex items-center text-label-sm;
                            .state {
                                margin-right: 0.25rem;
                            }
                        }
                    }
                }
            }
            .main-content {
                @apply flex flex-col;
                gap: 0.75rem;
                .content {
                    @apply flex items-start;
                    gap: 1rem;
                    .chart {
                        width: 13.375rem;
                        height: 13.375rem;
                        margin-bottom: 2.625rem;
                    }
                    .provider-list-wrapper {
                        @apply flex flex-col overflow-y-auto;
                        height: 16.025rem;
                        flex: 1;
                        gap: 0.625rem;
                        padding-right: 0.5rem;
                        padding-left: 0.5rem;
                        .provider-item {
                            @apply flex items-start;
                            gap: 0.375rem;
                            padding-bottom: 0.375rem;
                            .image-wrapper {
                                @apply bg-gray-100;
                                width: 2.5rem;
                                height: 2.5rem;
                                padding: 0.5rem;
                                border-radius: 0.375rem;
                            }
                            .percent-wrapper {
                                @apply flex flex-col;
                                flex: 1;
                                gap: 0.375rem;
                                .info {
                                    @apply flex justify-between;
                                    .percent {
                                        @apply font-medium;
                                    }
                                    .count {
                                        @apply text-gray-700;
                                        margin-left: 0.25rem;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    .divider {
        @apply bg-gray-150;
    }
    .link {
        @apply flex items-center justify-center text-label-md;
        padding-top: 0.625rem;
        padding-bottom: 0.95rem;
    }
}
</style>
