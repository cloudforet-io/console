<script lang="ts" setup>
import { PCheckbox, PSelectButton, PSelectStatus } from '@spaceone/design-system';
import {
    computed, reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';

import type {
    AlertStateFilter, AlertUrgency, AssignedState,
} from '@/services/alert-manager/lib/config';
import {
    ALERT_STATE_FILTER,
    ALERT_URGENCY,
    ASSIGNED_STATE,
} from '@/services/alert-manager/lib/config';
import type {
    AlertBottomFilters,
} from '@/services/alert-manager/type';

interface Props {
    alertState: AlertStateFilter;
    urgency: AlertUrgency;
    assigned: AssignedState;
}

const props = withDefaults(defineProps<Props>(), {
    alertState: ALERT_STATE_FILTER.OPEN,
    urgency: ALERT_URGENCY.ALL,
    assigned: ASSIGNED_STATE.ALL,
});
const emit = defineEmits<{(e: 'update', value: AlertBottomFilters): void;}>();
const { t } = useI18n();

const state = reactive({
    selectedAlertState: props.alertState,
    selectedUrgency: props.urgency,
    selectedAssigned: props.assigned,
    statusList: computed(() => [
        { name: ALERT_STATE_FILTER.OPEN, label: t('MONITORING.ALERT.ALERT_LIST.OPEN') },
        { name: ALERT_STATE_FILTER.ACKNOWLEDGED, label: t('MONITORING.ALERT.ALERT_LIST.ACKNOWLEDGED') },
        { name: ALERT_STATE_FILTER.TRIGGERED, label: t('MONITORING.ALERT.ALERT_LIST.TRIGGERED') },
        { name: ALERT_STATE_FILTER.RESOLVED, label: t('MONITORING.ALERT.ALERT_LIST.RESOLVED') },
        { name: ALERT_STATE_FILTER.ERROR, label: t('MONITORING.ALERT.ALERT_LIST.ERROR') },
        { name: ALERT_STATE_FILTER.ALL, label: t('MONITORING.ALERT.ALERT_LIST.ALL') },
    ]),
    urgencyList: computed(() => [
        { name: ALERT_URGENCY.ALL, label: t('MONITORING.ALERT.ALERT_LIST.ALL') },
        { name: ALERT_URGENCY.HIGH, label: t('MONITORING.ALERT.ALERT_LIST.HIGH') },
        { name: ALERT_URGENCY.LOW, label: t('MONITORING.ALERT.ALERT_LIST.LOW') },
    ]),
    assignedStateList: computed(() => [
        { name: ASSIGNED_STATE.ALL, label: t('MONITORING.ALERT.ALERT_LIST.ALL') },
        { name: ASSIGNED_STATE.ASSIGNED_TO_ME, label: t('MONITORING.ALERT.ALERT_LIST.ASSIGNED_TO_ME') },
    ]),
});

const onSelectAssignedCheckbox = (value) => {
    state.selectedAssigned = value || ASSIGNED_STATE.ALL;
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
            <span class="filter-label">{{ t('MONITORING.ALERT.ALERT_LIST.STATE') }}</span>
            <p-select-status v-for="(status, idx) in state.statusList"
                             :key="idx"
                             v-model="state.selectedAlertState"
                             :value="status.name"
            >
                {{ status.label }}
            </p-select-status>
        </div>
        <div class="filter filter-urgency">
            <span class="filter-label">{{ t('MONITORING.ALERT.ALERT_LIST.URGENCY') }}</span>
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
            <p-checkbox :value="ASSIGNED_STATE.ASSIGNED_TO_ME"
                        :selected="state.selectedAssigned"
                        class="only-mobile"
                        @change="onSelectAssignedCheckbox"
            >
                <span>{{ t('MONITORING.ALERT.DASHBOARD.ASSIGNED_TO_ME') }}</span>
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
        @apply overflow-x-auto w-full flex-wrap;

        .filter {
            @apply w-full;
            margin: 0.5rem 0;

            &.filter-assigned {
                /* custom design-system component - p-checkbox */
                :deep(.p-checkbox) {
                    .text {
                        @apply inline-block;
                        margin-left: 0.375rem;
                    }
                }
            }
        }

        .only-desktop {
            @apply hidden;
        }

        .only-mobile {
            @apply inline-block;
        }
    }
}
</style>
