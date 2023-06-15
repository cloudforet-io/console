<template>
    <div class="info-item">
        <p class="info-label">
            {{ $t('INVENTORY.COLLECTOR.DETAIL.PLUGIN') }}
        </p>
        <div class="plugin">
            <p-lazy-img :src="props.item.plugin.icon"
                        width="1.25rem"
                        height="1.25rem"
                        class="plugin-icon"
            />
            <div class="plugin-info">
                <span class="plugin-name">{{ state.plugin.name }}</span>
                <span class="plugin-version">v{{ state.plugin.version }}</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PLazyImg } from '@spaceone/design-system';

import type { CollectorItemInfo } from '@/services/asset-inventory/collector/collector-main/type';

interface Props {
    item?: CollectorItemInfo;
}

const props = withDefaults(defineProps<Props>(), {
    item: undefined,
});

const state = reactive({
    plugin: computed(() => {
        const plugin = props.item?.plugin;
        return { name: plugin.name, version: plugin.info.version };
    }),
});
</script>

<style scoped lang="postcss">
.info-item {
    .info-label {
        @apply text-label-sm text-gray-500;
    }
    .plugin {
        @apply absolute flex items-center text-label-md;
        width: 100%;
        bottom: 0;
        left: 0;
        gap: 0.25rem;

        .plugin-icon {
            min-width: 1.25rem;
        }

        .plugin-info {
            @apply absolute flex;
            width: 100%;
            bottom: 0.25rem;
            left: 1.5rem;

            .plugin-name {
                @apply truncate;
                width: calc(75% - 0.125rem);
            }

            .plugin-version {
                @apply truncate text-label-sm text-gray-700;
                width: calc(25% - 0.125rem);
            }
        }
    }
}
</style>
