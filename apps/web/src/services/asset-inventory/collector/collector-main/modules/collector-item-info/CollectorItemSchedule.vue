<template>
    <div class="info-item">
        <div class="info-label-wrapper">
            <p class="info-label">
                {{ $t('INVENTORY.COLLECTOR.DETAIL.SCHEDULE') }}
            </p>
            <button class="schedule-button"
                    @click.stop="handleClickSchedule"
            >
                <p-i v-if="state.isScheduleActivated"
                     name="ic_edit"
                     height="0.75rem"
                     width="0.75rem"
                     color="inherit"
                     class="icon-schedule"
                />
                <p-i v-else
                     name="ic_settings-filled"
                     height="0.75rem"
                     width="0.75rem"
                     color="inherit"
                     class="icon-schedule"
                />
                {{ state.isScheduleActivated ? $t('INVENTORY.COLLECTOR.MAIN.EDIT_SCHEDULE') : $t('INVENTORY.COLLECTOR.MAIN.SET_SCHEDULE') }}
            </button>
        </div>
        <div @click.stop="handleChangeToggle">
            <p-toggle-button
                :value="state.isScheduleActivated"
                :label="state.isScheduleActivated ? 'ON' : 'OFF'"
                :class="state.isScheduleActivated ? 'toggle-active' : ''"
                @change-toggle="handleChangeToggle"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';

import { PToggleButton, PI } from '@spaceone/design-system';

import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useCollectorPageStore } from '@/services/asset-inventory/collector/collector-main/collector-page-store';
import type { CollectorItemInfo } from '@/services/asset-inventory/collector/collector-main/type';
import type { CollectorUpdateParameter } from '@/services/asset-inventory/collector/model';
import { useCollectorFormStore } from '@/services/asset-inventory/collector/shared/collector-forms/collector-form-store';

interface Props {
    item?: CollectorItemInfo;
}

const props = withDefaults(defineProps<Props>(), {
    item: undefined,
});

const collectorPageStore = useCollectorPageStore();
const collectorFormStore = useCollectorFormStore();

const state = reactive({
    isScheduleActivated: false,
});

/* Components */
const handleChangeToggle = async (value) => {
    if (Object.keys(value).length > 0) return;
    try {
        state.isScheduleActivated = !state.isScheduleActivated;
        const params: CollectorUpdateParameter = {
            collector_id: props.item.collectorId,
            schedule: {
                ...props.item.schedule,
                state: state.isScheduleActivated ? 'ENABLED' : 'DISABLED',
            },
        };
        const response = await collectorPageStore.updateCollectorSchedule(params);
        await collectorFormStore.setOriginCollector(response);
        showSuccessMessage(i18n.t('INVENTORY.COLLECTOR.ALT_S_UPDATE_SCHEDULE'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.COLLECTOR.ALT_E_UPDATE_SCHEDULE'));
    }
};
const handleClickSchedule = () => {
    collectorPageStore.setSelectedCollector(props.item.collectorId);
    collectorPageStore.$patch({
        visibleScheduleModal: true,
    });
};
</script>

<style lang="postcss" scoped>
.info-item {
    .info-label-wrapper {
        @apply flex;
        gap: 0.375rem;

        .info-label {
            @apply text-label-sm text-gray-500;
        }

        .schedule-button {
            @apply flex items-center text-label-sm text-blue-600 font-normal;
            gap: 0.125rem;

            &:hover {
                @apply underline;
                background-color: initial;
            }
            .icon-schedule {
                @apply text-blue-600;
            }
        }
    }

    /* custom design-system component - p-toggle-button */
    :deep(.p-toggle-button) {
        .label {
            @apply text-gray-400;
        }
        &.toggle-active {
            .label {
                @apply text-blue-600;
            }
        }
    }
}
</style>
