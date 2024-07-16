<script setup lang="ts">
import { computed, reactive } from 'vue';

import { isEmpty } from 'lodash';

import {
    PStatus, PFieldTitle, PLazyImg, PDivider, PLink,
} from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ServiceAccountReferenceMap } from '@/store/reference/service-account-reference-store';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

import { stateFormatter } from '@/services/asset-inventory/helpers/dynamic-ui-schema-generator';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import EmptySummaryData from '@/services/workspace-home/components/EmptySummaryData.vue';
import { SUMMARY_DATA_TYPE } from '@/services/workspace-home/constants/workspace-home-constant';
import type { EmptyData } from '@/services/workspace-home/types/workspace-home-type';

const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;

const storeState = reactive({
    serviceAccount: computed<ServiceAccountReferenceMap>(() => allReferenceGetters.serviceAccount),
});
const state = reactive({
    emptyData: computed<EmptyData>(() => {
        let result = {} as EmptyData;
        if (isEmpty(storeState.serviceAccount)) {
            result = {
                to: { name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT._NAME },
                title: i18n.t('HOME.NO_ACCOUNT'),
                desc: i18n.t('HOME.NO_ACCOUNT_DESC'),
                buttonText: i18n.t('HOME.NO_ACCOUNT_ADD_NEW'),
            };
        }
        return result;
    }),
});
</script>

<template>
    <div class="account-summary">
        <p-field-title :label="$t('HOME.ACCOUNT_SUMMARY')"
                       size="lg"
                       class="main-title"
        />
        <div v-if="!isEmpty(storeState.serviceAccount)"
             class="content-container"
        >
            <div class="content-wrapper">
                <div class="total-content-wrapper">
                    <div class="total-chart" />
                    <div class="info-wrapper">
                        <p class="title">
                            {{ $t('HOME.ACCOUNT_SUMMARY_CHART_TITLE') }}
                        </p>
                        <div class="info">
                            <span class="total-count">812</span>
                            <p-status v-bind="stateFormatter('ACTIVE')"
                                      class="capitalize"
                            />
                        </div>
                    </div>
                </div>
                <div class="main-content">
                    <strong class="title">{{ $t('HOME.ACCOUNT_SUMMARY_BY_PROVIDER') }}</strong>
                    <div class="content">
                        <div class="chart" />
                        <div class="provider-list-wrapper">
                            <div class="provider-item">
                                <div class="image-wrapper">
                                    <p-lazy-img :src="assetUrlConverter('')"
                                                width="1.5rem"
                                                height="1.5rem"
                                                class="provider-image"
                                    />
                                </div>
                                <div class="percent-wrapper">
                                    <div class="info">
                                        <span>aws</span>
                                        <p>
                                            <span>
                                                <span class="percent">50</span>%
                                            </span>
                                            <span class="count">(406)</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div class="provider-item">
                                <div class="image-wrapper">
                                    <p-lazy-img :src="assetUrlConverter('')"
                                                width="1.5rem"
                                                height="1.5rem"
                                                class="provider-image"
                                    />
                                </div>
                                <div class="percent-wrapper">
                                    <div class="info">
                                        <span>aws</span>
                                        <p>
                                            <span>
                                                <span class="percent">50</span>%
                                            </span>
                                            <span class="count">(406)</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="route-wrapper">
                <p-divider class="divider" />
                <p-link highlight
                        :to="{ name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT._NAME }"
                        action-icon="internal-link"
                        class="link"
                >
                    {{ $t('HOME.COST_SUMMARY_GO_TO_REPORT') }}
                </p-link>
            </div>
        </div>
        <empty-summary-data v-else
                            :image-url="require('/images/home/img_workspace-home_account-summary_empty-state-background.png')"
                            :empty-data="state.emptyData"
                            :type="SUMMARY_DATA_TYPE.ACCOUNT"
        />
    </div>
</template>

<style scoped lang="postcss">
.account-summary {
    @apply flex flex-col;
    min-height: 30.5rem;
    .main-title {
        padding-left: 1rem;
    }
    .content-container {
        @apply flex flex-col;
        flex: 1;
        .content-wrapper {
            @apply flex flex-col;
            flex: 1;
            padding: 1.375rem 1.5rem 2rem;
            .total-content-wrapper {
                @apply flex;
                margin-bottom: 2.5rem;
                gap: 1rem;
                .total-chart {
                    @apply bg-gray;
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
                        @apply bg-gray;
                        width: 13.375rem;
                        height: 13.375rem;
                    }
                    .provider-list-wrapper {
                        @apply flex flex-col;
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
