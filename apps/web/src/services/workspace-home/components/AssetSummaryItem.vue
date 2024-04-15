<script setup lang="ts">
import { PLazyImg } from '@spaceone/design-system';

import { byteFormatter, numberFormatter } from '@cloudforet/utils';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

import type { ProviderResourceDataItem } from '@/services/workspace-home/types/workspace-home-type';

interface Props {
    item?: ProviderResourceDataItem;
}

const props = withDefaults(defineProps<Props>(), {
    item: undefined,
});
</script>

<template>
    <div class="asset-summary-item">
        <div class="title-wrapper">
            <p-lazy-img
                v-if="props.item.icon"
                :src="assetUrlConverter(props.item.icon)"
                width="1.25rem"
                height="1.25rem"
                class="icon"
            />
            <span>{{ props.item.name }}</span>
        </div>
        <div class="data-wrapper">
            <p class="data-row">
                <span class="label">{{ $t('HOME.ASSET_SUMMARY_SERVER') }}</span>
                <span>{{ numberFormatter(props.item.server) || 0 }}</span>
            </p>
            <p class="data-row">
                <span class="label">{{ $t('HOME.ASSET_SUMMARY_DATABASE') }}</span>
                <span>{{ numberFormatter(props.item.database) || 0 }}</span>
            </p>
            <p class="data-row">
                <span class="label">{{ $t('HOME.ASSET_SUMMARY_STORAGE') }}</span>
                <span>{{ byteFormatter(props.item.storage) || 0 }}</span>
            </p>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.asset-summary-item {
    @apply flex flex-col bg-gray-100 border-l-4 border-gray-200 cursor-default;
    min-width: 11.5rem;
    width: 11.5rem;
    height: 7.875rem;
    padding: 1rem 1rem 0.75rem 1rem;
    gap: 0.75rem;
    border-radius: 0.375rem;
    .title-wrapper {
        @apply flex text-label-md;
        gap: 0.375rem;
    }
    .data-wrapper {
        @apply flex flex-col;
        .data-row {
            @apply flex justify-between text-label-sm text-gray-700;
            padding-top: 0.125rem;
            padding-bottom: 0.125rem;
            .label {
                @apply text-paragraph-sm;
            }
        }
    }
}
</style>
