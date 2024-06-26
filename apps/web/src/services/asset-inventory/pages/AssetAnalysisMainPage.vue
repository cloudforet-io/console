<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    PDivider, PHeading, PPaneLayout, PButton, PCard, PI, PLazyImg, PBadge,
} from '@spaceone/design-system';

import MetricImgAlert from '@/assets/images/metric/img_alert.png';
import MetricImgHowToUse from '@/assets/images/metric/img_how-to-use.png';
import MetricImgVisualization from '@/assets/images/metric/img_visualization.png';
import { store } from '@/store';
import { i18n } from '@/translations';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import { useRecentStore } from '@/common/modules/navigations/stores/recent-store';
import type { RecentItem } from '@/common/modules/navigations/type';
import { RECENT_TYPE } from '@/common/modules/navigations/type';

import AssetAnalysisQueryFormSidebar from '@/services/asset-inventory/components/AssetAnalysisQueryFormSidebar.vue';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { useAssetAnalysisPageStore } from '@/services/asset-inventory/stores/asset-analysis-page-store';


const recentStore = useRecentStore();
const userWorkspaceStore = useUserWorkspaceStore();
const allReferenceStore = useAllReferenceStore();
const router = useRouter();
const assetAnalysisPageStore = useAssetAnalysisPageStore();
const assetAnalysisPageState = assetAnalysisPageStore.state;

const storeState = reactive({
    language: computed(() => store.state.user.language),
    currentWorkspaceId: computed(() => userWorkspaceStore.getters.currentWorkspaceId),
    namespace: computed(() => allReferenceStore.getters.namespace),
    metric: computed(() => allReferenceStore.getters.metric),
});

const state = reactive({
    cardList: computed(() => [
        {
            title: i18n.t('INVENTORY.METRIC_EXPLORER.MAIN.LOCATE_METRICS'),
            alt: 'metric',
            desc: i18n.t('INVENTORY.METRIC_EXPLORER.MAIN.LOCATE_METRICS_DESC'),
            img: MetricImgHowToUse,
        },
        {
            title: i18n.t('INVENTORY.METRIC_EXPLORER.MAIN.ANALYZE_DATA'),
            alt: 'analyze',
            desc: i18n.t('INVENTORY.METRIC_EXPLORER.MAIN.ANALYZE_DATA_DESC'),
            img: MetricImgVisualization,
        },
        {
            title: i18n.t('INVENTORY.METRIC_EXPLORER.MAIN.CONFIGURE_ALERTS'),
            alt: 'alert',
            desc: i18n.t('INVENTORY.METRIC_EXPLORER.MAIN.CONFIGURE_ALERTS_DESC'),
            img: MetricImgAlert,
        },
    ]),
    recentList: [] as RecentItem[],
    recentMetricCardList: computed(() => state.recentList.map((recent) => {
        const metric = storeState.metric[recent.data.id];
        const namespace = storeState.namespace[metric?.data?.namespace_id ?? ''];
        if (metric?.label === undefined) return undefined;
        return ({
            id: recent.data.id,
            icon: namespace?.data?.icon,
            label: namespace?.label ?? '',
            metricName: metric?.label ?? undefined,
            category: namespace?.data?.category,
        });
    }).filter((recent) => recent !== undefined)),
});

const handleRouteToMetricDetail = (metricId: string) => {
    router.push({
        name: ASSET_INVENTORY_ROUTE.METRIC_EXPLORER.DETAIL._NAME,
        params: {
            metricId,
        },
    });
};
const handleClickLearnMore = () => {
    const language = storeState.language === 'ko' ? 'ko/' : '';
    window.open(`https://cloudforet.io/${language}/docs/guides/asset-inventory/asset-analysis`, '_blank');
};

const fetchRecentList = async () => {
    const recentList = await recentStore.fetchRecent({
        type: RECENT_TYPE.METRIC_EXPLORER,
        workspaceIds: [storeState.currentWorkspaceId ?? ''],
        limit: 10,
    });
    state.recentList = recentList;
};

(async () => {
    await fetchRecentList();
})();
</script>

