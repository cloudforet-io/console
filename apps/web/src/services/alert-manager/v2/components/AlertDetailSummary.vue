<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import {
    PPaneLayout, PSelectDropdown, PI, PBadge, PLink,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import { ALERT_URGENCY, ALERT_STATUS } from '@/schema/alert-manager/alert/constants';
import type { AlertModel } from '@/schema/alert-manager/alert/model';
import type { AlertStatusType, AlertUrgencyType } from '@/schema/alert-manager/alert/type';
import { i18n } from '@/translations';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { EscalationPolicyReferenceMap } from '@/store/reference/escalation-policy-reference-store';

import { usePageEditableStatus } from '@/common/composables/page-editable-status';

import { gray, red } from '@/styles/colors';

import { calculateTime } from '@/services/alert-manager/v2/composables/alert-table-data';
import { SERVICE_DETAIL_TABS } from '@/services/alert-manager/v2/constants/common-constant';
import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/v2/routes/route-constant';
import { useAlertDetailPageStore } from '@/services/alert-manager/v2/stores/alert-detail-page-store';

const alertDetailPageStore = useAlertDetailPageStore();
const alertDetailPageState = alertDetailPageStore.state;
const alertDetailPageGetters = alertDetailPageStore.getters;
const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;
const userWorkspaceStore = useUserWorkspaceStore();

const { hasReadWriteAccess } = usePageEditableStatus();

const storeState = reactive({
    alertInfo: computed<AlertModel>(() => alertDetailPageState.alertInfo),
    timezone: computed<string>(() => alertDetailPageGetters.timezone),
    escalationPolicy: computed<EscalationPolicyReferenceMap>(() => allReferenceGetters.escalationPolicy),
});
const state = reactive({
    alertStatus: 'TRIGGERED',
    alertUrgency: 'HIGH',
    duration: computed<string>(() => (
        storeState.alertInfo.status === ALERT_STATUS.RESOLVED
            ? calculateTime(storeState.alertInfo?.resolved_at, storeState.timezone) || '0m'
            : calculateTime(storeState.alertInfo?.created_at, storeState.timezone) || '0m'
    )),
    alertStateList: computed<SelectDropdownMenuItem[]>(() => ([
        { name: ALERT_STATUS.TRIGGERED, label: i18n.t('ALERT_MANAGER.ALERTS.TRIGGERED') },
        { name: ALERT_STATUS.ACKNOWLEDGED, label: i18n.t('ALERT_MANAGER.ALERTS.ACKNOWLEDGED') },
        { name: ALERT_STATUS.RESOLVED, label: i18n.t('ALERT_MANAGER.ALERTS.RESOLVED') },
    ])),
    alertUrgencyList: computed<SelectDropdownMenuItem[]>(() => ([
        { name: ALERT_URGENCY.HIGH, label: i18n.t('ALERT_MANAGER.ALERTS.HIGH') },
        { name: ALERT_URGENCY.LOW, label: i18n.t('ALERT_MANAGER.ALERTS.LOW') },
    ])),
});

const getEscalationInfo = (id: string) => storeState.escalationPolicy[id]?.label || '';

const handleChangeAlertState = async (alertState: AlertStatusType) => {
    await alertDetailPageStore.updateAlertDetail({
        alert_id: storeState.alertInfo.alert_id,
        status: alertState,
    });
};
const handleChangeAlertUrgency = async (alertUrgency: AlertUrgencyType) => {
    await alertDetailPageStore.updateAlertDetail({
        alert_id: storeState.alertInfo.alert_id,
        urgency: alertUrgency,
    });
};

watch(() => alertDetailPageState.alertInfo, (alertInfo) => {
    if (!alertInfo) return;
    state.alertStatus = alertInfo?.status;
    state.alertUrgency = alertInfo?.urgency;
}, { immediate: true });
</script>

<template>
    <p-pane-layout class="alert-detail-summary flex flex-wrap gap-4 w-full">
        <div class="content-wrapper">
            <span class="title">{{ $t('ALERT_MANAGER.ALERTS.LABEL_STATUS') }}</span>
            <p-badge v-if="state.alertStatus === ALERT_STATUS.IGNORED"
                     style-type="alert"
                     badge-type="solid-outline"
                     class="mt-1.5"
            >
                {{ $t('ALERT_MANAGER.ALERTS.IGNORED') }}
            </p-badge>
            <p-select-dropdown v-else
                               :menu="state.alertStateList"
                               :selected.sync="state.alertStatus"
                               class="state-dropdown"
                               :disabled="!hasReadWriteAccess"
                               :class="{'triggered': state.alertStatus === ALERT_STATUS.TRIGGERED}"
                               @select="handleChangeAlertState"
            >
                <template #dropdown-button>
                    <span class="button-text">{{ state.alertStateList.find(d => d.name === state.alertStatus)?.label }}</span>
                </template>
            </p-select-dropdown>
        </div>
        <div class="content-wrapper">
            <span class="title">{{ $t('ALERT_MANAGER.ALERTS.LABEL_URGENCY') }}</span>
            <p-select-dropdown :menu="state.alertUrgencyList"
                               :selected.sync="state.alertUrgency"
                               :disabled="!hasReadWriteAccess || (state.alertStatus === ALERT_STATUS.IGNORED)"
                               class="state-dropdown"
                               @select="handleChangeAlertUrgency"
            >
                <template #dropdown-button>
                    <span class="selected-urgency">
                        <p-i v-if="state.alertUrgency === ALERT_URGENCY.HIGH"
                             name="ic_error-filled"
                             width="1em"
                             height="1em"
                             class="mr-2"
                             :color="red[400]"
                        />
                        <p-i v-if="state.alertUrgency === ALERT_URGENCY.LOW"
                             name="ic_warning-filled"
                             width="1em"
                             height="1em"
                             class="mr-2"
                             :color="gray[200]"
                        />
                        <span>{{ state.alertUrgencyList.find(d => d.name === state.alertUrgency)?.label }}</span>
                    </span>
                </template>
            </p-select-dropdown>
        </div>
        <div class="content-wrapper">
            <span class="title">{{ $t('ALERT_MANAGER.ESCALATION_POLICY.TITLE') }}</span>
            <p-link :text="getEscalationInfo(storeState.alertInfo.escalation_policy_id)"
                    action-icon="internal-link"
                    new-tab
                    :to="{
                        name: ALERT_MANAGER_ROUTE.SERVICE.DETAIL._NAME,
                        params: {
                            serviceId: storeState.alertInfo.service_id,
                            workspaceId: userWorkspaceStore.getters.currentWorkspaceId,
                        },
                        query: {
                            tab: SERVICE_DETAIL_TABS.SETTINGS,
                            escalationPolicyId: storeState.alertInfo.escalation_policy_id,
                        },
                    }"
                    highlight
                    size="md"
                    class="leading-8"
            />
        </div>
        <div class="content-wrapper">
            <span class="title">{{ $t('ALERT_MANAGER.ALERTS.DURATION') }}</span>
            <span class="text-label-lg font-bold leading-8">{{ state.duration }}</span>
        </div>
    </p-pane-layout>
</template>

<style lang="postcss" scoped>
.alert-detail-summary {
    padding: 1.5rem 1rem;
    .content-wrapper {
        @apply flex flex-col flex-1;
        min-width: 150px;
        .title {
            @apply text-label-sm text-gray-500 font-bold mb-1;
        }
        .state-dropdown {
            width: 9rem;
            .selected-urgency {
                @apply flex items-center;
            }
        }

        /* custom design-system component - p-select-dropdown */
        :deep(.p-select-dropdown) {
            &.triggered {
                .dropdown-button {
                    @apply bg-alert text-white border-none;
                }
                .button-text, .arrow-button {
                    @apply text-white;
                }
            }
        }
    }

    @screen tablet {
        flex-wrap: wrap;
        gap: 1.5rem;
        max-width: 100%;
    }

    @screen mobile {
        flex-direction: column;
        gap: 1.5rem;
        .content-wrapper {
            width: 100%;
        }
    }
}

</style>
