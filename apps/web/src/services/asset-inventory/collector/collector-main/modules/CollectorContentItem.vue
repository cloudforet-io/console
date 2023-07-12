<template>
    <div class="collector-content-item">
        <p-card :header="false"
                style-type="white"
                class="collector-item"
        >
            <div class="collector-item-wrapper">
                <span class="collector-item-name">{{ props.item.name }}</span>
                <div class="collector-plugin">
                    <p-lazy-img :src="props.item.plugin.icon"
                                width="1.5rem"
                                height="1.5rem"
                                class="plugin-icon"
                    />
                    <div class="title-wrapper">
                        <span class="plugin-name">{{ state.plugin.name }}</span>
                        <span class="plugin-version">v{{ state.plugin.version }}</span>
                    </div>
                </div>
                <div class="collector-info-wrapper">
                    <div class="collector-info-view">
                        <collector-item-status :item="props.item" />
                        <collector-item-job-list :item="props.item" />
                    </div>
                    <collector-item-schedule :item="props.item" />
                </div>
            </div>
            <div class="collector-status-wrapper">
                <p-button style-type="tertiary"
                          class="collector-data-button"
                          @click.stop="handleClickCollectData"
                >
                    {{ $t('INVENTORY.COLLECTOR.MAIN.COLLECT_DATA') }}
                </p-button>
            </div>
        </p-card>
    </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PButton, PCard, PLazyImg,
} from '@spaceone/design-system';

import { useCollectorPageStore } from '@/services/asset-inventory/collector/collector-main/collector-page-store';
import CollectorItemJobList from '@/services/asset-inventory/collector/collector-main/modules/collector-item-info/CollectorItemJobList.vue';
import CollectorItemSchedule
    from '@/services/asset-inventory/collector/collector-main/modules/collector-item-info/CollectorItemSchedule.vue';
import CollectorItemStatus from '@/services/asset-inventory/collector/collector-main/modules/collector-item-info/CollectorItemStatus.vue';
import type { CollectorItemInfo } from '@/services/asset-inventory/collector/collector-main/type';
import {
    useCollectorDataModalStore,
} from '@/services/asset-inventory/collector/shared/collector-data-modal/collector-data-modal-store';

interface Props {
    item?: CollectorItemInfo;
}

const props = withDefaults(defineProps<Props>(), {
    item: undefined,
});

const collectorPageStore = useCollectorPageStore();
const collectorPageState = collectorPageStore.$state;
const collectorDataModalStore = useCollectorDataModalStore();

const state = reactive({
    plugin: computed(() => {
        const plugin = props.item?.plugin;
        return { name: plugin.name, version: plugin.info.version };
    }),
});

/* API */
const handleClickCollectData = async () => {
    await collectorPageStore.setSelectedCollector(props.item.collectorId);
    await collectorPageStore.$patch((_state) => {
        _state.visible.collectorModal = true;
    });
    await collectorDataModalStore.$patch((_state) => {
        _state.selectedCollector = collectorPageState.selectedCollector;
    });
};
</script>

<style lang="postcss" scoped>
.collector-content-item {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);

    /* custom design-system component - p-card */
    :deep(.p-card) {
        &:hover {
            .body {
                @apply bg-blue-100;
            }
        }
    }

    .collector-item {
        @apply relative;

        &:hover {
            @apply cursor-pointer;

            .collector-status-wrapper {
                .collector-data-button {
                    opacity: 1;
                }
            }
        }

        .collector-status-wrapper {
            @apply absolute;
            top: 1.25rem;
            right: 1.5rem;
            gap: 0.25rem;

            .collector-data-button {
                @apply flex items-center;
                opacity: 0;
                padding-top: 0.065rem;
            }
        }

        .collector-item-wrapper {
            @apply flex flex-col;
            gap: 0.875rem;
            padding: 0.5rem 0.625rem;

            .collector-item-name {
                @apply text-label-xl font-bold;
            }

            .collector-plugin {
                @apply flex items-center;
                gap: 0.5rem;

                .title-wrapper {
                    @apply flex flex-col;
                    .plugin-name {
                        @apply truncate text-label-md;
                    }

                    .plugin-version {
                        @apply text-label-sm text-gray-400;
                    }
                }
            }

            .collector-info-wrapper {
                margin-top: 1.125rem;

                @screen tablet {
                    @apply flex-col;
                    gap: 1rem;
                }

                .collector-info-view {
                    @apply flex justify-between;

                    @screen tablet {
                        width: 100%;
                    }

                    .info-item {
                        @apply relative flex flex-col flex-wrap;
                        gap: 0.5rem;
                    }
                }
            }
        }
    }
}
</style>
