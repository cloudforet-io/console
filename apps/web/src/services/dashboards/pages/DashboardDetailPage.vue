<script setup lang="ts">
import {
    computed,
    onUnmounted, watch,
} from 'vue';

import {
    PI,
} from '@cloudforet/mirinae';

import { useBreadcrumbs } from '@/common/composables/breadcrumbs';
import type { FavoriteOptions } from '@/common/modules/favorites/favorite-button/type';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import { useGnbStore } from '@/common/modules/navigations/stores/gnb-store';

import { DASHBOARD_SHARED_ENTRY_POINT } from '@/services/_shared/dashboard/core/constants/dashboard-shared-constant';
import DashboardDetailLayout from '@/services/_shared/dashboard/dashboard-detail/DashboardDetailLayout.vue';
import { useDashboardFolderQuery } from '@/services/dashboards/composables/use-dashboard-folder-query';
import { useDashboardQuery } from '@/services/dashboards/composables/use-dashboard-query';
import { useDashboardPageControlStore } from '@/services/dashboards/stores/dashboard-page-control-store';

interface Props {
    dashboardId: string;
}
const props = defineProps<Props>();

const gnbStore = useGnbStore();
const { breadcrumbs } = useBreadcrumbs();
const dashboardPageControlStore = useDashboardPageControlStore();
/* Query */
const {
    publicDashboardList,
    privateDashboardList,
} = useDashboardQuery();
const {
    publicFolderList,
    privateFolderList,
} = useDashboardFolderQuery();

const dashboardItems = computed(() => [...publicDashboardList.value, ...privateDashboardList.value]);
const folderItems = computed(() => [...publicFolderList.value, ...privateFolderList.value]);
const isDeprecatedDashboard = computed<boolean>(() => dashboardItems.value.find((d) => d.dashboard_id === props.dashboardId)?.version === '1.0');
const favoriteOptions = computed<FavoriteOptions>(() => ({
    type: FAVORITE_TYPE.DASHBOARD,
    id: props.dashboardId,
}));

watch(() => props.dashboardId, async (dashboardId) => {
    // Set Dashboard Detail Custom breadcrumbs
    if (dashboardId) { // this includes all three cases
        gnbStore.setBreadcrumbs(breadcrumbs.value);
    }
}, { immediate: true });

watch(favoriteOptions, (_favoriteOptions) => {
    gnbStore.setFavoriteItemId(_favoriteOptions);
}, { immediate: true });

onUnmounted(() => {
    gnbStore.setBreadcrumbs([]);
});

const handleSelectToolset = (toolsetId: string|undefined) => {
    if (toolsetId === 'edit') dashboardPageControlStore.openEditNameModal(props.dashboardId);
    if (toolsetId === 'clone') dashboardPageControlStore.openCloneModal(props.dashboardId);
    if (toolsetId === 'move') dashboardPageControlStore.openMoveModal(props.dashboardId);
    if (toolsetId === 'share') dashboardPageControlStore.openShareModal(props.dashboardId);
    if (toolsetId === 'shareWithCode') dashboardPageControlStore.openShareWithCodeModal(props.dashboardId);
    if (toolsetId === 'delete') dashboardPageControlStore.openDeleteModal(props.dashboardId);
};
</script>

<template>
    <div class="dashboard-detail-page">
        <div v-if="isDeprecatedDashboard"
             class="deprecated-banner"
        >
            <p-i name="ic_limit-filled"
                 width="1.25rem"
                 height="1.25rem"
                 color="inherit"
            />
            <div class="banner-content-wrapper">
                <p class="title">
                    {{ $t('DASHBOARDS.ALL_DASHBOARDS.DEPRECATED') }}
                </p>
                <p class="description">
                    {{ $t('DASHBOARDS.ALL_DASHBOARDS.DEPRECATED_DESCRIPTION') }}
                </p>
            </div>
        </div>
        <dashboard-detail-layout :dashboard-id="props.dashboardId"
                                 :dashboard-items="dashboardItems"
                                 :folder-items="folderItems"
                                 :entry-point="DASHBOARD_SHARED_ENTRY_POINT.DASHBOARDS"
                                 @select-toolset="handleSelectToolset"
        />
    </div>
</template>

<style lang="postcss" scoped>
.dashboard-detail-page {
    @apply relative;

    .deprecated-banner {
        @apply bg-red-100 text-red-500;
        top: 0;
        width: 105%;
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        padding: 1.125rem 1.5rem;
        margin: -1.5rem 0 1.5rem -1.5rem;
        .banner-content-wrapper {
            .title {
                @apply text-label-lg text-red-500 font-bold;
                padding-bottom: 0.25rem;
            }
            .description {
                @apply text-paragraph-md text-gray-900;
            }
        }
    }
}
</style>
