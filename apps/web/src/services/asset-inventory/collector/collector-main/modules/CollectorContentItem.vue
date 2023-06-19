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
                                width="1.25rem"
                                height="1.25rem"
                                class="plugin-icon"
                    />
                    <span class="plugin-name">{{ state.plugin.name }}</span>
                    <span class="plugin-version">v{{ state.plugin.version }}</span>
                </div>
                <div class="collector-info-wrapper">
                    <div class="collector-info-view">
                        <collector-item-job-list :item="props.item" />
                    </div>
                    <div class="collector-info-view">
                        <collector-item-status :item="props.item" />
                        <collector-item-schedule :item="props.item" />
                    </div>
                </div>
            </div>
            <div class="collector-status-wrapper">
                <button v-if="state.status === JOB_STATE.IN_PROGRESS"
                        class="collector-in-process"
                        @click.stop="handleClickProgressStatus"
                >
                    <p-spinner />
                </button>
                <p-button v-else
                          style-type="tertiary"
                          :loading="collectorPageState.collectorLoading"
                          class="collector-data-button"
                          @click.stop="handleClickCollectData"
                >
                    <span>{{ $t('INVENTORY.COLLECTOR.MAIN.COLLECT_DATA') }}</span>
                </p-button>
            </div>
        </p-card>
    </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PButton, PCard, PLazyImg, PSpinner,
} from '@spaceone/design-system';

import { useCollectorPageStore } from '@/services/asset-inventory/collector/collector-main/collector-page-store';
import CollectorItemJobList from '@/services/asset-inventory/collector/collector-main/modules/collector-item-info/CollectorItemJobList.vue';
import CollectorItemSchedule
    from '@/services/asset-inventory/collector/collector-main/modules/collector-item-info/CollectorItemSchedule.vue';
import CollectorItemStatus from '@/services/asset-inventory/collector/collector-main/modules/collector-item-info/CollectorItemStatus.vue';
import type { CollectorItemInfo } from '@/services/asset-inventory/collector/collector-main/type';
import { JOB_STATE } from '@/services/asset-inventory/collector/collector-main/type';

interface Props {
    item?: CollectorItemInfo;
}

const props = withDefaults(defineProps<Props>(), {
    item: undefined,
});

const emit = defineEmits<{(e: 'refresh-collector-list'): void}>();

const collectorPageStore = useCollectorPageStore();
const collectorPageState = collectorPageStore.$state;

const state = reactive({
    status: computed(() => props.item?.recentJobAnalyze[props.item.recentJobAnalyze.length - 1].status),
    plugin: computed(() => {
        const plugin = props.item?.plugin;
        return { name: plugin.name, version: plugin.info.version };
    }),
});

/* Components */
const handleClickProgressStatus = () => {
    const collectorCollector = collectorPageStore.collectors.find((collector) => collector.collector_id === props.item.collectorId);
    collectorPageStore.$patch({
        visibleRestartModal: true,
        selectedCollector: collectorCollector,
    });
};

/* API */
const handleClickCollectData = async () => {
    const collectorId = props.item.collectorId;
    await collectorPageStore.restartCollector(collectorId);
    emit('refresh-collector-list');
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

            .collector-in-process {
                @apply relative;

                &::before {
                    @apply absolute bg-gray-500;
                    content: '';
                    top: 50%;
                    left: 50%;
                    width: 0.375rem;
                    height: 0.375rem;
                    transform: translate(-50%, -50%);
                    border-radius: 0.063rem;
                }

                &:hover {
                    &::before {
                        @apply bg-gray-900;
                    }
                }
            }

            .collector-data-button {
                opacity: 0;
            }
        }

        .collector-item-wrapper {
            @apply flex flex-col;
            gap: 1rem;
            padding: 0.75rem 0.625rem;

            .collector-item-name {
                @apply text-label-xl font-bold;
            }

            .collector-plugin {
                @apply flex items-center;
                gap: 0.5rem;

                .plugin-version {
                    @apply text-label-md text-gray-700;
                }
            }

            .collector-info-wrapper {
                @apply flex;
                gap: 1.5rem;

                @screen tablet {
                    @apply flex-col;
                    gap: 1rem;
                }

                .collector-info-view {
                    @apply flex flex-col flex-wrap;
                    gap: 1rem;
                    width: 50%;

                    .info-item {
                        @apply relative flex flex-col flex-wrap;
                        width: 100%;
                        min-height: 2.75rem;
                        gap: 0.5rem;
                    }
                }
            }
        }
    }
}
</style>
