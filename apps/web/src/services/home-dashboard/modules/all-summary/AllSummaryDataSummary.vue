<template>
    <div class="all-summary-data-summary col-span-12 lg:col-span-3">
        <div class="title col-span-3">
            {{ title }}
        </div>
        <p-data-loader :loading="loading"
                       :data="summaryData"
                       loader-type="skeleton"
        >
            <div class="summary-content-wrapper">
                <router-link :to="{
                                 name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE._NAME,
                                 query: { service: activeTab },
                             }"
                             class="summary-row link-text"
                >
                    <div class="text-group">
                        <span>{{ $t('COMMON.WIDGETS.ALL_SUMMARY.ALL') }}</span>
                    </div>
                    <span class="count">{{ count }} {{ activeTab === DATA_TYPE.STORAGE ? storageSuffix : '' }}</span>
                </router-link>
                <router-link v-for="(data, idx) of summaryData"
                             :key="idx"
                             :to="data.to"
                             class="summary-row"
                             :class="{'link-text': !!data.to.name}"
                >
                    <div class="text-group">
                        <span class="provider"
                              :style="{ color: providers[data.provider] ? providers[data.provider].color : ''}"
                        >
                            {{ providers[data.provider] ? providers[data.provider].label : providers[data.provider] }}
                        </span>
                        <span class="type">{{ data.type }}</span>
                    </div>
                    <span class="count">{{ data.count }}</span>
                </router-link>
            </div>
            <template #loader>
                <div v-for="v in skeletons"
                     :key="v"
                     class="flex items-center p-2 col-span-3"
                >
                    <p-skeleton class="flex-grow" />
                </div>
            </template>
            <template #no-data>
                <p-empty
                    :title="$t('COMMON.WIDGETS.ALL_SUMMARY.NO_SERVICE', { service: label })"
                />
            </template>
        </p-data-loader>
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from 'vue';
import type { Location } from 'vue-router';

import { PSkeleton, PDataLoader, PEmpty } from '@spaceone/design-system';
import { range } from 'lodash';

import { byteFormatter, numberFormatter } from '@cloudforet/core-lib';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { store } from '@/store';
import { i18n } from '@/translations';

import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';
import { DATA_TYPE } from '@/services/home-dashboard/modules/type';

interface SummaryData {
    type: string;
    provider: string;
    count: number | string;
    to: string | Location;
}

export default {
    name: 'AllSummaryDataSummary',
    components: {
        PEmpty,
        PSkeleton,
        PDataLoader,
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
            providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
            title: computed(() => {
                const label = props.label;
                return i18n.t('COMMON.WIDGETS.ALL_SUMMARY.TYPE_TITLE', { service: label });
            }),
            summaryData: [] as SummaryData[],
        });

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
                        count: type === DATA_TYPE.STORAGE ? byteFormatter(d.size) : numberFormatter(d.count),
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

        /* Init */
        (async () => {
            await Promise.allSettled([
                getSummaryInfo(props.activeTab),
                store.dispatch('reference/provider/load'), // LOAD REFERENCE STORE
            ]);
        })();

        /* Watcher */
        watch(() => props.activeTab, (type) => {
            getSummaryInfo(type);
        }, { immediate: false });

        return {
            ...toRefs(state),
            ASSET_INVENTORY_ROUTE,
            DATA_TYPE,
        };
    },
};
</script>

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
