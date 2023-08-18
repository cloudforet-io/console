<script lang="ts" setup>

import { byteFormatter, commaFormatter, numberFormatter } from '@cloudforet/core-lib';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import { PSkeleton, PDataLoader, PEmpty } from '@spaceone/design-system';
import dayjs from 'dayjs';
import { range } from 'lodash';
import {
    computed, reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import type { RouteLocationRaw } from 'vue-router';
import { useStore } from 'vuex';

import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';

import { arrayToQueryString, objectToQueryString, primitiveToQueryString } from '@/lib/router-query-string';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';
import { GROUP_BY } from '@/services/cost-explorer/lib/config';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import { DAY_COUNT, MONTH_COUNT } from '@/services/home-dashboard/modules/config';
import type { DataType, ExtraParams } from '@/services/home-dashboard/modules/type';
import { DATA_TYPE } from '@/services/home-dashboard/modules/type';

interface SummaryData {
    type: string;
    provider: string;
    count: number | string;
    to: RouteLocationRaw;
}

interface Props {
    extraParams: ExtraParams;
    activeTab: DataType;
    label: string;
    count: string | number;
    selectedDateType: string;
    storageSuffix: string;
}

const props = withDefaults(defineProps<Props>(), {
    extraParams: () => ({}),
    activeTab: DATA_TYPE.SERVER,
    label: '',
    count: '-',
    selectedDateType: 'DAILY',
    storageSuffix: 'TB',
});

const { t } = useI18n();
const store = useStore();

const state = reactive({
    loading: true,
    skeletons: range(3),
    providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
    title: computed(() => {
        let label = props.label;
        if (props.activeTab === DATA_TYPE.BILLING) {
            label = t('COMMON.WIDGETS.ALL_SUMMARY.RESOURCE');
        }
        return t('COMMON.WIDGETS.ALL_SUMMARY.TYPE_TITLE', { service: label });
    }),
    summaryData: [] as SummaryData[],
});

/* Util */
const getBillingServiceLocation = (serviceCode?: string, disableFilter = false) => {
    const period = {
        start: dayjs.utc().subtract(DAY_COUNT, 'day').format('YYYY-MM-DD'),
        end: dayjs.utc().subtract(1, 'day').format('YYYY-MM-DD'),
    };
    if (props.selectedDateType === 'MONTHLY') {
        period.start = dayjs.utc().subtract(MONTH_COUNT - 1, 'month').format('YYYY-MM');
        period.end = dayjs.utc().format('YYYY-MM');
    }
    const location: any = {
        name: COST_EXPLORER_ROUTE.COST_ANALYSIS._NAME,
        query: {
            granularity: primitiveToQueryString(props.selectedDateType),
            group_by: arrayToQueryString([GROUP_BY.PRODUCT]),
            period: objectToQueryString(period),
        },
    };
    if (!disableFilter) {
        location.query.filters = objectToQueryString({ product: [serviceCode] });
    }
    return location;
};
const getAllServiceLocation = (): RouteLocationRaw => {
    if (props.activeTab === DATA_TYPE.BILLING) {
        return getBillingServiceLocation(undefined, true);
    }
    return {
        name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE._NAME,
        query: {
            service: props.activeTab,
        },
    };
};
const getServiceLocation = (data): RouteLocationRaw => {
    if (props.activeTab === DATA_TYPE.BILLING) {
        return getBillingServiceLocation(data.service_code, false);
    }
    return {
        name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
        params: {
            provider: data.provider,
            group: data.cloud_service_group,
            name: data.cloud_service_type,
        },
    };
};

/* Api */
const apiQueryHelper = new ApiQueryHelper();
const getApiParameter = (type) => {
    apiQueryHelper.setSort('count', true);
    const defaultParam: any = {
        ...props.extraParams,
        labels: [type],
        query: apiQueryHelper.data,
    };

    if (type !== DATA_TYPE.STORAGE) {
        return {
            ...defaultParam,
            is_primary: true,
        };
    }

    // STORAGE
    apiQueryHelper.setSort('size', true);
    return {
        ...defaultParam,
        is_major: true,
        query: apiQueryHelper.data,
        fields: [{
            name: 'size',
            operator: 'sum',
            key: 'data.size',
        }],
    };
};
const getSummaryInfo = async (type) => {
    try {
        state.loading = true;
        const param = getApiParameter(type);
        const { results } = await SpaceConnector.client.statistics.topic.cloudServiceResources(param);
        const summaryData: SummaryData[] = [];

        results.forEach((d) => {
            const detailLocation: RouteLocationRaw = {
                name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
                params: {
                    provider: d.provider,
                    group: d.cloud_service_group,
                    name: d.cloud_service_type,
                },
            };
            summaryData.push({
                provider: d.provider,
                type: d.display_name || d.cloud_service_group,
                count: type === DATA_TYPE.STORAGE ? byteFormatter(d.size) : commaFormatter(d.count),
                to: detailLocation,
            });
        });
        state.summaryData = summaryData;
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        state.loading = false;
    }
};
const getBillingSummaryInfo = async () => {
    try {
        state.loading = true;
        const { results } = await SpaceConnector.client.statistics.topic.billingSummary({
            ...props.extraParams,
            granularity: 'MONTHLY',
            aggregation: 'inventory.CloudServiceType',
            start: dayjs.utc().startOf('month').format('YYYY-MM-DD'),
            end: dayjs.utc().endOf('month').format('YYYY-MM-DD'),
        });
        const summaryData: SummaryData[] = [];
        results.forEach((d) => {
            if (numberFormatter(d.billing_data[0].cost) !== 0) {
                summaryData.push({
                    provider: d.provider,
                    type: d.cloud_service_group || d.service_code,
                    count: numberFormatter(d.billing_data[0].cost),
                    to: getServiceLocation(d),
                });
            }
        });
        state.summaryData = summaryData;
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        state.loading = false;
    }
};

/* Init */
(async () => {
    await Promise.allSettled([
        getSummaryInfo(props.activeTab),
        store.dispatch('reference/provider/load'), // LOAD REFERENCE STORE
    ]);
})();

/* Watcher */
watch(() => props.activeTab, (type) => {
    if (type === DATA_TYPE.BILLING) {
        getBillingSummaryInfo();
    } else {
        getSummaryInfo(type);
    }
}, { immediate: false });

</script>

<template>
    <div class="all-summary-data-summary col-span-12 lg:col-span-3">
        <div class="title col-span-3">
            {{ state.title }}
        </div>
        <p-data-loader :loading="state.loading"
                       :data="state.summaryData"
                       loader-type="skeleton"
        >
            <div class="summary-content-wrapper">
                <router-link :to="getAllServiceLocation()"
                             class="summary-row"
                             :class="{'link-text': activeTab !== 'billing'}"
                >
                    <div class="text-group">
                        <span>{{ t('COMMON.WIDGETS.ALL_SUMMARY.ALL') }}</span>
                    </div>
                    <span class="count">{{ count }} {{ activeTab === DATA_TYPE.STORAGE ? storageSuffix : '' }}</span>
                </router-link>
                <router-link v-for="(data, idx) of state.summaryData"
                             :key="idx"
                             :to="data.to"
                             class="summary-row"
                             :class="{'link-text': !!data.to.name}"
                >
                    <div class="text-group">
                        <span class="provider"
                              :style="{ color: state.providers[data.provider] ? state.providers[data.provider].color : ''}"
                        >
                            {{ state.providers[data.provider] ? state.providers[data.provider].label : state.providers[data.provider] }}
                        </span>
                        <span class="type">{{ data.type }}</span>
                    </div>
                    <span class="count">{{ data.count }}</span>
                </router-link>
            </div>
            <template #loader>
                <div v-for="v in state.skeletons"
                     :key="v"
                     class="flex items-center p-2 col-span-3"
                >
                    <p-skeleton class="flex-grow" />
                </div>
            </template>
            <template #no-data>
                <p-empty
                    :title="t('COMMON.WIDGETS.ALL_SUMMARY.NO_SERVICE', { service: label })"
                />
            </template>
        </p-data-loader>
    </div>
</template>

<style lang="postcss" scoped>
.all-summary-data-summary {
    .title {
        font-weight: 700;
        font-size: 1rem;
        line-height: 1.6;
        padding: 0 0.5rem;
        margin-bottom: 0.75rem;
    }

    .summary-content-wrapper {
        display: block;
        height: 12rem;
        overflow-y: auto;
        overflow-x: hidden;

        @screen tablet {
            @apply grid grid-cols-3;
            height: 3.5rem;
        }

        @screen mobile {
            display: block;
            height: 8rem;
        }
    }
    .summary-row {
        @apply col-span-3;
        position: relative;
        display: flex;
        justify-content: space-between;
        font-size: 0.875rem;
        height: auto;
        line-height: 1.5;
        padding: 0.25rem 0.5rem;
        margin: auto 0;

        @screen tablet {
            @apply col-span-1;
            height: 1.75rem;
        }

        @screen mobile {
            @apply col-span-3;
            height: auto;
        }

        &.link-text {
            @media (hover: hover) {
                &:hover {
                    @apply bg-secondary2;
                    cursor: pointer;
                    .text-group, .provider, .type, .count {
                        text-decoration: underline;
                    }
                }
            }
        }

        .text-group {
            @apply truncate;
            padding-right: 0.125rem;

            .type {
                padding-left: 0.25rem;
            }
        }

        .count {
            @apply text-gray-600;
            flex-shrink: 0;
        }
    }

    /* custom design-system component - p-empty */
    :deep(.p-empty) {
        height: 13rem;

        @screen tablet {
            height: 5rem;
        }

        @screen mobile {
            height: 8rem;
        }
    }
}
</style>
