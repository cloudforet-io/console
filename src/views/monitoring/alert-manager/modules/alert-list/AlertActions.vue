<template>
    <div class="alert-actions">
        <p-button v-for="(button, index) in buttonGroup"
                  :key="index"
                  class="only-desktop action-button"
                  :style-type="button.styleType"
                  :outline="true"
                  :disabled="button.disabled"
                  @click="onSelectAction(button.name)"
        >
            {{ button.label }}
        </p-button>
        <p-select-dropdown :items="buttonGroup" class="only-mobile" @select="onSelectAction">
            {{ $t('PLUGIN.COLLECTOR.MAIN.ACTION') }}
        </p-select-dropdown>

        <p-table-check-modal
            theme-color="alert"
            size="md"
            :visible.sync="visibleDeleteModal"
            :header-title="$t('MONITORING.ALERT.ALERT_LIST.DELETE_CHECK_MODAL.TITLE')"
            :fields="TABLE_FIELDS"
            :items="selectedItems"
            :loading="deleteLoading"
            :selectable="false"
            @confirm="onDeleteConfirm"
        >
            <template #col-state-format="{ value }">
                <p-badge :style-type="alertStateBadgeStyleTypeFormatter(value)" :outline="value === ALERT_STATE.ERROR">
                    {{ alertStateI18n[value] }}
                </p-badge>
            </template>
            <template #col-urgency-format="{ value }">
                <p-i :name="value === ALERT_URGENCY.HIGH ? 'ic_alert' : 'ic_state_duplicated'"
                     width="1em" height="1em" class="mr-1"
                     :class="{'ic_state_duplicated': !(value === ALERT_URGENCY.HIGH)}"
                />
                <span>{{ urgencyI18n[value] }}</span>
            </template>
            <template #col-resource-format="{ value }">
                {{ value ? value.name : '' }}
            </template>
            <template #col-project_id-format="{ value }">
                <template v-if="value">
                    {{ projects[value] ? projects[value].label : value }}
                </template>
            </template>
            <template #col-created_at-format="{value, field}">
                <template v-if="field.label === 'Created'">
                    {{ iso8601Formatter(value, timezone) }}
                </template>
                <template v-else>
                    {{ alertDurationFormatter(value) }}
                </template>
            </template>
            <template #col-webhook_id-format="{ value }">
                {{ value ? webhookFormatter(value) : ' ' }}
            </template>
        </p-table-check-modal>

        <alert-acknowledge-modal
            :visible.sync="visibleAcknowledgeModal"
            :alerts="selectedItems"
            @confirm="$emit('refresh')"
        />
        <alert-resolve-modal
            :visible.sync="visibleResolveModal"
            :alerts="selectedItems"
            @confirm="$emit('refresh')"
        />
        <alert-merge-modal
            :visible.sync="visibleMergeModal"
            :items="selectedItems"
            @confirm="$emit('refresh')"
        />
    </div>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from '@vue/composition-api';
import {
    PButton, PSelectDropdown, PTableCheckModal, PI, PBadge,
} from '@spaceone/design-system';

import { i18n } from '@/translations';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { durationFormatter, iso8601Formatter } from '@spaceone/console-core-lib';

import { ALERT_ACTION, ALERT_URGENCY, ALERT_STATE } from '@/views/monitoring/alert-manager/lib/config';
import { alertStateBadgeStyleTypeFormatter } from '@/views/monitoring/alert-manager/lib/helper';
import AlertAcknowledgeModal from '@/views/monitoring/alert-manager/modules/alert-list/AlertAcknowledgeModal.vue';
import AlertResolveModal from '@/views/monitoring/alert-manager/modules/alert-list/AlertResolveModal.vue';
import AlertMergeModal from '@/views/monitoring/alert-manager/modules/alert-list/AlertMergeModal.vue';
import { store } from '@/store';
import dayjs from 'dayjs';

const DATE_TIME_FORMAT = 'YYYY-MM-DDTHH:mm';

const TABLE_FIELDS = [
    { name: 'alert_number', label: 'No' },
    { name: 'title', label: 'Title' },
    { name: 'state', label: 'State' },
    { name: 'urgency', label: 'Urgency' },
    { name: 'status_message', label: 'Status Details' },
    { name: 'resource', label: 'Resource' },
    { name: 'project_id', label: 'Project' },
    { name: 'created_at', label: 'Created' },
    { name: 'created_at', label: 'Duration', sortable: false },
    { name: 'assignee', label: 'Assigned to' },
    { name: 'webhook_id', label: 'Triggered by' },
];

