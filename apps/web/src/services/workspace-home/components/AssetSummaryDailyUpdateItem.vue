<script setup lang="ts">
import { PLazyImg, PI } from '@spaceone/design-system';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

import type { CloudServiceData } from '@/services/workspace-home/types/workspace-home-type';

interface Props {
    item?: CloudServiceData;
}

const props = withDefaults(defineProps<Props>(), {
    item: undefined,
});
</script>

<template>
    <div class="asset-summary-daily-update-item"
         :class="{'is-warning': props.item.create_warning || props.item.delete_warning}"
    >
        <p-lazy-img
            v-if="props.item.icon"
            :src="assetUrlConverter(props.item.icon)"
            width="1.25rem"
            height="1.25rem"
            class="icon"
        />
        <span class="title">{{ props.item.cloud_service_group }}/{{ props.item.cloud_service_type }}
            <span class="total-count">({{ props.item.total_count }})</span>
        </span>
        <div v-if="props.item.created_count"
             class="data-row created"
        >
            <span class="text-wrapper">
                <p-i v-if="props.item.create_warning"
                     name="ic_warning-filled"
                     width="0.75rem"
                     height="0.75rem"
                     class="warning-icon"
                />
                <span class="label">{{ $t('HOME.ASSET_SUMMARY_CREATED') }}</span>
                <span>{{ props.item.created_count }}</span>
            </span>
        </div>
        <div v-if="props.item.deleted_count"
             class="data-row deleted"
        >
            <span class="text-wrapper">
                <p-i v-if="props.item.delete_warning"
                     name="ic_warning-filled"
                     width="0.75rem"
                     height="0.75rem"
                     class="warning-icon"
                />
                <span class="label">{{ $t('HOME.ASSET_SUMMARY_DELETED') }}</span>
                <span>{{ props.item.deleted_count }}</span>
            </span>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.asset-summary-daily-update-item {
    @apply flex flex-col border border-gray-200 cursor-default;
    min-width: 8.5rem;
    width: 8.5rem;
    height: 10rem;
    padding: 1rem;
    gap: 0.375rem;
    border-radius: 0.375rem;
    &.is-warning {
        background: linear-gradient(147.29deg, #fff3c5 0%, theme('colors.white') 107.36%);
    }
    .title {
        @apply text-label-md;
        flex: 1;
        .total-count {
            @apply font-medium;
        }
    }
    .data-row {
        @apply text-paragraph-sm;
        .text-wrapper {
            width: auto;
            padding-right: 0.5rem;
            padding-left: 0.5rem;
            border-radius: 0.25rem;
            .warning-icon {
                margin-top: -0.125rem;
                margin-right: 0.25rem;
            }
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
