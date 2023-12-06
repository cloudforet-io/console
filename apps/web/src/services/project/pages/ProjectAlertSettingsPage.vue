<script lang="ts" setup>
import {
    computed, onActivated, reactive, watch,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    PI, PIconButton, PPaneLayout, PButton,
} from '@spaceone/design-system';
import { get } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { red } from '@/styles/colors';

import EscalationPolicyFormModal from '@/services/alert-manager/components/EscalationPolicyFormModal.vue';
import { ACTION, SCOPE } from '@/services/alert-manager/constants/alert-constant';
import ProjectAlertSettingsAutoRecoveryUpdateModal
    from '@/services/project/components/ProjectAlertSettingsAutoRecoveryUpdateModal.vue';
import ProjectAlertSettingsEscalationPolicy
    from '@/services/project/components/ProjectAlertSettingsEscalationPolicy.vue';
import ProjectAlertSettingsEscalationPolicyChangeModal
    from '@/services/project/components/ProjectAlertSettingsEscalationPolicyChangeModal.vue';
import ProjectAlertSettingsNotificationPolicyUpdateModal
    from '@/services/project/components/ProjectAlertSettingsNotificationPolicyUpdateModal.vue';
import { PROJECT_ROUTE } from '@/services/project/routes/route-constant';


const NOTIFICATION_URGENCY = Object.freeze({
    ALL: 'ALL',
    HIGH_ONLY: 'HIGH_ONLY',
});
const RECOVERY_MODE = Object.freeze({
    MANUAL: 'MANUAL',
    AUTO: 'AUTO',
});

interface Props {
    id?: string;
}
const props = defineProps<Props>();
const router = useRouter();

const state = reactive({
    notificationUrgencyList: computed(() => ([
        {
            name: NOTIFICATION_URGENCY.ALL,
            label: i18n.t('PROJECT.DETAIL.ALERT.ALL_NOTIFICATIONS'),
        },
        {
            name: NOTIFICATION_URGENCY.HIGH_ONLY,
            label: i18n.t('PROJECT.DETAIL.ALERT.HIGH_URGENCY_NOTIFICATIONS'),
            icon: 'ic_error-filled',
        },
    ])),
    projectAlertConfig: {},
    escalationPolicy: {},
    notificationUrgency: computed(() => get(state.projectAlertConfig, 'options.notification_urgency')),
    recoveryMode: computed(() => get(state.projectAlertConfig, 'options.recovery_mode')),
    escalationPolicyId: computed(() => get(state.projectAlertConfig, 'escalation_policy_info.escalation_policy_id')),
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
        state.projectAlertConfig = await SpaceConnector.client.monitoring.projectAlertConfig.get({
            project_id: props.id,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
        state.projectAlertConfig = {};
    }
};
const getEventRuleCount = async () => {
    try {
        const { total_count } = await SpaceConnector.client.monitoring.eventRule.list({
            project_id: props.id,
        });
        state.eventRuleTotalCount = total_count;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.eventRuleTotalCount = 0;
    }
};
const getEscalationPolicy = async () => {
    try {
        state.escalationPolicy = await SpaceConnector.client.monitoring.escalationPolicy.get({
            escalation_policy_id: state.escalationPolicyId,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
        state.escalationPolicy = {};
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
    router.push({ name: PROJECT_ROUTE.DETAIL.EVENT_RULE._NAME, params: { projectId: props.id ?? '' } });
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

onActivated(() => {
    init();
});
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
                     :name="state.notificationUrgency === NOTIFICATION_URGENCY.ALL ? 'ic_gnb_bell' : 'ic_error-filled'"
                     :color="state.notificationUrgency === NOTIFICATION_URGENCY.ALL ? undefined : red[400]"
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
                <p-i v-if="state.recoveryMode === RECOVERY_MODE.AUTO"
                     name="ic_service_automation"
                />
                <span class="text">{{ (state.recoveryMode === RECOVERY_MODE.AUTO) ? $t('PROJECT.DETAIL.ALERT.AUTO_RESOLVE_ALERTS') : $t('PROJECT.DETAIL.ALERT.MANUAL_OPERATION') }}</span>
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
                              :disabled="state.escalationPolicy.scope === SCOPE.DOMAIN"
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
                @apply col-span-12;
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
