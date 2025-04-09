<script setup lang="ts">
import {
    computed,
    onUnmounted, reactive, watch,
} from 'vue';

import {
    PDivider, PI,
} from '@cloudforet/mirinae';

import { useBreadcrumbs } from '@/common/composables/breadcrumbs';
import type { FavoriteOptions } from '@/common/modules/favorites/favorite-button/type';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import { useGnbStore } from '@/common/modules/navigations/stores/gnb-store';

import DashboardDetailBody from '@/services/dashboards/components/dashboard-detail/DashboardDetailBody.vue';
import DashboardDetailHeader from '@/services/dashboards/components/dashboard-detail/DashboardDetailHeader.vue';
import { useDashboardGetQuery } from '@/services/dashboards/shared/composables/use-dashboard-get-query';

interface Props {
    dashboardId: string;
}
const props = defineProps<Props>();

const gnbStore = useGnbStore();
const { breadcrumbs } = useBreadcrumbs();

/* Query */
const {
    dashboard,
} = useDashboardGetQuery({
    dashboardId: computed(() => props.dashboardId),
});

const state = reactive({
    favoriteOptions: computed<FavoriteOptions>(() => ({
        type: FAVORITE_TYPE.DASHBOARD,
        id: props.dashboardId,
    })),
    isDeprecatedDashboard: computed(() => dashboard.value?.version === '1.0'),
});

watch(() => props.dashboardId, async (dashboardId) => {
    // Set Dashboard Detail Custom breadcrumbs
    if (dashboardId) { // this includes all three cases
        gnbStore.setBreadcrumbs(breadcrumbs.value);
    }
}, { immediate: true });

watch(() => state.favoriteOptions, (favoriteOptions) => {
    gnbStore.setFavoriteItemId(favoriteOptions);
}, { immediate: true });

onUnmounted(() => {
    gnbStore.setBreadcrumbs([]);
});
</script>

<template>
    <div class="dashboard-detail-page">
        <portal-target name="dashboard-detail-page" />
        <div v-if="state.isDeprecatedDashboard"
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
        <dashboard-detail-header :dashboard-id="props.dashboardId" />
        <p-divider class="divider" />
        <dashboard-detail-body :dashboard-id="props.dashboardId" />
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
    .divider {
        @apply mb-4;
    }
    .fixed-header {
        @apply sticky bg-gray-100;
        z-index: 20;
        top: 0;
        padding-top: 1rem;

        .filter-box {
            @apply flex justify-between items-start mb-4;
            flex-wrap: wrap;
            row-gap: 0.25rem;

            .left-part {
                display: flex;
                align-items: center;
                flex-wrap: wrap;
                column-gap: 1rem;
            }

            .right-part {
                display: flex;
                flex-wrap: wrap;
                flex-shrink: 0;
            }
        }

        .dashboard-selectors {
            padding-bottom: 0.75rem;

            .variable-selector-wrapper {
                @apply relative flex items-center flex-wrap;
                gap: 0.5rem;
                padding-right: 1rem;
            }
        }
    }
    .widget-container-body {
        padding-top: 0.75rem;
    }
}
</style>
