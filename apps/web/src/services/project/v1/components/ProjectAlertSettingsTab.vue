<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import { get } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PI, PIconButton, PPaneLayout, PButton,
} from '@cloudforet/mirinae';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import { RESOURCE_GROUP } from '@/api-clients/_common/schema/constant';
import type { EscalationPolicyGetParameters } from '@/schema/monitoring/escalation-policy/api-verbs/get';
import type { EscalationPolicyModel } from '@/schema/monitoring/escalation-policy/model';
import type { EventRuleListParameters } from '@/schema/monitoring/event-rule/api-verbs/list';
import type { EventRuleModel } from '@/schema/monitoring/event-rule/model';
import type { ProjectAlertConfigGetParameters } from '@/schema/monitoring/project-alert-config/api-verbs/get';
import type { ProjectAlertConfigModel } from '@/schema/monitoring/project-alert-config/model';
import type {
    ProjectAlertConfigNotiUrgency,
    ProjectAlertConfigRecoveryMode,
} from '@/schema/monitoring/project-alert-config/type';
import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { red } from '@/styles/colors';

import EscalationPolicyFormModal from '@/services/alert-manager/v1/components/EscalationPolicyFormModal.vue';
import { ACTION } from '@/services/alert-manager/v1/constants/alert-constant';
import ProjectAlertSettingsAutoRecoveryUpdateModal
    from '@/services/project/v1/components/ProjectAlertSettingsAutoRecoveryUpdateModal.vue';
import ProjectAlertSettingsEscalationPolicy
    from '@/services/project/v1/components/ProjectAlertSettingsEscalationPolicy.vue';
import ProjectAlertSettingsEscalationPolicyChangeModal
    from '@/services/project/v1/components/ProjectAlertSettingsEscalationPolicyChangeModal.vue';
import ProjectAlertSettingsNotificationPolicyUpdateModal
    from '@/services/project/v1/components/ProjectAlertSettingsNotificationPolicyUpdateModal.vue';
import { PROJECT_ROUTE_V1 } from '@/services/project/v1/routes/route-constant';

interface NotificationUrgencyOption {
    name: ProjectAlertConfigNotiUrgency;
    label: string;
    icon?: string;
}

interface Props {
    id?: string;
}
const props = defineProps<Props>();
const router = useRouter();

const state = reactive({
    notificationUrgencyList: computed<NotificationUrgencyOption[]>(() => ([
        {
            name: 'ALL',
            label: i18n.t('PROJECT.DETAIL.ALERT.ALL_NOTIFICATIONS') as string,
        },
        {
            name: 'HIGH_ONLY',
            label: i18n.t('PROJECT.DETAIL.ALERT.HIGH_URGENCY_NOTIFICATIONS') as string,
            icon: 'ic_error-filled',
        },
    ])),
    projectAlertConfig: undefined as ProjectAlertConfigModel|undefined,
    escalationPolicy: undefined as EscalationPolicyModel|undefined,
    notificationUrgency: computed<ProjectAlertConfigNotiUrgency|undefined>(() => get(state.projectAlertConfig, 'options.notification_urgency')),
    recoveryMode: computed<ProjectAlertConfigRecoveryMode|undefined>(() => get(state.projectAlertConfig, 'options.recovery_mode')),
    escalationPolicyId: computed<string|undefined>(() => get(state.projectAlertConfig, 'escalation_policy_info.escalation_policy_id')),
    eventRuleTotalCount: 0,
    //
    updateNotificationPolicyModalVisible: false,
    updateAutoRecoveryModalVisible: false,
    updateEscalationPolicyModalVisible: false,
    changeEscalationPolicyModalVisible: false,
});

/* util */
const notificationOptionFormatter = (option) => state.notificationUrgencyList.find((d) => d.name === option)?.label;

