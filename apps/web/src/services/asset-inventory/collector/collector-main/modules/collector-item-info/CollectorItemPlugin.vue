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
    @apply flex flex-col flex-wrap;
    flex: 1;
    gap: 0.5rem;

    .info-label {
        @apply text-label-sm text-gray-500;
    }
    .plugin {
        @apply flex items-center text-label-md;
        gap: 0.25rem;

        .plugin-icon {
            min-width: 1.25rem;
        }

        .plugin-info {
            @apply flex;
            flex: 1;

            .plugin-name {
                @apply truncate;
                flex: 3;
            }

            .plugin-version {
                @apply truncate text-label-sm text-gray-700;
                flex: 1;
            }
        }
    }
}
</style>
