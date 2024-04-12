<script setup lang="ts">
import { PLazyImg } from '@spaceone/design-system';

import type { ProviderItem } from '@/store/reference/provider-reference-store';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

interface Props {
    item?: ProviderItem;
}

const props = withDefaults(defineProps<Props>(), {
    item: undefined,
});
</script>

<template>
    <div class="asset-summary-daily-update-item">
        <p-lazy-img
            v-if="props.item.icon"
            :src="assetUrlConverter(props.item.icon)"
            width="1.25rem"
            height="1.25rem"
            class="icon"
        />
        <span class="title">{{ props.item.name }}</span>
        <div class="data-row created">
            <span class="text-wrapper">
                <span class="label">{{ $t('HOME.ASSET_SUMMARY_CREATED') }}</span>
                <span>0</span>
            </span>
        </div>
        <div class="data-row deleted">
            <span class="text-wrapper">
                <span class="label">{{ $t('HOME.ASSET_SUMMARY_DELETED') }}</span>
                <span>0</span>
            </span>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.asset-summary-daily-update-item {
    @apply flex flex-col border border-gray-200;
    min-width: 8.5rem;
    width: auto;
    height: 10rem;
    padding: 1rem;
    gap: 0.375rem;
    border-radius: 0.375rem;
    .title {
        @apply text-label-md;
        flex: 1;
    }
    .data-row {
        @apply text-paragraph-sm;
        .text-wrapper {
            width: auto;
            padding-right: 0.5rem;
            padding-left: 0.5rem;
            border-radius: 0.25rem;
            .label {
                margin-right: 0.25rem;
            }
        }
        &.created {
            .text-wrapper {
                @apply bg-indigo-100 text-indigo-700;
            }
        }
        &.deleted {
            .text-wrapper {
                @apply bg-red-100 text-red-700;
            }
        }
    }
}
</style>