/* api */
const getProjectAlertConfig = async () => {
    try {
        if (!props.id) throw new Error('Project ID is required');
        state.projectAlertConfig = await SpaceConnector.clientV2.monitoring.projectAlertConfig.get<ProjectAlertConfigGetParameters, ProjectAlertConfigModel>({
            project_id: props.id,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
        state.projectAlertConfig = undefined;
    }
};
const getEventRuleCount = async () => {
    try {
        const { total_count } = await SpaceConnector.clientV2.monitoring.eventRule.list<EventRuleListParameters, ListResponse<EventRuleModel>>({
            project_id: props.id,
        });
        state.eventRuleTotalCount = total_count ?? 0;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.eventRuleTotalCount = 0;
    }
};
const getEscalationPolicy = async () => {
    try {
        state.escalationPolicy = await SpaceConnector.clientV2.monitoring.escalationPolicy.get<EscalationPolicyGetParameters, EscalationPolicyModel>({
            escalation_policy_id: state.escalationPolicyId,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
        state.escalationPolicy = undefined;
    }
};

/* event */
const onClickUpdateNotificationPolicy = () => {
    state.updateNotificationPolicyModalVisible = true;
};
const onClickUpdateAutoRecovery = () => {
    state.updateAutoRecoveryModalVisible = true;
};
const onClickUpdateEscalationPolicy = () => {
    state.updateEscalationPolicyModalVisible = true;
};
const onClickChangeEscalationPolicy = () => {
    state.changeEscalationPolicyModalVisible = true;
};
const onClickEditEventRule = () => {
    router.push({
        name: PROJECT_ROUTE_V1.DETAIL.EVENT_RULE._NAME,
        params: { projectId: props.id ?? '' },
    }).catch(() => {});
};

watch(() => state.escalationPolicyId, async () => {
    await getEscalationPolicy();
});

const init = async () => {
    if (props.id) {
        await Promise.allSettled([
            getProjectAlertConfig(),
            getEventRuleCount(),
        ]);
    }
};

(() => {
    init();
})();
</script>

<template>
    <p-pane-layout class="project-settings">
        <p class="sub-title">
            {{ $t('PROJECT.DETAIL.ALERT.SETTINGS') }}
        </p>
        <section class="section notification-policy-wrapper">
            <div class="section-wrapper">
                <span class="text">{{ $t('PROJECT.DETAIL.ALERT.NOTIFICATION_POLICY') }}</span>
                <p-icon-button name="ic_edit"
                               @click="onClickUpdateNotificationPolicy"
                />
            </div>
            <div class="content-wrapper">
                <p-i v-if="state.notificationUrgency"
                     :name="state.notificationUrgency === 'ALL' ? 'ic_gnb_bell' : 'ic_error-filled'"
                     :color="state.notificationUrgency === 'ALL' ? undefined : red[400]"
                />
                <span class="text">{{ notificationOptionFormatter(state.notificationUrgency) }}</span>
            </div>
        </section>
        <section class="section auto-recovery-wrapper">
            <div class="section-wrapper">
                <span class="text">{{ $t('PROJECT.DETAIL.ALERT.AUTO_RECOVERY') }}</span>
                <p-icon-button name="ic_edit"
                               @click="onClickUpdateAutoRecovery"
                />
            </div>
            <div class="content-wrapper">
                <p-i v-if="state.recoveryMode === 'AUTO'"
                     name="ic_service_automation"
                />
                <span class="text">{{ (state.recoveryMode === 'AUTO') ? $t('PROJECT.DETAIL.ALERT.AUTO_RESOLVE_ALERTS') : $t('PROJECT.DETAIL.ALERT.MANUAL_OPERATION') }}</span>
            </div>
        </section>
        <section class="section event-rule-wrapper">
            <div class="section-wrapper">
                <span class="text">{{ $t('PROJECT.DETAIL.ALERT.EVENT_RULE') }}</span>
                <p-icon-button name="ic_edit"
                               @click="onClickEditEventRule"
                />
            </div>
            <div class="content-wrapper">
                <span class="text"><b>{{ state.eventRuleTotalCount }}</b> {{ $t('PROJECT.DETAIL.ALERT.RULES_ON_THIS_PROJECT') }}</span>
            </div>
        </section>
        <section class="section escalation-policy-wrapper">
            <div class="section-wrapper">
                <span class="text">{{ $t('PROJECT.DETAIL.ALERT.ESCALATION_POLICY') }}</span>
                <div class="text-button-group">
                    <p-button class="text-button"
                              style-type="tertiary"
                              size="sm"
                              :disabled="state.escalationPolicy?.resource_group === RESOURCE_GROUP.WORKSPACE"
                              @click="onClickUpdateEscalationPolicy"
                    >
                        {{ $t('PROJECT.DETAIL.ALERT.UPDATE') }}
                    </p-button>
                    <p-button class="text-button"
                              style-type="tertiary"
                              size="sm"
                              @click="onClickChangeEscalationPolicy"
                    >
                        {{ $t('PROJECT.DETAIL.ALERT.CHANGE') }}
                    </p-button>
                </div>
            </div>
            <div class="content-wrapper">
                <project-alert-settings-escalation-policy
                    :project-id="props.id"
                    :escalation-policy="state.escalationPolicy"
                />
            </div>
        </section>
        <!--modals-->
        <project-alert-settings-notification-policy-update-modal
            :project-id="props.id"
            :visible.sync="state.updateNotificationPolicyModalVisible"
            :select-options="state.notificationUrgencyList"
            :selected-option="state.notificationUrgency"
            @confirm="getProjectAlertConfig"
        />
        <project-alert-settings-auto-recovery-update-modal
            :project-id="props.id"
            :visible.sync="state.updateAutoRecoveryModalVisible"
            :selected-option="state.recoveryMode"
            @confirm="getProjectAlertConfig"
        />
        <project-alert-settings-escalation-policy-change-modal
            :project-id="props.id"
            :visible.sync="state.changeEscalationPolicyModalVisible"
            :escalation-policy-id="state.escalationPolicyId"
            @confirm="getProjectAlertConfig"
        />
        <escalation-policy-form-modal
            :visible.sync="state.updateEscalationPolicyModalVisible"
            :mode="ACTION.update"
            :escalation-policy="state.escalationPolicy"
            @confirm="getEscalationPolicy"
        />
    </p-pane-layout>
</template>

<style lang="postcss" scoped>
.project-settings {
    @apply border-none grid grid-cols-12 gap-4;
    margin: 2rem 1rem 0;

    .sub-title {
        @apply col-span-12;
        font-size: 1.375rem;
        line-height: 145%;
        margin-bottom: 0.5rem;
    }

    .section {
        @apply border border-gray-200 col-span-12 rounded-lg;
        position: relative;
        box-sizing: border-box;
        line-height: 1.8;
        padding: 1.5rem 1rem;

        .section-wrapper {
            display: flex;
            align-items: center;
            line-height: 1.5;
            font-size: 1.125rem;
            padding-bottom: 1rem;
            .text {
                flex-grow: 1;
            }
        }
        .content-wrapper {
            font-size: 0.875rem;
        }
        .text-button-group {
            display: flex;
            gap: 0.5rem;
            .text-button {
                padding: 0.5rem;
            }
        }

        &.notification-policy-wrapper, &.auto-recovery-wrapper, &.event-rule-wrapper {
            @apply col-span-4;
            .content-wrapper {
                @apply bg-gray-100 rounded-lg;
                text-align: center;
                padding: 0.875rem;
                margin: auto 0;

                .text {
                    vertical-align: middle;
                    margin-left: 0.5rem;
                }
            }
        }
        &.escalation-policy-wrapper {
            display: block;
        }
    }

    @screen tablet {
        .section {
            &.notification-policy-wrapper, &.auto-recovery-wrapper, &.event-rule-wrapper {
                grid-column: span 12 / span 12;
            }
        }
    }

    @screen mobile {
        .section-wrapper {
            padding-right: 8.4375rem;
        }
    }
}
</style>
