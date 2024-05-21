<script setup lang="ts">
import { useElementSize } from '@vueuse/core';
import {
    computed, reactive, ref, watch,
} from 'vue';

import {
    PFieldTitle, PIconButton, PDivider, PLink, PEmpty,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { store } from '@/store';
import { i18n } from '@/translations';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CollectorReferenceMap } from '@/store/reference/collector-reference-store';
import type { ServiceAccountReferenceMap } from '@/store/reference/service-account-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import AssetSummaryDailyUpdateItem from '@/services/workspace-home/components/AssetSummaryDailyUpdateItem.vue';
import AssetSummaryItem from '@/services/workspace-home/components/AssetSummaryItem.vue';
import EmptySummaryData from '@/services/workspace-home/components/EmptySummaryData.vue';
import { SUMMARY_DATA_TYPE, WORKSPACE_HOME_DATA_TYPE } from '@/services/workspace-home/constants/workspace-home-constant';
import type {
    CloudServiceData,
    ProviderResourceDataItem,
    ProviderReferenceDataMap,
    EmptyData,
} from '@/services/workspace-home/types/workspace-home-type';

const PROVIDER_DEFAULT_WIDTH = 184 + 8;
const DAILY_UPDATE__DEFAULT_WIDTH = 136 + 8;
const DEFAULT_PADDING = 24;
const METRIC_MANAGED_CREATED_COUNT = 'metric-managed-created-count';

const ARROW_BUTTON_TYPE = {
    PROVIDER: 'provider',
    DAILY_UPDATES: 'dailyUpdate',
} as const;
type ArrowButtonType = typeof ARROW_BUTTON_TYPE[keyof typeof ARROW_BUTTON_TYPE];

const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;
const userWorkspaceStore = useUserWorkspaceStore();
const userWorkspaceGetters = userWorkspaceStore.getters;

const rowItemsWrapperRef = ref<null | HTMLElement>(null);
const providerEl = ref<null | HTMLElement>(null);
const dailyUpdateEl = ref<null | HTMLElement>(null);

const { width: rowItemsWrapperWidth } = useElementSize(rowItemsWrapperRef);

const apiQueryHelper = new ApiQueryHelper();

const storeState = reactive({
    providerMap: computed<ProviderReferenceDataMap>(() => allReferenceGetters.provider),
    serviceAccounts: computed<ServiceAccountReferenceMap>(() => allReferenceGetters.serviceAccount),
    collectors: computed<CollectorReferenceMap>(() => allReferenceGetters.collector),
    currentWorkspaceId: computed<string|undefined>(() => userWorkspaceGetters.currentWorkspaceId),
});
const state = reactive({
    isNoCollectors: computed<boolean>(() => !Object.keys(storeState.collectors).length),
    isNoServiceAccounts: computed<boolean>(() => !Object.keys(storeState.serviceAccounts).length),
    providers: [] as ProviderResourceDataItem[],
    dailyUpdatesList: [] as CloudServiceData[],
    pageStart: {
        provider: 0,
        dailyUpdate: 0,
    },
    pageMax: computed(() => {
        const providerCount: number = state.providers.length / Math.floor(rowItemsWrapperWidth.value / (PROVIDER_DEFAULT_WIDTH + DEFAULT_PADDING) - 1);
        const dailyUpdateCount: number = state.dailyUpdatesList.length / Math.floor(rowItemsWrapperWidth.value / (DAILY_UPDATE__DEFAULT_WIDTH + DEFAULT_PADDING) - 1);
        return { provider: providerCount, dailyUpdate: dailyUpdateCount };
    }),
    emptyData: computed<EmptyData>(() => {
        let result = {} as EmptyData;
        if (state.isNoServiceAccounts) {
            result = {
                to: { name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT._NAME },
                title: i18n.t('HOME.NO_ACCOUNT'),
                desc: i18n.t('HOME.NO_ACCOUNT_DESC'),
                buttonText: i18n.t('HOME.NO_ACCOUNT_ADD_NEW'),
            };
        } else {
            result = {
                to: { name: ASSET_INVENTORY_ROUTE.COLLECTOR.CREATE._NAME },
                title: i18n.t('HOME.NO_COLLECTOR'),
                desc: i18n.t('HOME.NO_COLLECTOR_DESC'),
                buttonText: i18n.t('HOME.NO_COLLECTOR_CREATE_NEW'),
            };
        }
        return result;
    }),
});

