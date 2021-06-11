<template>
    <p-toolbox-table
        style-type="light-gray"
        selectable
        sortable
        :fields="fields"
    >
        <template #toolbox-top>
            <div class="panel-top-wrapper">
                <p-panel-top
                    use-total-count
                    :total-count="totalCount"
                    :title="$t('MONITORING.ALERT.ALERT_LIST.ALERT')"
                >
                    <template #extra>
                        <p-button style-type="primary" :outline="true">
                            {{ $t('MONITORING.ALERT.ALERT_LIST.ACKNOWLEDGED') }}
                        </p-button>
                        <p-button style-type="secondary-dark" :outline="true">
                            {{ $t('MONITORING.ALERT.ALERT_LIST.RESOLVE') }}
                        </p-button>
                        <p-button style-type="primary-dark" :outline="true">
                            {{ $t('MONITORING.ALERT.ALERT_LIST.MERGE') }}
                        </p-button>
                        <p-button style-type="alert" :outline="true">
                            {{ $t('MONITORING.ALERT.ALERT_LIST.DELETE') }}
                        </p-button>
                    </template>
                </p-panel-top>
            </div>
        </template>
        <template #toolbox-left>
            <p-icon-text-button
                class="mr-4"
                style-type="primary-dark"
                name="ic_plus_bold"
            >
                {{ $t('MONITORING.ALERT.ALERT_LIST.CREATE') }}
            </p-icon-text-button>
        </template>
        <template #toolbox-bottom>
            <div class="filter-wrapper">
                <div class="filter">
                    <span class="filter-label">{{ $t('MONITORING.ALERT.ALERT_LIST.STATE') }}</span>
                    <p-select-status v-for="(status, idx) in statusList" :key="idx"
                                     v-model="selectedStatus"
                                     :value="status.name"
                    >
                        {{ status.label }}
                    </p-select-status>
                </div>
                <div class="right-part">
                    <div class="filter">
                        <span class="filter-label">{{ $t('MONITORING.ALERT.ALERT_LIST.URGENCY') }}</span>
                        <p-select-status v-for="(urgency, idx) in urgencyList" :key="idx"
                                         v-model="selectedUrgency"
                                         :value="urgency.name"
                                         class="mr-2"
                        >
                            {{ urgency.label }}
                        </p-select-status>
                    </div>
                    <div class="filter">
                        <p-select-button v-for="(state, idx) in assignedStateList" :key="`assigned-${idx}`"
                                         v-model="selectedAssignedState"
                                         :value="state.name"
                                         size="sm"
                                         style-type="gray"
                        >
                            {{ state.label }}
                        </p-select-button>
                    </div>
                </div>
            </div>
        </template>
    </p-toolbox-table>
</template>
<script lang="ts">
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';

import {
    PToolboxTable, PSelectStatus, PSelectButton, PIconTextButton, PButton, PPanelTop,
} from '@spaceone/design-system';

const ALERT_STATUS = Object.freeze({
    OPEN: 'OPEN',
    TRIGGERED: 'TRIGGERED',
    ACKNOWLEDGED: 'ACKNOWLEDGED',
    RESOLVED: 'RESOLVED',
    ALL: 'ALL',
});

const ALERT_URGENCY = Object.freeze({
    ALL: 'ALL',
    HIGH: 'HIGH',
    LOW: 'LOW',
});

const ASSIGNED_STATE = Object.freeze({
    ALL: 'ALL',
    ASSIGNED_TO_ME: 'ASSIGNED_TO_ME',
});

export default {
    name: 'AlertDataTable',
    components: {
        PToolboxTable,
        PSelectStatus,
        PSelectButton,
        PIconTextButton,
        PButton,
        PPanelTop,
    },
    setup(props, { root }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            fields: [
                { name: '', label: 'No' },
                { name: '', label: 'Title' },
                { name: '', label: 'State' },
                { name: '', label: 'Urgency' },
                { name: '', label: 'Status Details' },
                { name: '', label: 'Project' },
                { name: '', label: 'Created' },
                { name: '', label: 'Duration' },
                { name: '', label: 'Assigned to' },
                { name: '', label: 'Triggered by' },
            ],
            totalCount: 0,
            statusList: computed(() => ([
                {
                    name: ALERT_STATUS.OPEN,
                    label: vm.$t('MONITORING.ALERT.ALERT_LIST.OPEN'),
                },
                {
                    name: ALERT_STATUS.TRIGGERED,
                    label: vm.$t('MONITORING.ALERT.ALERT_LIST.TRIGGERED'),
                },
                {
                    name: ALERT_STATUS.ACKNOWLEDGED,
                    label: vm.$t('MONITORING.ALERT.ALERT_LIST.ACKNOWLEDGED'),
                },
                {
                    name: ALERT_STATUS.RESOLVED,
                    label: vm.$t('MONITORING.ALERT.ALERT_LIST.RESOLVED'),
                },
                {
                    name: ALERT_STATUS.ALL,
                    label: vm.$t('MONITORING.ALERT.ALERT_LIST.ALL'),
                },
            ])),
            selectedStatus: ALERT_STATUS.OPEN,
            urgencyList: computed(() => ([
                {
                    name: ALERT_URGENCY.ALL,
                    label: vm.$t('MONITORING.ALERT.ALERT_LIST.ALL'),
                },
                {
                    name: ALERT_URGENCY.HIGH,
                    label: vm.$t('MONITORING.ALERT.ALERT_LIST.HIGH'),
                },
                {
                    name: ALERT_URGENCY.LOW,
                    label: vm.$t('MONITORING.ALERT.ALERT_LIST.LOW'),
                },
            ])),
            selectedUrgency: ALERT_URGENCY.ALL,
            assignedStateList: computed(() => [
                {
                    name: ASSIGNED_STATE.ALL,
                    label: vm.$t('MONITORING.ALERT.ALERT_LIST.ALL'),
                },
                {
                    name: ASSIGNED_STATE.ASSIGNED_TO_ME,
                    label: vm.$t('MONITORING.ALERT.ALERT_LIST.ASSIGNED_TO_ME'),

                },
            ]),
            selectedAssignedState: ASSIGNED_STATE.ALL,
        });

        return {
            ...toRefs(state),
        };
    },
};
</script>
<style lang="postcss" scoped>
.p-toolbox-table::v-deep {
    @apply overflow-hidden col-span-12 rounded-lg;

    .panel-top-wrapper {
        @apply bg-white;
        .p-panel-top {
            margin-top: 1.5rem;
            .extra {
                @apply flex-grow-0 ml-auto;
            }
            .p-button {
                margin-left: 0.5rem;
            }
        }
    }
    .p-dropdown-menu-button {
        @apply bg-white;
    }
}
.filter-wrapper {
    @apply flex justify-between;
    padding: 0.75rem 1rem;
    .right-part {
        @apply flex items-center;
    }
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
            margin-right: 0.375rem;
            &:last-child {
                @apply bg-white mr-0;
            }
        }
        &:last-child {
            margin-left: 1rem;
        }
    }
}

</style>
