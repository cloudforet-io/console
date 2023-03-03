<template>
    <div class="alert-actions">
        <p-button v-for="(button, index) in buttonGroup"
                  :key="index"
                  class="only-desktop action-button"
                  :style-type="button.styleType"
                  :disabled="button.disabled"
                  @click="onSelectAction(button.name)"
        >
            {{ button.label }}
        </p-button>
        <p-select-dropdown :items="buttonGroup"
                           class="only-mobile"
                           @select="onSelectAction"
        >
            {{ $t('PLUGIN.COLLECTOR.MAIN.ACTION') }}
        </p-select-dropdown>

        <p-table-check-modal
            theme-color="alert"
            modal-size="md"
            :visible.sync="visibleDeleteModal"
            :header-title="$t('MONITORING.ALERT.ALERT_LIST.DELETE_CHECK_MODAL.TITLE')"
            :fields="TABLE_FIELDS"
            :items="selectedItems"
            :loading="deleteLoading"
            @confirm="handleConfirmDelete"
        >
            <template #col-state-format="{ value }">
                <p-badge :style-type="alertStateBadgeStyleTypeFormatter(value)"
                         :badge-type="value === ALERT_STATE.ERROR ? 'solid-outline' : 'subtle'"
                >
                    {{ alertStateI18n[value] }}
                </p-badge>
            </template>
            <template #col-urgency-format="{ value }">
                <p-i :name="value === ALERT_URGENCY.HIGH ? 'ic_error-filled' : 'ic_warning-filled'"
                     width="1em"
                     height="1em"
                     class="mr-1"
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
                {{ value ? (webhooks(value) ? webhooks(value).label : value) : ' ' }}
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
            @confirm="onConfirmResolve"
        />
    </div>
</template>

<script lang="ts">

import type { SetupContext } from 'vue';
import {
    computed, reactive, toRefs,
} from 'vue';

import {
    PBadge, PButton, PI, PSelectDropdown, PTableCheckModal,
} from '@spaceone/design-system';
import dayjs from 'dayjs';

import { durationFormatter, iso8601Formatter } from '@cloudforet/core-lib';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { store } from '@/store';
import { i18n } from '@/translations';

import type { ProjectReferenceMap } from '@/store/modules/reference/project/type';
import type { WebhookReferenceMap } from '@/store/modules/reference/webhook/type';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import AlertAcknowledgeModal from '@/services/alert-manager/alert/modules/AlertAcknowledgeModal.vue';
import AlertResolveModal from '@/services/alert-manager/alert/modules/AlertResolveModal.vue';
import { useAlertStateI18n } from '@/services/alert-manager/composables/alert-state-i18n';
import { useAlertUrgencyI18n } from '@/services/alert-manager/composables/alert-urgency-i18n';
import type { AlertAction } from '@/services/alert-manager/lib/config';
import { ALERT_ACTION, ALERT_STATE, ALERT_URGENCY } from '@/services/alert-manager/lib/config';
import { alertStateBadgeStyleTypeFormatter } from '@/services/alert-manager/lib/helper';

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
        manageDisabled: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }: SetupContext) {
        const state = reactive({
            timezone: computed(() => store.state.user.timezone),
            projects: computed<ProjectReferenceMap>(() => store.getters['reference/projectItems']),
            webhooks: computed<WebhookReferenceMap>(() => store.getters['reference/webhookItems']),
            selectedItemsState: computed(() => props.selectedItems.map((selectedItem) => selectedItem.state)),
            isSelectedNone: computed(() => props.selectedItems.length === 0),
            isSelectedOne: computed(() => props.selectedItems.length === 1),
            isSelectedError: computed(() => state.selectedItemsState.includes(ALERT_STATE.ERROR)),
            buttonGroup: computed(() => ([
                {
                    name: ALERT_ACTION.acknowledge,
                    styleType: 'secondary',
                    label: i18n.t('MONITORING.ALERT.ALERT_LIST.BUTTON_ACKNOWLEDGE'),
                    disabled: props.manageDisabled || state.isSelectedNone || (state.isSelectedOne && state.selectedItemsState.includes(ALERT_STATE.ACKNOWLEDGED)) || state.isSelectedError,
                },
                {
                    name: ALERT_ACTION.resolve,
                    styleType: 'secondary',
                    label: i18n.t('MONITORING.ALERT.ALERT_LIST.BUTTON_RESOLVE'),
                    disabled: props.manageDisabled || state.isSelectedNone || (state.isSelectedOne && state.selectedItemsState.includes(ALERT_STATE.RESOLVED)) || state.isSelectedError,

                },
                {
                    name: ALERT_ACTION.delete,
                    styleType: 'negative-secondary',
                    label: i18n.t('MONITORING.ALERT.ALERT_LIST.BUTTON_DELETE'),
                    disabled: props.manageDisabled || state.isSelectedNone,
                },
            ])),
            visibleDeleteModal: false,
            visibleAcknowledgeModal: false,
            visibleResolveModal: false,
            deleteLoading: false,
            alertStateI18n: useAlertStateI18n(),
            urgencyI18n: useAlertUrgencyI18n(),
        });

        const alertDurationFormatter = (value) => durationFormatter(value, dayjs().format(DATE_TIME_FORMAT), state.timezone) || '--';

        const handleConfirmDelete = async () => {
            state.closeLoading = true;
            try {
                await SpaceConnector.client.monitoring.alert.delete({
                    alerts: props.selectedItems.map((d) => d.alert_id),
                });
                showSuccessMessage(i18n.t('MONITORING.ALERT.ALERT_LIST.ALT_S_DELETE'), '');
                state.visibleDeleteModal = false;
                emit('refresh');
                await store.dispatch('service/projectDetail/getAlertCounts');
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('MONITORING.ALERT.ALERT_LIST.ALT_E_DELETE'));
            } finally {
                state.closeLoading = false;
            }
        };

        const onSelectAction = async (type: AlertAction) => {
            if (type === ALERT_ACTION.acknowledge) {
                state.visibleAcknowledgeModal = true;
            } else if (type === ALERT_ACTION.resolve) {
                state.visibleResolveModal = true;
            } else if (type === ALERT_ACTION.delete) {
                state.visibleDeleteModal = true;
            }
        };

        const onConfirmResolve = () => {
            emit('refresh');
            store.dispatch('service/projectDetail/getAlertCounts');
        };

        // LOAD REFERENCE STORE
        (async () => {
            await Promise.allSettled([
                store.dispatch('reference/project/load'),
                store.dispatch('reference/webhook/load'),
            ]);
        })();

        return {
            ...toRefs(state),
            onSelectAction,
            handleConfirmDelete,
            alertDurationFormatter,
            alertStateBadgeStyleTypeFormatter,
            iso8601Formatter,
            onConfirmResolve,
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