const handleClickArrowButton = (type: ArrowButtonType, increment: number) => {
    const element = type === ARROW_BUTTON_TYPE.PROVIDER ? {
        el: providerEl.value,
        defaultWidth: PROVIDER_DEFAULT_WIDTH,
    } : {
        el: dailyUpdateEl.value,
        defaultWidth: DAILY_UPDATE__DEFAULT_WIDTH,
    };
    if (!element.el) return;

    state.pageStart[type] += increment;

    const marginLeft = increment * state.pageStart[type] * element.defaultWidth;
    element.el.style.marginLeft = increment === 1 ? `-${marginLeft}px` : `${marginLeft}px`;
};
const getApiParameter = (type) => {
    apiQueryHelper.setSort('count', true);
    const defaultParam: any = {
        labels: [type],
        query: apiQueryHelper.data,
    };

    if (type !== WORKSPACE_HOME_DATA_TYPE.STORAGE) {
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

const fetchDailyUpdatesList = async (): Promise<void> => {
    try {
        const { results } = await SpaceConnector.client.statistics.topic.dailyUpdateCloudService({
            timezone: store.state.user.timezone,
            workspace_id: storeState.currentWorkspaceId,
        });
        state.dailyUpdatesList = results;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.dailyUpdatesList = [];
    }
};
const fetchCloudServiceResources = async () => {
    const labels = ['Server', 'Database', 'Storage'];
    try {
        await Promise.all(labels.map(async (label) => {
            const param = getApiParameter(label);
            const { results } = await SpaceConnector.client.statistics.topic.cloudServiceResources({
                ...param,
                workspace_id: storeState.currentWorkspaceId,
            });
            if (label !== 'Storage') {
                (results || []).forEach((i) => {
                    storeState.providerMap[i.provider][label.toLowerCase()] = i.count;
                });
            } else {
                (results || []).forEach((i) => {
                    storeState.providerMap[i.provider][label.toLowerCase()] += i.size;
                });
            }
        }));
        state.providers = Object.keys(storeState.providerMap).map((key) => storeState.providerMap[key]);
    } catch (e) {
        ErrorHandler.handleError(e);
        state.providers = [];
    }
};

watch([() => storeState.currentWorkspaceId, () => storeState.providerMap], async ([currentWorkspaceId]) => {
    if (!currentWorkspaceId) return;
    await fetchDailyUpdatesList();
    await fetchCloudServiceResources();
}, { immediate: true });
</script>

<template>
    <div class="asset-summary">
        <p-field-title :label="$t('HOME.ASSET_SUMMARY_TITLE')"
                       size="lg"
                       class="main-title"
        />
        <div v-if="!state.isNoCollectors && !state.isNoServiceAccounts">
            <div class="content-wrapper">
                <div ref="rowItemsWrapperRef"
                     class="row-items-wrapper"
                >
                    <div ref="providerEl"
                         class="row-items-container"
                    >
                        <asset-summary-item v-for="(item, idx) in state.providers"
                                            :key="`asset-summary-item-${idx}`"
                                            :item="item"
                        />
                    </div>
                    <p-icon-button v-if="state.pageStart.provider !== 0"
                                   class="arrow-button left"
                                   name="ic_chevron-left"
                                   color="inherit transparent"
                                   width="1.5rem"
                                   height="1.5rem"
                                   @click="handleClickArrowButton(ARROW_BUTTON_TYPE.PROVIDER, -1)"
                    />
                    <p-icon-button v-if="state.pageStart.provider !== Number(state.pageMax.provider)"
                                   class="arrow-button right"
                                   name="ic_chevron-right"
                                   color="inherit transparent"
                                   width="1.5rem"
                                   height="1.5rem"
                                   @click="handleClickArrowButton(ARROW_BUTTON_TYPE.PROVIDER, 1)"
                    />
                </div>
                <div class="daily-update-wrapper">
                    <p-field-title :label="$t('HOME.ASSET_SUMMARY_DAILY_UPDATE_TITLE')"
                                   class="daily-update-title"
                    >
                        <template #right>
                            <span class="desc">{{ $t('HOME.ASSET_SUMMARY_DAILY_UPDATE_DESC') }}</span>
                        </template>
                    </p-field-title>
                    <div v-if="state.dailyUpdatesList.length > 0"
                         ref="rowItemsWrapperRef"
                         class="row-items-wrapper"
                    >
                        <div ref="dailyUpdateEl"
                             class="row-items-container"
                        >
                            <asset-summary-daily-update-item v-for="(item, idx) in state.dailyUpdatesList"
                                                             :key="`asset-summary-daily-update-item-${idx}`"
                                                             :item="item"
                            />
                        </div>
                        <p-icon-button v-if="state.pageStart.dailyUpdate !== 0"
                                       class="arrow-button left"
                                       name="ic_chevron-left"
                                       color="inherit transparent"
                                       width="1.5rem"
                                       height="1.5rem"
                                       @click="handleClickArrowButton(ARROW_BUTTON_TYPE.DAILY_UPDATES, -1)"
                        />
                        <p-icon-button v-if="state.pageStart.dailyUpdate !== Number(state.pageMax.dailyUpdate)"
                                       class="arrow-button right"
                                       name="ic_chevron-right"
                                       color="inherit transparent"
                                       width="1.5rem"
                                       height="1.5rem"
                                       @click="handleClickArrowButton(ARROW_BUTTON_TYPE.DAILY_UPDATES, 1)"
                        />
                    </div>
                    <p-empty v-else
                             show-image
                             image-size="sm"
                             :title="$t('COMMON.WIDGETS.DAILY_UPDATE_NO_DATA')"
                             class="empty"
                    >
                        <template #image>
                            <img alt="empty-image"
                                 src="@/assets/images/illust_circle_boy.svg"
                            >
                        </template>
                    </p-empty>
                </div>
            </div>
            <p-divider class="divider" />
            <p-link highlight
                    :to="{
                        name: ASSET_INVENTORY_ROUTE.ASSET_ANALYSIS.DETAIL._NAME,
                        params: { metricId: METRIC_MANAGED_CREATED_COUNT},
                    }"
                    action-icon="internal-link"
                    class="link"
            >
                <span>{{ $t('HOME.ASSET_SUMMARY_SHOW_MORE_DAILY_UPDATE') }}</span>
            </p-link>
        </div>
        <empty-summary-data v-else
                            :image-url="require('/images/home/img_workspace-home_asset-summary_empty-state-background-min.png')"
                            :empty-data="state.emptyData"
                            :type="SUMMARY_DATA_TYPE.ASSET"
        />
    </div>
</template>

<style scoped lang="postcss">
.asset-summary {
    .main-title {
        padding-left: 1rem;
    }
    .content-wrapper {
        @apply flex flex-col;
        padding-top: 1.375rem;
        padding-bottom: 2.375rem;
        gap: 1.75rem;
        .row-items-wrapper {
            @apply relative overflow-hidden;
            .row-items-container {
                @apply flex overflow-hidden;
                gap: 0.5rem;
                padding-left: 1.5rem;
                transition: margin-left 0.3s ease;
            }
            &::after {
                @apply absolute;
                content: '';
                top: 0;
                right: 0;
                width: 2rem;
                height: 100%;
                background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, theme('colors.white') 50%);
            }
            .arrow-button {
                @apply absolute bg-white border border-gray-300 rounded-full;
                top: calc(50% - 1rem);
                width: 2rem;
                height: 2rem;
                box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
                z-index: 10;
                &.left {
                    margin-right: auto;
                    left: 0.5rem;
                }
                &.right {
                    margin-left: auto;
                    right: 0.75rem;
                }
                &:hover {
                    @apply text-gray-900;
                }
            }

            /* custom design-system component - p-empty */
            :deep(.p-empty) {
                .image-wrapper {
                    margin-bottom: 0.5rem;
                }
            }
        }
        .daily-update-wrapper {
            @apply flex flex-col;
            gap: 0.75rem;
            .daily-update-title {
                padding-left: 1.5rem;
                .desc {
                    @apply text-label-sm text-gray-600;
                }
            }

            /* custom design-system component - p-field-title */
            :deep(.p-field-title) {
                .title-wrapper {
                    @apply items-center;
                    gap: 0.5rem;
                }
            }
        }
        .empty {
            width: calc(100% - 3rem);
            height: 10rem;
            margin-left: 1.5rem;
        }
    }
    .divider {
        @apply bg-gray-150;
    }
    .link {
        @apply flex items-center justify-center text-label-md;
        padding-top: 0.625rem;
        padding-bottom: 0.75rem;
    }
}
</style>