<template>
    <div class="asset-analysis-content">
        <p-heading :title="$t('INVENTORY.METRIC_EXPLORER.METRIC_EXPLORER')" />
        <p-pane-layout>
            <div class="contents">
                <p class="title">
                    {{ $t('INVENTORY.METRIC_EXPLORER.MAIN.TITLE') }}
                </p>
                <div class="card-group">
                    <div v-for="(card, idx) in state.cardList"
                         :key="card.title + idx"
                         class="card"
                    >
                        <img :src="card.img"
                             :alt="card.alt"
                             class="image"
                        >
                        <p class="card-title">
                            {{ card.title }} <p-badge v-if="card.alt === 'alert'"
                                                      badge-type="subtle"
                                                      style-type="indigo100"
                            >
                                {{ $t('INVENTORY.METRIC_EXPLORER.MAIN.UPCOMING') }}
                            </p-badge>
                        </p>
                        <p class="card-desc">
                            {{ card.desc }}
                        </p>
                    </div>
                </div>
                <p-button style-type="secondary"
                          icon-right="ic_external-link"
                          style="margin-top: 0.5rem; margin-bottom: 3rem;"
                          @click="handleClickLearnMore"
                >
                    {{ $t('INVENTORY.METRIC_EXPLORER.MAIN.LEARN_MORE') }}
                </p-button>
                <p-divider v-if="state.recentMetricCardList.length" />
                <div v-if="state.recentMetricCardList.length"
                     class="bottom-area"
                >
                    <header>{{ $t('INVENTORY.METRIC_EXPLORER.MAIN.RECENTLY_VISITED') }}</header>
                    <div class="recent-card-wrapper">
                        <p-card v-for="recent in state.recentMetricCardList"
                                :key="recent.id"
                                :header="false"
                                class="recent-card"
                                @click.native="handleRouteToMetricDetail(recent.id)"
                        >
                            <div class="card-contents">
                                <span class="icon">
                                    <img v-if="recent?.category === 'COMMON'"
                                         class="common-namespace-icon"
                                         src="@/assets/images/img_common-asset@2x.png"
                                         alt="common_namespace_icon"
                                    >
                                    <p-lazy-img v-else-if="recent.icon"
                                                :src="recent.icon"
                                                width="1.75rem"
                                                height="1.75rem"
                                    />
                                    <p-i v-else
                                         name="ic_service_cloud-service"
                                         width="1.75rem"
                                         height="1.75rem"
                                    />
                                </span>
                                <div class="recent-desc">
                                    <p class="label-text">
                                        {{ recent.label }}
                                    </p>
                                    <p class="metric-name">
                                        {{ recent?.metricName ?? recent.id }}
                                    </p>
                                </div>
                            </div>
                        </p-card>
                    </div>
                </div>
                <asset-analysis-query-form-sidebar v-show="assetAnalysisPageState.showMetricQueryFormSidebar" />
            </div>
        </p-pane-layout>
    </div>
</template>

<style lang="postcss" scoped>
.asset-analysis-content {
    @apply text-gray-900;
    width: 100%;

    .contents {
        @apply flex flex-col gap-3 items-center;
        margin: 3rem 1.5rem 1.5rem 1.5rem;

        .title {
            @apply text-display-sm font-medium;
            margin-bottom: 0.75rem;
        }

        .desc-wrapper {
            @apply flex flex-col items-center text-paragraph-md text-center;
        }

        .card-group {
            @apply flex gap-4;
            justify-content: space-between;
            margin-bottom: 1.5rem;

            .card {
                @apply bg-white rounded-md text-gray-700;
                width: 11.875rem;

                .image {
                    @apply border border-gray-200 rounded-md;
                    width: 11.875rem;
                    object-fit: contain;
                }

                .card-title {
                    @apply font-bold text-paragraph-md;
                    white-space: nowrap;
                    margin-top: 0.5rem;
                }

                .card-desc {
                    @apply text-label-md;
                    margin-top: 0.25rem;
                }
            }
        }

        .bottom-area {
            width: 100%;

            header {
                @apply text-label-lg font-medium;
                margin-top: 2rem;
                margin-bottom: 0.75rem;
            }

            .recent-card-wrapper {
                @apply grid gap-2;
                grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
                grid-template-rows: auto;

                /* custom design-system component - p-card */
                :deep(.p-card) {
                    .body {
                        height: 100%;
                    }
                }

                .recent-card {
                    min-width: 16rem;
                    padding: 0.25rem 0.125rem;
                    cursor: pointer;
                    word-break: break-all;

                    .card-contents {
                        @apply flex gap-2;

                        .common-namespace-icon {
                            width: 1.75rem;
                            height: 1.75rem;
                        }

                        .recent-desc {
                            display: inline-block;

                            .label-text {
                                @apply text-label-md text-gray-800;
                            }

                            .metric-name {
                                @apply text-label-lg font-bold;
                                margin-top: 0.1875rem;
                            }
                        }
                    }
                }
            }
        }
    }
}

@screen tablet {
    .asset-analysis-content {
        .contents {
            .card-group {
                @apply flex gap-4 justify-center flex-wrap;
            }
        }
    }
}

@screen mobile {
    .asset-analysis-content {
        .contents {
            .card-group {
                @apply flex-col gap-4;
            }
        }
    }
}
</style>
