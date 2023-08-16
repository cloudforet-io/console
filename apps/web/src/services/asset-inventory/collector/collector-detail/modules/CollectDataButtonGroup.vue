<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';
import {
    reactive, defineEmits, computed,
} from 'vue';

import {
    PButton, PPopover, PIconButton, screens,
} from '@spaceone/design-system';

import { useCollectorJobStore } from '@/services/asset-inventory/collector/collector-detail/collector-job-store';
import type { JobModel } from '@/services/asset-inventory/collector/model';
import CollectorCurrentStatus from '@/services/asset-inventory/collector/shared/CollectorCurrentStatus.vue';

const emit = defineEmits<{(e: 'collect'): void;
}>();

const collectorJobStore = useCollectorJobStore();

const { width } = useWindowSize();

const state = reactive({
    isPopoverOpen: false,
    recentJob: computed<JobModel|null>(() => collectorJobStore.recentJobForAllAccounts),
    showStatus: computed(() => width.value > screens.mobile.max),
});
const handleClickCollectDataButton = () => {
    emit('collect');
};

</script>

<template>
    <div class="collect-data-button-group">
        <p-popover :is-visible.sync="state.isPopoverOpen"
                   :ignore-target-click="false"
                   ignore-outside-click
        >
            <div class="buttons-wrapper">
                <p-button style-type="tertiary"
                          size="md"
                          icon-left="ic_collect"
                          class="collect-data-button"
                          :class="{dependent: state.showStatus}"
                          @click="handleClickCollectDataButton"
                >
                    {{ $t('INVENTORY.COLLECTOR.DETAIL.COLLECT_DATA') }}
                </p-button>
                <p-icon-button v-if="state.showStatus"
                               :name="state.isPopoverOpen ? 'ic_chevron-up' : 'ic_chevron-down'"
                               style-type="tertiary"
                               shape="square"
                               size="md"
                               color="inherit"
                               class="status-button"
                />
            </div>
            <template #content>
                <div class="collect-status-wrapper">
                    <collector-current-status
                        :hours="collectorJobStore.schedule?.hours"
                        :recent-job="state.recentJob"
                        :is-schedule-activated="collectorJobStore.schedule?.state === 'ENABLED'"
                    />
                </div>
            </template>
        </p-popover>
    </div>
</template>

<style scoped lang="postcss">
.collect-data-button-group {
    .buttons-wrapper {
        display: flex;
        flex-wrap: wrap;
    }
    .collect-data-button {
        &.dependent {
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
        }
    }
    .status-button {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
        border-left: 0;
    }
    .collect-status-wrapper {
        min-height: 68px;
        min-width: 250px;
    }
}
</style>
