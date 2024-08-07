<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import {
    PDivider, PFieldTitle, PLink, PSpinner,
} from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CollectorReferenceMap } from '@/store/reference/collector-reference-store';
import type { ServiceAccountReferenceMap } from '@/store/reference/service-account-reference-store';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import AssetSummaryDailyUpdates from '@/services/workspace-home/components/AssetSummaryDailyUpdates.vue';
import AssetSummaryProvider from '@/services/workspace-home/components/AssetSummaryProvider.vue';
import EmptySummaryData from '@/services/workspace-home/components/EmptySummaryData.vue';
import { SUMMARY_DATA_TYPE } from '@/services/workspace-home/constants/workspace-home-constant';
import { useWorkspaceHomePageStore } from '@/services/workspace-home/store/workspace-home-page-store';
import type {
    EmptyData,
    ProviderReferenceDataMap,
} from '@/services/workspace-home/types/workspace-home-type';

const METRIC_MANAGED_CREATED_COUNT = 'metric-managed-created-count';

const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;
const userWorkspaceStore = useUserWorkspaceStore();
const userWorkspaceGetters = userWorkspaceStore.getters;
const workspaceHomePageStore = useWorkspaceHomePageStore();

const storeState = reactive({
    currentWorkspaceId: computed<string|undefined>(() => userWorkspaceGetters.currentWorkspaceId),
    providerMap: computed<ProviderReferenceDataMap>(() => allReferenceGetters.provider),
    serviceAccounts: computed<ServiceAccountReferenceMap>(() => allReferenceGetters.serviceAccount),
    collectors: computed<CollectorReferenceMap>(() => allReferenceGetters.collector),
});
const state = reactive({
    loading: true,
    isNoCollectors: computed<boolean>(() => !Object.keys(storeState.collectors).length),
    isNoServiceAccounts: computed<boolean>(() => !Object.keys(storeState.serviceAccounts).length),
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

watch([() => storeState.currentWorkspaceId, () => storeState.providerMap], async ([currentWorkspaceId]) => {
    if (!currentWorkspaceId) return;
    state.loading = true;
    await workspaceHomePageStore.fetchCloudServiceResources();
    await workspaceHomePageStore.fetchDailyUpdatesList();
    state.loading = false;
}, { immediate: true });
</script>

<template>
    <div class="asset-summary">
        <p-field-title :label="$t('HOME.ASSET_SUMMARY_TITLE')"
                       size="lg"
                       class="main-title"
        />
        <div v-if="state.loading"
             class="loading-wrapper"
        >
            <p-spinner size="lg" />
        </div>
        <div v-else>
            <div v-if="!state.isNoCollectors && !state.isNoServiceAccounts">
                <div class="content-wrapper">
                    <asset-summary-provider />
                    <asset-summary-daily-updates />
                </div>
                <p-divider class="divider" />
                <p-link highlight
                        :to="{
                            name: ASSET_INVENTORY_ROUTE.METRIC_EXPLORER.DETAIL._NAME,
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
    </div>
</template>

<style scoped lang="postcss">
.asset-summary {
    .main-title {
        padding-left: 1rem;
    }
    .loading-wrapper {
        @apply flex items-center justify-center;
        min-height: 27.5rem;
    }
    .content-wrapper {
        @apply flex flex-col;
        padding-top: 1.375rem;
        padding-bottom: 2.375rem;
        gap: 1.75rem;
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
