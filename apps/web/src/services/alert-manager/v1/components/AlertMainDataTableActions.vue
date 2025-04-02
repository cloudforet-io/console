<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';

import dayjs from 'dayjs';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PBadge, PButton, PI, PSelectDropdown, PTableCheckModal,
} from '@cloudforet/mirinae';
import { durationFormatter, iso8601Formatter } from '@cloudforet/utils';

import type { AlertDeleteParameters } from '@/schema/monitoring/alert/api-verbs/delete';
import { ALERT_STATE, ALERT_URGENCY } from '@/schema/monitoring/alert/constants';
import type { AlertModelV1 } from '@/schema/monitoring/alert/model';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProjectReferenceMap } from '@/store/reference/project-reference-store';
import type { WebhookReferenceMap } from '@/store/reference/webhook-reference-store';
import { useUserStore } from '@/store/user/user-store';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { red } from '@/styles/colors';

import AlertMainAcknowledgeModal from '@/services/alert-manager/v1/components/AlertMainAcknowledgeModal.vue';
import AlertMainResolveModal from '@/services/alert-manager/v1/components/AlertMainResolveModal.vue';
import { useAlertStateI18n } from '@/services/alert-manager/v1/composables/alert-state-i18n';
import { useAlertUrgencyI18n } from '@/services/alert-manager/v1/composables/alert-urgency-i18n';
import { alertStateBadgeStyleTypeFormatter } from '@/services/alert-manager/v1/helpers/alert-badge-helper';
import { useProjectDetailPageStore } from '@/services/project/v1/stores/project-detail-page-store';


const DATE_TIME_FORMAT = 'YYYY-MM-DDTHH:mm';

const TABLE_FIELDS = [
    { name: 'alert_number', label: 'No' },
    { name: 'title', label: 'Title' },
    { name: 'state', label: 'State' },
    { name: 'urgency', label: 'Urgency' },
    { name: 'resource.resource_type', label: 'Resource' },
    { name: 'project_id', label: 'Project' },
    { name: 'created_at', label: 'Created' },
    { name: 'created_at', label: 'Duration', sortable: false },
    { name: 'assignee', label: 'Assigned to' },
    { name: 'webhook_id', label: 'Triggered by' },
];

const ALERT_ACTION = {
    acknowledge: 'acknowledge',
    resolve: 'resolve',
    merge: 'merge',
    delete: 'delete',
} as const;
type AlertAction = typeof ALERT_ACTION[keyof typeof ALERT_ACTION];

const props = withDefaults(defineProps<{
    selectedItems?: AlertModelV1[];
    manageDisabled?: boolean;
}>(), {
    selectedItems: () => [],
    manageDisabled: false,
});
const emit = defineEmits<{(e: 'refresh'): void;
}>();

const allReferenceStore = useAllReferenceStore();
const projectDetailPageStore = useProjectDetailPageStore();
const userStore = useUserStore();
const state = reactive({
    timezone: computed(() => userStore.state.timezone),
    projects: computed<ProjectReferenceMap>(() => allReferenceStore.getters.project),
    webhooks: computed<WebhookReferenceMap>(() => allReferenceStore.getters.webhook),
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

const deleteAlert = async (alertId: string) => {
    try {
        await SpaceConnector.clientV2.monitoring.alert.delete<AlertDeleteParameters>({
            alert_id: alertId,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
        throw new Error(alertId);
    }
};
const handleConfirmDelete = async () => {
    state.deleteLoading = true;
    try {
        const promises = props.selectedItems.map((d) => deleteAlert(d.alert_id));
        const results = await Promise.allSettled(promises);

        const rejected = results.filter((d) => d.status === 'rejected');
        if (rejected.length > 0) {
            throw new Error(`Error occurred during deleting alert for ${rejected.map((d) => (d as any).reason.message).join(', ')}`);
        }

        showSuccessMessage(i18n.t('MONITORING.ALERT.ALERT_LIST.ALT_S_DELETE'), '');
        state.visibleDeleteModal = false;
        emit('refresh');
        await projectDetailPageStore.getAlertCounts();
    } catch (e) {
        showErrorMessage(i18n.t('MONITORING.ALERT.ALERT_LIST.ALT_E_DELETE'), e);
    } finally {
        state.deleteLoading = false;
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
    projectDetailPageStore.getAlertCounts();
};
</script>

<template>
    <div class="alert-actions">
        <p-button v-for="(button, index) in state.buttonGroup"
                  :key="index"
                  class="only-desktop action-button"
                  :style-type="button.styleType"
                  :disabled="button.disabled"
                  @click="onSelectAction(button.name)"
        >
            {{ button.label }}
        </p-button>
        <p-select-dropdown :menu="state.buttonGroup"
                           reset-selection-on-menu-close
                           :placeholder="$t('PLUGIN.COLLECTOR.MAIN.ACTION')"
                           class="only-mobile"
                           @select="onSelectAction"
        />

        <p-table-check-modal
            theme-color="alert"
            modal-size="md"
            :visible.sync="state.visibleDeleteModal"
            :header-title="$t('MONITORING.ALERT.ALERT_LIST.DELETE_CHECK_MODAL.TITLE')"
            :fields="TABLE_FIELDS"
            :items="props.selectedItems"
            :loading="state.deleteLoading"
            @confirm="handleConfirmDelete"
        >
            <template #col-state-format="{ value }">
                <p-badge :style-type="alertStateBadgeStyleTypeFormatter(value)"
                         :badge-type="value === ALERT_STATE.ERROR ? 'solid-outline' : 'subtle'"
                >
                    {{ state.alertStateI18n[value] }}
                </p-badge>
            </template>
            <template #col-urgency-format="{ value }">
                <p-i :name="value === ALERT_URGENCY.HIGH ? 'ic_error-filled' : 'ic_warning-filled'"
                     width="1em"
                     height="1em"
                     class="mr-1"
                     :color="value === ALERT_URGENCY.HIGH ? red[400] : undefined"
                />
                <span>{{ state.urgencyI18n[value] }}</span>
            </template>
            <template #col-resource-format="{ value }">
                {{ value ? value.name : '' }}
            </template>
            <template #col-project_id-format="{ value }">
                <template v-if="value">
                    {{ state.projects[value] ? state.projects[value].label : value }}
                </template>
            </template>
            <template #col-created_at-format="{value, field}">
                <template v-if="field.label === 'Created'">
                    {{ iso8601Formatter(value, state.timezone) }}
                </template>
                <template v-else>
                    {{ alertDurationFormatter(value) }}
                </template>
            </template>
            <template #col-webhook_id-format="{ value }">
                {{ value ? (state.webhooks[value] ? state.webhooks[value].label : value) : ' ' }}
            </template>
        </p-table-check-modal>

        <alert-main-acknowledge-modal
            :visible.sync="state.visibleAcknowledgeModal"
            :alerts="props.selectedItems"
            @confirm="$emit('refresh')"
        />
        <alert-main-resolve-modal
            :visible.sync="state.visibleResolveModal"
            :alerts="props.selectedItems"
            @confirm="onConfirmResolve"
        />
    </div>
</template>

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
            display: none;
        }

        .only-mobile {
            display: inline-block;
        }
    }
}
</style>
