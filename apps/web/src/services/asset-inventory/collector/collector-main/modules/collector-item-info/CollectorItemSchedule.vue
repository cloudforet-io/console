<script setup lang="ts">
import { reactive, watch } from 'vue';

import { PToggleButton, PI } from '@spaceone/design-system';

import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useCollectorPageStore } from '@/services/asset-inventory/collector/collector-main/collector-page-store';
import type { CollectorUpdateParameter, Schedule } from '@/services/asset-inventory/collector/model';
import { useCollectorFormStore } from '@/services/asset-inventory/collector/shared/collector-forms/collector-form-store';

interface Props {
    collectorId?: string;
    schedule?: Schedule
}

const props = withDefaults(defineProps<Props>(), {
    collectorId: '',
    schedule: undefined,
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
            collector_id: props.collectorId,
            schedule: {
                ...props.schedule,
                state: state.isScheduleActivated ? 'ENABLED' : 'DISABLED',
            },
        };
        const response = await collectorPageStore.updateCollectorSchedule(params);
        await collectorFormStore.setOriginCollector(response);
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.COLLECTOR.ALT_E_UPDATE_SCHEDULE'));
    }
};
const handleClickSchedule = () => {
    collectorPageStore.setSelectedCollector(props.collectorId);
    collectorPageStore.$patch((_state) => {
        _state.visible.scheduleModal = true;
    });
};

/* Watcher */
watch(() => props.schedule, (schedule) => {
    if (schedule) {
        state.isScheduleActivated = schedule.state === 'ENABLED';
    }
}, { immediate: true });
</script>

<template>
    <div class="info-item">
        <div class="info-label-wrapper">
            <p class="info-label">
                {{ $t('INVENTORY.COLLECTOR.DETAIL.SCHEDULE') }}
            </p>
            <button class="schedule-button"
                    @click.stop="handleClickSchedule"
            >
                <p-i name="ic_edit"
                     height="0.75rem"
                     width="0.75rem"
                     color="inherit"
                     class="icon-schedule"
                />
                {{ $t('INVENTORY.COLLECTOR.MAIN.EDIT_SCHEDULE') }}
            </button>
        </div>
        <div @click.stop="handleChangeToggle">
            <p-toggle-button
                :value="state.isScheduleActivated"
                :class="state.isScheduleActivated ? 'toggle-active' : ''"
                show-state-text
                position="left"
                @change-toggle="handleChangeToggle"
            />
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.info-item {
    @apply flex justify-between;
    margin-top: 2.125rem;
    .info-label-wrapper {
        @apply flex items-center;
        gap: 0.375rem;
        .info-label {
            @apply text-label-sm text-gray-500;
        }
        .schedule-button {
            @apply flex items-center text-label-sm text-blue-700 font-normal;
            gap: 0.125rem;

            &:hover {
                @apply underline;
                background-color: initial;
            }
            .icon-schedule {
                @apply text-blue-700;
                margin-top: 0.15rem;
            }
        }
    }
}
</style>
