<script setup lang="ts">
import { computed, reactive, toRef } from 'vue';

import { isEmpty } from 'lodash';

import {
    PDivider, PFieldTitle, PLink, PSpinner,
} from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { useAuthorizationStore } from '@/store/authorization/authorization-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CollectorReferenceMap } from '@/store/reference/collector-reference-store';
import type { ServiceAccountReferenceMap } from '@/store/reference/service-account-reference-store';

import type { PageAccessMap } from '@/lib/access-control/config';
import { MENU_ID } from '@/lib/menu/config';
import { objectToQueryString } from '@/lib/router-query-string';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import type { MetricFilter } from '@/services/asset-inventory/types/asset-analysis-type';
import { SERVICE_ACCOUNT_ROUTE } from '@/services/service-account/routes/route-constant';
import AssetSummaryDailyUpdates from '@/services/workspace-home/shared/components/AssetSummaryDailyUpdates.vue';
import AssetSummaryProvider from '@/services/workspace-home/shared/components/AssetSummaryProvider.vue';
import EmptySummaryData from '@/services/workspace-home/shared/components/EmptySummaryData.vue';
import { useAssetDailyUpdates } from '@/services/workspace-home/shared/composables/use-asset-daily-updates';
import { useAssetSummaryProviders } from '@/services/workspace-home/shared/composables/use-asset-summary-providers';
import { SUMMARY_DATA_TYPE } from '@/services/workspace-home/shared/constants/summary-type-constant';
import type { EmptyData } from '@/services/workspace-home/shared/types/empty-data-type';
import type { WidgetMode } from '@/services/workspace-home/shared/types/widget-mode-type';

const METRIC_MANAGED_CREATED_COUNT = 'metric-managed-created-count';

const props = withDefaults(defineProps<{
    projectIds?: string[];
    mode?: WidgetMode;
}>(), {
    projectIds: undefined,
    mode: 'workspace',
});

const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;
const authorizationStore = useAuthorizationStore();

const storeState = reactive({
    serviceAccounts: computed<ServiceAccountReferenceMap>(() => allReferenceGetters.serviceAccount),
    collectors: computed<CollectorReferenceMap>(() => allReferenceGetters.collector),
    pageAccessPermissionMap: computed<PageAccessMap>(() => authorizationStore.getters.pageAccessPermissionMap),
});
const state = reactive({
    isNoCollectors: computed<boolean>(() => !Object.keys(storeState.collectors).length),
    isNoServiceAccounts: computed<boolean>(() => !Object.keys(storeState.serviceAccounts).length),
    writableServiceAccount: computed<boolean|undefined>(() => storeState.pageAccessPermissionMap[MENU_ID.SERVICE_ACCOUNT]?.write),
    writableServiceCollector: computed<boolean|undefined>(() => storeState.pageAccessPermissionMap[MENU_ID.COLLECTOR]?.write),
    emptyData: computed<EmptyData>(() => {
        let result;
        if (state.isNoServiceAccounts) {
            result = {
                to: state.writableServiceAccount ? { name: SERVICE_ACCOUNT_ROUTE._NAME } : {},
                title: i18n.t('HOME.NO_ACCOUNT'),
                desc: i18n.t('HOME.NO_ACCOUNT_DESC'),
                buttonText: state.writableServiceAccount ? i18n.t('HOME.NO_ACCOUNT_ADD_NEW') : undefined,
            };
        } else {
            result = {
                to: state.writableServiceCollector ? { name: ASSET_INVENTORY_ROUTE.COLLECTOR.CREATE._NAME } : {},
                title: i18n.t('HOME.NO_COLLECTOR'),
                desc: i18n.t('HOME.NO_COLLECTOR_DESC'),
                buttonText: state.writableServiceCollector ? i18n.t('HOME.NO_COLLECTOR_CREATE_NEW') : undefined,
            };
        }
        return result;
    }),
    accessLink: computed<boolean>(() => !isEmpty(storeState.pageAccessPermissionMap[MENU_ID.METRIC_EXPLORER])),
});

const projectIds = computed(() => props.projectIds ?? []);
const enabled = computed(() => {
    if (props.mode === 'workspace') {
        return !state.isNoCollectors && !state.isNoServiceAccounts;
    }
    return !state.isNoCollectors && !state.isNoServiceAccounts && projectIds.value.length > 0;
});
const { isLoadingDailyUpdates, dailyUpdates } = useAssetDailyUpdates({ projectIds, enabled, mode: toRef(props, 'mode') });
const { isLoadingProviders, providers } = useAssetSummaryProviders({ projectIds, enabled, mode: toRef(props, 'mode') });

/* metric exploerer page filters */
const metricFilters = computed<MetricFilter|undefined>(() => {
    if (props.mode === 'workspace' || projectIds.value.length === 0) { return undefined; }
    return {
        project_id: projectIds.value,
    };
});
const metricFiltersQueryString = computed(() => objectToQueryString(metricFilters.value));

</script>

<template>
    <div class="asset-summary">
        <p-field-title :label="$t('HOME.ASSET_SUMMARY_TITLE')"
                       size="lg"
                       class="main-title"
        />
        <div v-if="isLoadingProviders || isLoadingDailyUpdates"
             class="loading-wrapper"
        >
            <p-spinner size="lg" />
        </div>
        <div v-else-if="!state.isNoCollectors && !state.isNoServiceAccounts">
            <div class="content-wrapper">
                <asset-summary-provider :providers="providers" />
                <asset-summary-daily-updates :daily-updates="dailyUpdates" />
            </div>
            <p-divider v-if="state.accessLink"
                       class="divider"
            />
            <p-link v-if="state.accessLink"
                    highlight
                    :to="{
                        name: ASSET_INVENTORY_ROUTE.METRIC_EXPLORER.DETAIL._NAME,
                        params: {
                            metricId: METRIC_MANAGED_CREATED_COUNT,
                        },
                        query: {
                            filters: metricFiltersQueryString
                        }
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
    @apply rounded-lg bg-white;
    .main-title {
        @apply pt-6 px-6;
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
