<script setup lang="ts">

import { computed, reactive } from 'vue';

import {
    PSearch, PFieldTitle, PBoard, PLabel, PLazyImg, PButton,
} from '@spaceone/design-system';

import { store } from '@/store';

import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';

import DashboardCreateStep1SearchFilter from '@/services/dashboards/components/DashboardCreateStep1SearchFilter.vue';

const state = reactive({
    providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
    outOfTheBoxTemplateSets: [
        {
            leftIcon: 'ic_dashboard-template_blank',
            title: 'Blank',
            description: 'Build your own from scratch.',
            provider: 'blank',
        },
        {
            title: 'AWS CDN & Traffic Cost',
            labels: ['Cost'],
            provider: 'aws',
        },
        {
            title: 'AWS Compliance Overview',
            labels: ['Asset', 'Compliance', 'Security'],
            provider: 'aws',
        },
        {
            title: 'Azure Monthly Cost Summary',
            labels: ['Cost'],
            provider: 'azure',
        },
        {
            title: 'Azure CDN & Traffic Cost',
            labels: ['Cost'],
            provider: 'azure',
        },
        {
            title: 'Google Cloud Monthly Cost Summary',
            labels: ['Cost'],
            provider: 'google_cloud',
        },
        {
            title: 'Google Cloud CDN & Traffic Cost',
            labels: ['Cost'],
            provider: 'google_cloud',
        },
    ],
    exstingTemplateSets: [
        {
            title: 'AWS Monthly Cost Summary',
            labels: ['AWS', 'Cost', 'Summary'],
            provider: 'aws',
        },
        {
            title: 'AWS Cost Summary',
            labels: ['Cost', 'Summary'],
            provider: 'aws',
        },
        {
            title: 'Cost Summary',
            labels: ['Azure'],
            provider: 'azure',
        },
        {
            title: "Jenn's Cost Summary",
            labels: ['Jenny'],
            provider: 'azure',
        },
        {
            title: 'Google Cloud',
            labels: ['Azure'],
            provider: 'azure',
        },
    ],
});

</script>

<template>
    <div class="dashboard-create-step-1">
        <p-search />
        <div class="contents-container">
            <dashboard-create-step1-search-filter />
            <div class="right-area">
                <div class="out-of-the-box">
                    <p-field-title class="title">
                        Out-of-the-Box Dashboard
                    </p-field-title>
                    <!--                    TODO: request non-opacity color-->
                    <div class="out-of-the-box-contents">
                        <p-board :board-sets="state.outOfTheBoxTemplateSets"
                                 selectable
                                 style-type="cards"
                                 :style-options="{
                                     column: 2,
                                 }"
                                 class="template-board"
                        >
                            <template #item-content="{board}">
                                <div class="board-item-wrapper">
                                    <p class="board-item-title">
                                        <p-lazy-img v-if="board.provider !== 'blank'"
                                                    :src="state.providers[board.provider]?.icon"
                                                    width="1rem"
                                                    height="1rem"
                                        />
                                        {{ board.title }}
                                    </p>
                                    <p class="board-item-description">
                                        {{ board.description }}
                                    </p>
                                    <div class="board-item-labels">
                                        <p-label v-for="(label, idx) in board.labels"
                                                 :key="`${label}-${idx}`"
                                                 :text="label"
                                        />
                                    </div>
                                </div>
                            </template>
                            <template #item-overlay-content>
                                <div class="overlay-wrapper">
                                    <p-button size="md"
                                              style-type="substitutive"
                                              icon-right="ic_arrow-right"
                                    >
                                        Create
                                    </p-button>
                                </div>
                            </template>
                        </p-board>
                    </div>
                </div>
                <div class="existing">
                    <p-field-title class="title">
                        Exsting Dashboard
                    </p-field-title>
                    <div class="exsting-contents">
                        <p-board :board-sets="state.exstingTemplateSets"
                                 selectable
                                 style-type="cards"
                                 class="template-board"
                        >
                            <template #item-content="{board}">
                                <div class="board-item-wrapper">
                                    <p class="board-item-title">
                                        <p-lazy-img :src="state.providers[board.provider]?.icon"
                                                    width="1rem"
                                                    height="1rem"
                                        />
                                        {{ board.title }}
                                    </p>
                                    <div class="board-item-labels">
                                        <p-label v-for="(label, idx) in board.labels"
                                                 :key="`${label}-${idx}`"
                                                 :text="label"
                                        />
                                    </div>
                                </div>
                            </template>
                            <template #item-overlay-content>
                                <div class="overlay-wrapper">
                                    <p-button size="md"
                                              style-type="substitutive"
                                              icon-right="ic_arrow-right"
                                    >
                                        Create
                                    </p-button>
                                </div>
                            </template>
                        </p-board>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.dashboard-create-step-1 {
    @apply flex flex-col;
    min-width: 59.5625rem;
    width: 100%;
    overflow: visible;
    .contents-container {
        @apply flex justify-between gap-4;
        margin-top: 1.5rem;

        .right-area {
            max-width: 44.375rem;
            flex-grow: 1;

            .template-board {
                .board-item-title {
                    @apply text-label-md;
                    margin-bottom: 0.5rem;
                }
                .board-item-description {
                    @apply text-label-md text-gray-700;
                }
                .overlay-wrapper {
                    @apply h-full flex items-center;
                }
            }

            .out-of-the-box {
                margin-bottom: 2rem;

                .out-of-the-box-contents {
                    @apply rounded-lg bg-violet-200;
                    padding: 0.75rem 0.75rem 0.875rem 0.75rem;
                    background-color: rgba(225, 224, 250, 0.3);
                    margin-top: 0.5rem;
                }
            }

            .existing {

                .exsting-contents {
                    margin-top: 0.5rem;
                }
            }
        }
    }
}
</style>
