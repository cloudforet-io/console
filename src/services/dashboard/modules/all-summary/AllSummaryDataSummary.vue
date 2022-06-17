<template>
    <div class="all-summary-data-summary col-span-12 lg:col-span-3">
        <div class="title col-span-3">
            {{ title }}
        </div>
        <template v-if="!loading && !!summaryData.length">
            <div class="summary-content-wrapper block md:grid md:grid-cols-3 lg:block">
                <router-link :to="getAllServiceLocation()"
                             class="summary-row col-span-3 md:col-span-1 lg:col-span-3"
                             :class="{'link-text': activeTab !== 'billing'}"
                >
                    <div class="text-group">
                        <span>{{ $t('COMMON.WIDGETS.ALL_SUMMARY.ALL') }}</span>
                    </div>
                    <span class="count">{{ count }} {{ activeTab === 'storage' ? storageSuffix : '' }}</span>
                </router-link>
                <router-link v-for="(data, idx) of summaryData" :key="idx"
                             :to="data.to"
                             class="summary-row col-span-3 md:col-span-1 lg:col-span-3"
                             :class="{'link-text': !!data.to.name}"
                >
                    <div class="text-group">
                        <span class="provider" :style="{ color: providers[data.provider] ? providers[data.provider].color : ''}">
                            {{ providers[data.provider] ? providers[data.provider].label : providers[data.provider] }}
                        </span>
                        <span class="type">{{ data.type }}</span>
                    </div>
                    <span class="count">{{ data.count }}</span>
                </router-link>
            </div>
        </template>
        <template v-else-if="!loading">
            <div class="summary-content-wrapper no-data-wrapper grid">
                <div class="m-auto">
                    <img src="@/assets/images/illust_cloud.svg" class="empty-image hidden lg:block">
                    <p class="text">
                        {{ $t('COMMON.WIDGETS.ALL_SUMMARY.NO_SERVICE', { service: label }) }}
                    </p>
                </div>
            </div>
        </template>
        <template v-else>
            <div v-for="v in skeletons" :key="v" class="flex items-center p-2 col-span-3">
                <p-skeleton class="flex-grow" />
            </div>
        </template>
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import { byteFormatter, commaFormatter, numberFormatter } from '@spaceone/console-core-lib';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import { PSkeleton } from '@spaceone/design-system';
import dayjs from 'dayjs';
import { range } from 'lodash';
import { Location } from 'vue-router';

import { store } from '@/store';
import { i18n } from '@/translations';

import { arrayToQueryString, objectToQueryString, primitiveToQueryString } from '@/lib/router-query-string';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';
import { GROUP_BY } from '@/services/cost-explorer/lib/config';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import { DAY_COUNT, MONTH_COUNT } from '@/services/dashboard/modules/all-summary/AllSummary.vue';
import { DATA_TYPE } from '@/services/dashboard/modules/type';


interface SummaryData {
    type: string;
    provider: string;
    count: number | string;
    to: string | Location;
}

export default {
    name: 'AllSummaryDataSummary',
    components: {
        PSkeleton,
    },
    props: {
        extraParams: {
            type: Object,
            default: () => ({}),
        },
        activeTab: {
            type: String,
            default: DATA_TYPE.SERVER,
        },
        label: {
            type: String,
            default: '',
        },
        count: {
            type: [String, Number],
            default: '-',
        },
        selectedDateType: {
            type: String,
            default: 'DAILY',
        },
        storageSuffix: {
            type: String,
            default: 'TB',
        },
    },
    setup(props) {
        const state = reactive({
            loading: true,
            skeletons: range(3),
            providers: computed(() => store.state.reference.provider.items),
            title: computed(() => {
                let label = props.label;
                if (props.activeTab === DATA_TYPE.BILLING) {
                    label = i18n.t('COMMON.WIDGETS.ALL_SUMMARY.RESOURCE');
                }
                return i18n.t('COMMON.WIDGETS.ALL_SUMMARY.TYPE_TITLE', { service: label });
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
                    groupBy: arrayToQueryString([GROUP_BY.PRODUCT]),
                    period: objectToQueryString(period),
                },
            };
            if (!disableFilter) {
                location.query.filters = objectToQueryString({ product: [serviceCode] });
            }
            return location;
        };
        const getAllServiceLocation = (): Location => {
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
        const getServiceLocation = (data): Location => {
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
                    const detailLocation: Location = {
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

        return {
            ...toRefs(state),
            getAllServiceLocation,
        };
    },
};
</script>

<style lang="postcss" scoped>
.all-summary-data-summary {
    .title {
        padding: 0 0.5rem;
        margin-bottom: 1.25rem;
    }

    .summary-content-wrapper {
        height: 12rem;
        overflow-y: auto;
        overflow-x: hidden;

        @screen tablet {
            height: 5rem;
        }

        &.no-data-wrapper {
            .empty-image {
                margin: 0 auto 0.5rem auto;
            }

            .text {
                @apply text-primary2;
                font-size: 0.875rem;
                font-weight: bold;
                line-height: 1.5;
                text-align: center;
                opacity: 0.7;
                margin-bottom: 0.625rem;
            }

            .p-button {
                min-width: auto;
                height: 1.25rem;
                font-size: 0.75rem;
                line-height: 1.2;
                padding: 0.5rem;
            }
        }
    }

    .summary-row {
        position: relative;
        display: block;
        font-size: 0.875rem;
        line-height: 1.2;
        cursor: default;
        padding: 0.25rem 0.5rem;
        margin: auto 0;

        &.link-text:hover {
            @apply bg-secondary2;
            cursor: pointer;
            .text-group, .provider, .type, .count {
                text-decoration: underline;
            }
        }

        .text-group {
            display: inline-block;
            width: 80%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            vertical-align: text-top;

            .type {
                padding-left: 0.5rem;
            }
        }

        .count {
            @apply text-gray-600;
            position: absolute;
            right: 0.5rem;
        }
    }
}
</style>
