<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import { isEmpty } from 'lodash';

import {
    PDivider, PFieldTitle, PLink, PSpinner,
} from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CollectorReferenceMap } from '@/store/reference/collector-reference-store';
import type { ServiceAccountReferenceMap } from '@/store/reference/service-account-reference-store';
import { useUserStore } from '@/store/user/user-store';

import type { PageAccessMap } from '@/lib/access-control/config';
import { MENU_ID } from '@/lib/menu/config';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { SERVICE_ACCOUNT_ROUTE } from '@/services/service-account/routes/route-constant';
import { SUMMARY_DATA_TYPE } from '@/services/workspace-home/constants/workspace-home-constant';
import AssetSummaryDailyUpdates from '@/services/workspace-home/shared/components/AssetSummaryDailyUpdates.vue';
import AssetSummaryProvider from '@/services/workspace-home/shared/components/AssetSummaryProvider.vue';
import EmptySummaryData from '@/services/workspace-home/shared/components/EmptySummaryData.vue';
import type { WidgetStyleType } from '@/services/workspace-home/shared/types/widget-style-type';
import { useWorkspaceHomePageStore } from '@/services/workspace-home/store/workspace-home-page-store';
import type {
    EmptyData,
} from '@/services/workspace-home/types/workspace-home-type';

const METRIC_MANAGED_CREATED_COUNT = 'metric-managed-created-count';


const props = withDefaults(defineProps<{
    projectGroupId?: string;
    projectId?: string;
    styleType?: WidgetStyleType;
}>(), {
    projectGroupId: undefined,
    projectId: undefined,
    styleType: 'default',
});

const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;
const userWorkspaceStore = useUserWorkspaceStore();
const userWorkspaceGetters = userWorkspaceStore.getters;
const workspaceHomePageStore = useWorkspaceHomePageStore();
const userStore = useUserStore();

const storeState = reactive({
    currentWorkspaceId: computed<string|undefined>(() => userWorkspaceGetters.currentWorkspaceId),
    serviceAccounts: computed<ServiceAccountReferenceMap>(() => allReferenceGetters.serviceAccount),
    collectors: computed<CollectorReferenceMap>(() => allReferenceGetters.collector),
    pageAccessPermissionMap: computed<PageAccessMap>(() => userStore.getters.pageAccessPermissionMap),
});
const state = reactive({
    loading: true,
    isNoCollectors: computed<boolean>(() => !Object.keys(storeState.collectors).length),
    isNoServiceAccounts: computed<boolean>(() => !Object.keys(storeState.serviceAccounts).length),
    writableServiceAccount: computed<boolean|undefined>(() => storeState.pageAccessPermissionMap[MENU_ID.SERVICE_ACCOUNT].write),
    writableServiceCollector: computed<boolean|undefined>(() => storeState.pageAccessPermissionMap[MENU_ID.COLLECTOR].write),
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

watch([() => storeState.currentWorkspaceId], async ([currentWorkspaceId]) => {
    if (!currentWorkspaceId) return;
    state.loading = true;
    await workspaceHomePageStore.fetchDailyUpdatesList();
    state.loading = false;
}, { immediate: true });
</script>

<template>
    <div class="asset-summary">
        <p-field-title :label="$t('HOME.ASSET_SUMMARY_TITLE')"
                       size="lg"
                       :font-weight="props.styleType === 'compact' ? 'regular' : 'bold'"
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
                    <asset-summary-daily-updates :style-type="props.styleType" />
                </div>
                <p-divider v-if="state.accessLink"
                           class="divider"
                />
                <p-link v-if="state.accessLink"
                        highlight
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
