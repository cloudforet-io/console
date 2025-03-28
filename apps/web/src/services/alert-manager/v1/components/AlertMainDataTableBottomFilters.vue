<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';

import { PCheckbox, PSelectButton, PSelectStatus } from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import {
    ALERT_STATE_FILTER, ALERT_ASSIGNED_FILTER, ALERT_URGENCY_FILTER,
} from '@/services/alert-manager/v1/constants/alert-constant';
import type {
    AlertAssignedFilter,
    AlertBottomFilters, AlertStateFilter, AlertUrgencyFilter,
} from '@/services/alert-manager/v1/types/alert-type';

const props = withDefaults(defineProps<{
    alertState?: AlertStateFilter;
    urgency?: AlertUrgencyFilter;
    assigned?: AlertAssignedFilter;
}>(), {
    alertState: ALERT_STATE_FILTER.OPEN,
    urgency: ALERT_URGENCY_FILTER.ALL,
    assigned: ALERT_ASSIGNED_FILTER.ALL,
});

const emit = defineEmits<{(e: 'update', value: AlertBottomFilters): void}>();

const state = reactive({
    selectedAlertState: props.alertState,
    selectedUrgency: props.urgency,
    selectedAssigned: props.assigned,
    statusList: computed(() => [
        { name: ALERT_STATE_FILTER.OPEN, label: i18n.t('MONITORING.ALERT.ALERT_LIST.OPEN') },
        { name: ALERT_STATE_FILTER.ACKNOWLEDGED, label: i18n.t('MONITORING.ALERT.ALERT_LIST.ACKNOWLEDGED') },
        { name: ALERT_STATE_FILTER.TRIGGERED, label: i18n.t('MONITORING.ALERT.ALERT_LIST.TRIGGERED') },
        { name: ALERT_STATE_FILTER.RESOLVED, label: i18n.t('MONITORING.ALERT.ALERT_LIST.RESOLVED') },
        { name: ALERT_STATE_FILTER.ERROR, label: i18n.t('MONITORING.ALERT.ALERT_LIST.ERROR') },
        { name: ALERT_STATE_FILTER.ALL, label: i18n.t('MONITORING.ALERT.ALERT_LIST.ALL') },
    ]),
    urgencyList: computed(() => [
        { name: ALERT_URGENCY_FILTER.ALL, label: i18n.t('MONITORING.ALERT.ALERT_LIST.ALL') },
        { name: ALERT_URGENCY_FILTER.HIGH, label: i18n.t('MONITORING.ALERT.ALERT_LIST.HIGH') },
        { name: ALERT_URGENCY_FILTER.LOW, label: i18n.t('MONITORING.ALERT.ALERT_LIST.LOW') },
    ]),
    assignedStateList: computed(() => [
        { name: ALERT_ASSIGNED_FILTER.ALL, label: i18n.t('MONITORING.ALERT.ALERT_LIST.ALL') },
        { name: ALERT_ASSIGNED_FILTER.ASSIGNED_TO_ME, label: i18n.t('MONITORING.ALERT.ALERT_LIST.ASSIGNED_TO_ME') },
    ]),
});

const onSelectAssignedCheckbox = (value) => {
    state.selectedAssigned = value || ALERT_ASSIGNED_FILTER.ALL;
};

watch([() => props.alertState, () => props.urgency, () => props.assigned], () => {
    state.selectedAlertState = props.alertState;
    state.selectedUrgency = props.urgency;
    state.selectedAssigned = props.assigned;
});

watch([() => state.selectedAlertState, () => state.selectedUrgency, () => state.selectedAssigned], () => {
    emit('update', {
        state: state.selectedAlertState,
        urgency: state.selectedUrgency,
        assigned: state.selectedAssigned,
    } as AlertBottomFilters);
});
</script>

<template>
    <div class="alert-table-bottom-filters">
        <div class="filter filter-state">
            <span class="filter-label">{{ $t('MONITORING.ALERT.ALERT_LIST.STATE') }}</span>
            <p-select-status v-for="(status, idx) in state.statusList"
                             :key="idx"
                             v-model="state.selectedAlertState"
                             :value="status.name"
            >
                {{ status.label }}
            </p-select-status>
        </div>
        <div class="filter filter-urgency">
            <span class="filter-label">{{ $t('MONITORING.ALERT.ALERT_LIST.URGENCY') }}</span>
            <p-select-status v-for="(urgencyItem, idx) in state.urgencyList"
                             :key="idx"
                             v-model="state.selectedUrgency"
                             :value="urgencyItem.name"
                             class="mr-2"
            >
                {{ urgencyItem.label }}
            </p-select-status>
        </div>
        <div class="filter filter-assigned">
            <p-select-button v-for="(item, idx) in state.assignedStateList"
                             :key="`assigned-${idx}`"
                             v-model="state.selectedAssigned"
                             :value="item.name"
                             size="sm"
                             style-type="gray"
                             class="only-desktop"
            >
                {{ item.label }}
            </p-select-button>
            <p-checkbox :value="ALERT_ASSIGNED_FILTER.ASSIGNED_TO_ME"
                        :selected="state.selectedAssigned"
                        class="only-mobile"
                        @change="onSelectAssignedCheckbox"
            >
                <span>{{ $t('MONITORING.ALERT.DASHBOARD.ASSIGNED_TO_ME') }}</span>
            </p-checkbox>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.alert-table-bottom-filters {
    @apply flex justify-between;
    padding: 0.75rem 1rem;
    .filter {
        @apply flex items-center;
        .filter-label {
            @apply text-gray-400;
            margin-right: 1rem;
            font-size: 0.875rem;
            line-height: 1.15;
        }
        .p-status {
            margin-right: 1rem;
            font-size: 0.875rem;
            line-height: 1.15;
            &:last-child {
                @apply mr-0;
            }
        }
        .p-select-button {
            @apply bg-white;
            margin-right: 0.375rem;
            &:last-child {
                @apply mr-0;
            }
            &.selected {
                @apply bg-gray-500;
            }
        }
        &.filter-urgency {
            margin-left: auto;
            margin-right: 1rem;
        }
    }

    .only-desktop {
        @apply inline-block;
    }
    .only-mobile {
        @apply hidden;
    }

    @screen mobile {
        width: 100%;
        flex-wrap: wrap;
        overflow-x: auto;
        .filter {
            width: 100%;
            margin: 0.5rem 0;

            &.filter-assigned {
                /* custom design-system component - p-checkbox */
                :deep(.p-checkbox) {
                    .text {
                        display: inline-block;
                        margin-left: 0.375rem;
                    }
                }
            }
        }

        .only-desktop {
            display: none;
        }

        .only-mobile {
            display: inline-block;
        }
    }
}
</style>