export default {
    name: 'AlertActions',
    components: {
        AlertAcknowledgeModal,
        AlertMergeModal,
        AlertResolveModal,
        PButton,
        PSelectDropdown,
        PTableCheckModal,
        PI,
        PBadge,
    },
    props: {
        selectedItems: {
            type: Array,
            default: () => [],
        },
        webhookList: {
            type: Array,
            default: () => [],
        },
    },
    setup(props, { emit, root }) {
        const state = reactive({
            timezone: computed(() => store.state.user.timezone),
            projects: computed(() => store.state.resource.project.items),
            selectedItemsState: computed(() => {
                const selectedItemsState = props.selectedItems.map(selectedItem => selectedItem.state);
                return selectedItemsState;
            }),
            isSelectedNone: computed(() => props.selectedItems.length === 0),
            isSelectedOne: computed(() => props.selectedItems.length === 1),
            isSelectedError: computed(() => state.selectedItemsState.includes(ALERT_STATE.ERROR)),
            buttonGroup: computed(() => ([
                {
                    name: ALERT_ACTION.acknowledge,
                    styleType: 'secondary-dark',
                    label: i18n.t('MONITORING.ALERT.ALERT_LIST.BUTTON_ACKNOWLEDGE'),
                    disabled: state.isSelectedNone || (state.isSelectedOne && state.selectedItemsState.includes(ALERT_STATE.ACKNOWLEDGED)) || state.isSelectedError,
                },
                {
                    name: ALERT_ACTION.resolve,
                    styleType: 'secondary-dark',
                    label: i18n.t('MONITORING.ALERT.ALERT_LIST.BUTTON_RESOLVE'),
                    disabled: state.isSelectedNone || (state.isSelectedOne && state.selectedItemsState.includes(ALERT_STATE.RESOLVED)) || state.isSelectedError,

                },
                {
                    name: ALERT_ACTION.delete,
                    styleType: 'alert',
                    label: i18n.t('MONITORING.ALERT.ALERT_LIST.BUTTON_DELETE'),
                    disabled: state.isSelectedNone,
                },
            ])),
            visibleDeleteModal: false,
            visibleAcknowledgeModal: false,
            visibleResolveModal: false,
            visibleMergeModal: false,
            deleteLoading: false,
            alertStateI18n: computed(() => ({
                TRIGGERED: i18n.t('MONITORING.ALERT.ALERT_LIST.TRIGGERED'),
                ACKNOWLEDGED: i18n.t('MONITORING.ALERT.ALERT_LIST.ACKNOWLEDGED'),
                RESOLVED: i18n.t('MONITORING.ALERT.ALERT_LIST.RESOLVED'),
                ERROR: i18n.t('MONITORING.ALERT.ALERT_LIST.ERROR'),
            })),
            urgencyI18n: computed(() => ({
                HIGH: i18n.t('MONITORING.ALERT.ALERT_LIST.HIGH'),
                LOW: i18n.t('MONITORING.ALERT.ALERT_LIST.LOW'),
            })),
        });

        const webhookFormatter = webhookId => props.webhookList.find(element => element.webhook_id === webhookId)?.name;

        const alertDurationFormatter = value => durationFormatter(value, dayjs().format(DATE_TIME_FORMAT), state.timezone) || '--';

        const onDeleteConfirm = async () => {
            state.closeLoading = true;
            try {
                await SpaceConnector.client.monitoring.alert.delete({
                    alerts: props.selectedItems.map(d => d.alert_id),
                });
                showSuccessMessage(i18n.t('MONITORING.ALERT.ALERT_LIST.ALT_S_DELETE'), '', root);
                state.visibleDeleteModal = false;
                emit('refresh');
            } catch (e) {
                console.error(e);
                showErrorMessage(i18n.t('MONITORING.ALERT.ALERT_LIST.ALT_E_DELETE'), e, root);
            } finally {
                state.closeLoading = false;
            }
        };

        const onSelectAction = async (type: ALERT_ACTION) => {
            if (type === ALERT_ACTION.acknowledge) {
                state.visibleAcknowledgeModal = true;
            } else if (type === ALERT_ACTION.resolve) {
                state.visibleResolveModal = true;
            } else if (type === ALERT_ACTION.merge) {
                state.visibleMergeModal = true;
            } else if (type === ALERT_ACTION.delete) {
                state.visibleDeleteModal = true;
            }
        };

        return {
            ...toRefs(state),
            onSelectAction,
            onDeleteConfirm,
            alertDurationFormatter,
            webhookFormatter,
            alertStateBadgeStyleTypeFormatter,
            iso8601Formatter,
            TABLE_FIELDS,
            ALERT_URGENCY,
            ALERT_STATE,
        };
    },
};
</script>

<style lang="postcss" scoped>
.alert-actions {
    display: flex;
    width: 100%;
    justify-content: flex-end;
    .action-button {
        @apply bg-white;
        margin-left: 0.5rem;
        line-height: 1;
    }
    .only-desktop {
        @apply inline-block;
    }
    .only-mobile {
        @apply hidden;
    }

    @screen mobile {
        .only-desktop {
            @apply hidden;
        }

        .only-mobile {
            @apply inline-block;
        }
    }
}
</style>
