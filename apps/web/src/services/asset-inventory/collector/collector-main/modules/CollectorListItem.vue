<template>
    <p-card :header="false"
            style-type="white"
            class="collector-item"
    >
        <div class="collector-item-wrapper">
            <span class="collector-item-name">{{ props.item.name }}</span>
            <div class="collector-info-wrapper">
                <div class="collector-info-view">
                    <collector-item-plugin :item="props.item" />
                    <collector-item-job-list :item="props.item" />
                </div>
                <div class="collector-info-view">
                    <collector-item-status :item="props.item" />
                    <collector-item-schedule :item="props.item" />
                </div>
            </div>
        </div>
        <p-button class="collect-data-button"
                  style-type="tertiary"
                  :loading="state.collectLoading"
                  @click.stop="handleClickCollectData(props.item.collectorId)"
        >
            <span>{{ $t('INVENTORY.COLLECTOR.MAIN.COLLECT_DATA') }}</span>
        </p-button>
    </p-card>
</template>

<script setup lang="ts">
import { reactive } from 'vue';

import { PButton, PCard } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import CollectorItemJobList from '@/services/asset-inventory/collector/collector-main/modules/collector-item-info/CollectorItemJobList.vue';
import CollectorItemPlugin from '@/services/asset-inventory/collector/collector-main/modules/collector-item-info/CollectorItemPlugin.vue';
import CollectorItemSchedule
    from '@/services/asset-inventory/collector/collector-main/modules/collector-item-info/CollectorItemSchedule.vue';
import CollectorItemStatus from '@/services/asset-inventory/collector/collector-main/modules/collector-item-info/CollectorItemStatus.vue';
import type { CollectorItemInfo } from '@/services/asset-inventory/collector/collector-main/type';

interface Props {
    item?: CollectorItemInfo;
}

const props = withDefaults(defineProps<Props>(), {
    item: undefined,
});

const emit = defineEmits(['refresh-collector-list']);

const state = reactive({
    collectLoading: false,
});

/* API */
const handleClickCollectData = async (collectorId) => {
    state.collectLoading = true;
    try {
        await SpaceConnector.client.inventory.collector.collect({
            collector_id: collectorId,
        });
        emit('refresh-collector-list');
        showSuccessMessage(i18n.t('INVENTORY.COLLECTOR.CREATE.ALT_S_COLLECT_EXECUTION'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.COLLECTOR.CREATE.ALT_E_COLLECT_EXECUTION'));
    } finally {
        state.collectLoading = false;
    }
};
</script>

<style lang="postcss" scoped>
.collector-item {
    /* custom design-system component - p-card */
    :deep(.p-card) {
        @apply relative;

        &:hover {
            @apply cursor-pointer;
            .body {
                @apply bg-blue-100;
            }

            .collect-data-button {
                @apply flex absolute;
                opacity: 1;
                top: 1.25rem;
                right: 1.5rem;
                gap: 0.25rem;
            }
        }

        .collect-data-button {
            @apply hidden;
            opacity: 0;
        }
    }

    .collector-item-wrapper {
        @apply flex flex-col;
        gap: 1.25rem;
        padding: 0.5rem 0.625rem;

        .collector-item-name {
            @apply text-label-xl font-bold;
        }
        .collector-info-wrapper {
            @apply flex;

            .collector-info-view {
                flex: 1;
            }
        }
    }
}
</style>
