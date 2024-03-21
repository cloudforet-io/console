<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PDivider, PHeading, PPaneLayout, PButton, PCard, PI, PLazyImg,
} from '@spaceone/design-system';

import { i18n } from '@/translations';

const state = reactive({
    cardList: computed(() => [
        {
            title: i18n.t('메트릭 그리기'),
            alt: 'metric drawing',
            desc: i18n.t('여러 메트릭 및 리소스를 사용하여 차트 만들기'),
            img: '/src/assets/images/metric/metric_feature_1.png',
        },
        {
            title: i18n.t('얼럿 만들기'),
            alt: 'alert making',
            desc: i18n.t('메트릭과 리소스 정보를 바탕으로 얼럿 만들기'),
            img: '/src/assets/images/metric/metric_feature_2.png',
        },
        {
            title: i18n.t('제3의 기능'),
            alt: 'third feature',
            desc: i18n.t('자랑해야만하는 feature 3개를 상단에 팍팍 박아줍니다'),
            img: '/src/assets/images/metric/metric_feature_2.png',
        },
    ]),
    recentMetricCardList: computed(() => [{
        id: '1',
        icon: '',
        label: 'AWS / EC2 / Instance /',
        metricName: 'countbyRegion',
    }, {
        id: '2',
        icon: '',
        label: 'AWS / EC2 / Instance /',
        metricName: 'countbyRegion',
    }, {
        id: '3',
        icon: '',
        label: 'AWS / EC2 / Instance /',
        metricName: 'countbyRegion',
    }, {
        id: '4',
        icon: '',
        label: 'AWS / EC2 / Instance /',
        metricName: 'countbyRegion',
    }, {
        id: '5',
        icon: '',
        label: 'AWS / EC2 / Instance /',
        metricName: 'countbyRegion',
    }]),
});
</script>

<template>
    <div class="metric-explorer-content">
        <p-heading :title="$t('INVENTORY.METRIC_EXPLORER.METRIC_EXPLORER')" />
        <p-divider />
        <p-pane-layout style="margin-top: 1.5rem;">
            <div class="contents">
                <p class="title">
                    {{ $t('Get stared with Metric Explorer') }}
                </p>
                <div class="desc-wrapper">
                    <p>{{ $t('To begin, select a namespace and then a metric in the left sidebar.') }}</p>
                    <p>{{ $t('For further details, see below.') }}</p>
                </div>
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
                            {{ card.title }}
                        </p>
                        <p class="card-desc">
                            {{ card.desc }}
                        </p>
                    </div>
                </div>
                <p-button style-type="secondary"
                          icon-right="ic_external-link"
                          style="margin-top: 0.5rem; margin-bottom: 3rem;"
                >
                    {{ $t('Learn More about Metric Explorer') }}
                </p-button>
                <p-divider v-if="state.recentMetricCardList.length" />
                <div v-if="state.recentMetricCardList.length"
                     class="bottom-area"
                >
                    <header>{{ $t('Recently Visited') }}</header>
                    <div class="recent-card-wrapper">
                        <p-card v-for="recent in state.recentMetricCardList"
                                :key="recent.id"
                                :header="false"
                                class="recent-card"
                        >
                            <div class="card-contents">
                                <span class="icon">
                                    <p-lazy-img v-if="recent.icon"
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
                                    <p>{{ recent.label }}</p>
                                    <p class="metric-name">
                                        {{ recent.metricName }}
                                    </p>
                                </div>
                            </div>
                        </p-card>
                    </div>
                </div>
            </div>
        </p-pane-layout>
    </div>
</template>

<style lang="postcss" scoped>
.metric-explorer-content {
    @apply text-gray-900;
    width: 100%;

    .contents {
        @apply flex flex-col gap-3 items-center;
        margin: 3rem 1.5rem 1.5rem 1.5rem;

        .title {
            @apply text-display-sm font-medium;
        }

        .desc-wrapper {
            @apply flex flex-col items-center text-paragraph-md;
        }

        .card-group {
            @apply flex gap-4;
            justify-content: space-between;
            margin-bottom: 1.5rem;

            .card {
                @apply bg-white rounded-md text-gray-700;
                width: 11.875rem;

                .image {
                    width: 100%;
                    height: 6.25rem;
                    object-fit: contain;
                }

                .card-title {
                    @apply font-bold text-paragraph-md font-bold;
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
                grid-template-columns: repeat(auto-fill, 16.25rem);
                grid-template-rows: auto;

                .recent-card {
                    width: 16.25rem;
                    height: 100%;
                    padding: 0.25rem 0.125rem;
                    cursor: pointer;

                    .card-contents {
                        @apply flex gap-2;

                        .recent-desc {
                            display: inline-block;

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
</style>
