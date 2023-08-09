<script setup lang="ts">
import { PToggleButton, PI } from '@spaceone/design-system';

import { useCollectorPageStore } from '@/services/asset-inventory/collector/collector-main/collector-page-store';

interface Props {
    collectorId?: string;
    isScheduleActivated?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    collectorId: '',
    isScheduleActivated: false,
});

const collectorPageStore = useCollectorPageStore();

const emit = defineEmits<{(e: 'change-toggle', boolean): void}>();

/* Components */
const handleChangeToggle = async (value) => {
    if (Object.keys(value).length > 0) return;
    emit('change-toggle', value);
};
const handleClickSchedule = () => {
    collectorPageStore.setSelectedCollector(props.collectorId);
    collectorPageStore.$patch((_state) => {
        _state.visible.scheduleModal = true;
    });
};
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
                :value="props.isScheduleActivated"
                :class="props.isScheduleActivated ? 'toggle-active' : ''"
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
