<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PFieldTitle, PIconButton, PDivider, PLink,
} from '@spaceone/design-system';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProviderReferenceMap, ProviderItem } from '@/store/reference/provider-reference-store';

import AssetSummaryDailyUpdateItem from '@/services/workspace-home/components/AssetSummaryDailyUpdateItem.vue';
import AssetSummaryItem from '@/services/workspace-home/components/AssetSummaryItem.vue';

const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;

const storeState = reactive({
    providerMap: computed<ProviderReferenceMap>(() => allReferenceGetters.provider),
});

const state = reactive({
    providers: computed<ProviderItem[]>(() => Object.keys(storeState.providerMap).map((key) => storeState.providerMap[key])),
});
</script>

<template>
    <div class="asset-summary">
        <p-field-title :label="$t('HOME.ASSET_SUMMARY_TITLE')"
                       size="lg"
                       class="main-title"
        />
        <div class="content-wrapper">
            <div class="row-items-wrapper">
                <asset-summary-item v-for="(item, idx) in state.providers"
                                    :key="`asset-summary-item-${idx}`"
                                    :item="item"
                />
                <div class="arrow-button-wrapper">
                    <p-icon-button class="arrow-button left"
                                   name="ic_chevron-left"
                                   color="inherit transparent"
                                   width="1.5rem"
                                   height="1.5rem"
                    />
                    <p-icon-button class="arrow-button right"
                                   name="ic_chevron-right"
                                   color="inherit transparent"
                                   width="1.5rem"
                                   height="1.5rem"
                    />
                </div>
            </div>
            <div class="daily-update-wrapper">
                <p-field-title :label="$t('HOME.ASSET_SUMMARY_DAILY_UPDATE_TITLE')"
                               class="daily-update-title"
                >
                    <template #right>
                        <span class="desc">{{ $t('HOME.ASSET_SUMMARY_DAILY_UPDATE_DESC') }}</span>
                    </template>
                </p-field-title>
                <div class="row-items-wrapper">
                    <asset-summary-daily-update-item v-for="(item, idx) in state.providers"
                                                     :key="`asset-summary-daily-update-item-${idx}`"
                                                     :item="item"
                    />
                    <div class="arrow-button-wrapper">
                        <p-icon-button class="arrow-button left"
                                       name="ic_chevron-left"
                                       color="inherit transparent"
                                       width="1.5rem"
                                       height="1.5rem"
                        />
                        <p-icon-button class="arrow-button right"
                                       name="ic_chevron-right"
                                       color="inherit transparent"
                                       width="1.5rem"
                                       height="1.5rem"
                        />
                    </div>
                </div>
            </div>
        </div>
        <p-divider />
        <p-link highlight
                action-icon="internal-link"
                class="link"
        >
            <span>{{ $t('HOME.ASSET_SUMMARY_SHOW_MORE_DAILY_UPDATE') }}</span>
        </p-link>
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
            @apply relative flex overflow-hidden;
            gap: 0.5rem;
            padding-left: 1.5rem;
            &::after {
                @apply absolute;
                content: '';
                top: 0;
                right: 0;
                width: 2rem;
                height: 100%;
                background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, theme('colors.white') 50%);
            }
            .arrow-button-wrapper {
                @apply absolute flex justify-between;
                top: calc(50% - 1rem);
                right: 0.75rem;
                left: 0.5rem;
                width: calc(100% - 1.25rem);
                z-index: 10;
                .arrow-button {
                    @apply bg-white border border-gray-300 rounded-full;
                    width: 2rem;
                    height: 2rem;
                    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
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
    }
    .link {
        @apply flex items-center justify-center text-label-md;
        padding-top: 0.625rem;
        padding-bottom: 0.75rem;
    }
}
</style>
