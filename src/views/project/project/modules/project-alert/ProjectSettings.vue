<template>
    <p-pane-layout class="project-settings">
        <p class="sub-title">
            {{ $t('PROJECT.DETAIL.ALERT.SETTINGS') }}
        </p>
        <section class="section notification-policy-wrapper">
            <div class="section-title">
                {{ $t('PROJECT.DETAIL.ALERT.NOTIFICATION_POLICY') }}
            </div>
            <div class="content-wrapper">
                <p-i :name="notificationUrgency === NOTIFICATION_URGENCY.ALL ? 'ic_bell' : 'ic_alert'" />
                <span class="text">{{ notificationOptionFormatter(notificationUrgency) }}</span>
            </div>
            <p-icon-button class="edit-button" name="ic_edit" @click="onClickUpdateNotificationPolicy" />
        </section>
        <section class="section auto-recovery-wrapper">
            <div class="section-title">
                {{ $t('PROJECT.DETAIL.ALERT.AUTO_RECOVERY') }}
            </div>
            <div class="content-wrapper">
                <p-i v-if="isAutoRecovery" name="ic_automation" />
                <span class="text">{{ isAutoRecovery ? $t('PROJECT.DETAIL.ALERT.AUTO_RESOLVE_ALERTS') : $t('PROJECT.DETAIL.ALERT.MANUAL_OPERATION') }}</span>
            </div>
            <p-icon-button class="edit-button" name="ic_edit" @click="onClickUpdateAutoRecovery" />
        </section>
        <section class="section event-rule-wrapper">
            <div class="section-title">
                {{ $t('PROJECT.DETAIL.ALERT.EVENT_RULE') }}
            </div>
            <div class="content-wrapper">
                <span class="text"><b>{{ eventRuleTotalCount }}</b> {{ $t('PROJECT.DETAIL.ALERT.RULES_ON_THIS_PROJECT') }}</span>
            </div>
            <p-icon-button class="edit-button" name="ic_edit" @click="onClickEditEventRule" />
        </section>
        <section class="section escalation-policy-wrapper">
            <div class="section-title">
                {{ $t('PROJECT.DETAIL.ALERT.ESCALATION_POLICY') }}
            </div>
            <div class="content-wrapper">
                <project-escalation-policy
                    :project-id="projectId"
                    :escalation-policy-id="escalationPolicyId"
                />
            </div>
            <p-icon-button class="edit-button" name="ic_edit" @click="onClickUpdateEscalationPolicy" />
        </section>
        <!--modals-->
        <project-notification-policy-update-modal
            :project-id="projectId"
            :visible.sync="updateNotificationPolicyModalVisible"
            :select-options="notificationUrgencyList"
            :selected-option="notificationUrgency"
            @refresh="getProjectAlertConfig"
        />
        <project-auto-recovery-update-modal
            :project-id="projectId"
            :visible.sync="updateAutoRecoveryModalVisible"
            :selected-option="isAutoRecovery"
            @refresh="getProjectAlertConfig"
        />
        <project-escalation-policy-update-modal
            :project-id="projectId"
            :visible.sync="updateEscalationPolicyModalVisible"
            :escalation-policy-id="escalationPolicyId"
            @refresh="getProjectAlertConfig"
        />
    </p-pane-layout>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import { get } from 'lodash';

import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import ProjectEscalationPolicy from '@/views/project/project/modules/project-alert/ProjectEscalationPolicy.vue';
import ProjectNotificationPolicyUpdateModal
    from '@/views/project/project/modules/project-alert/ProjectNotificationPolicyUpdateModal.vue';
import ProjectAutoRecoveryUpdateModal
    from '@/views/project/project/modules/project-alert/ProjectAutoRecoveryUpdateModal.vue';
import ProjectEscalationPolicyUpdateModal
    from '@/views/project/project/modules/project-alert/ProjectEscalationPolicyUpdateModal.vue';

import { PI, PIconButton, PPaneLayout } from '@spaceone/design-system';

import { SpaceConnector } from '@/lib/space-connector';
import { i18n } from '@/translations';
import router from "@/routes";
import {PROJECT_ROUTE} from "@/routes/project/project-route";


const NOTIFICATION_URGENCY = Object.freeze({
    ALL: 'ALL',
    HIGH_ONLY: 'HIGH_ONLY',
});

export default {
    name: 'ProjectSettings',
    components: {
        ProjectNotificationPolicyUpdateModal,
        ProjectAutoRecoveryUpdateModal,
        ProjectEscalationPolicyUpdateModal,
        ProjectEscalationPolicy,
        PPaneLayout,
        PI,
        PIconButton,
    },
    props: {
        projectId: {
            type: String,
            default: undefined,
        },
    },
    setup(props) {
        const state = reactive({
            notificationUrgencyList: computed(() => ([
                {
                    name: NOTIFICATION_URGENCY.ALL,
                    label: i18n.t('PROJECT.DETAIL.ALERT.ALL_NOTIFICATIONS'),
                },
                {
                    name: NOTIFICATION_URGENCY.HIGH_ONLY,
                    label: i18n.t('PROJECT.DETAIL.ALERT.HIGH_URGENCY_NOTIFICATIONS'),
                    icon: 'ic_alert',
                },
            ])),
            projectAlertConfig: {},
            notificationUrgency: computed(() => get(state.projectAlertConfig, 'options.notification_urgency')),
            isAutoRecovery: computed(() => get(state.projectAlertConfig, 'options.auto_recovery')),
            escalationPolicyId: computed(() => get(state.projectAlertConfig, 'escalation_policy_info.escalation_policy_id')),
            eventRuleTotalCount: 0,
            //
            updateNotificationPolicyModalVisible: false,
            updateAutoRecoveryModalVisible: false,
            updateEscalationPolicyModalVisible: false,
        });

        /* util */
        const notificationOptionFormatter = option => state.notificationUrgencyList.find(d => d.name === option)?.label;

        /* api */
        const getProjectAlertConfig = async () => {
            try {
                state.projectAlertConfig = await SpaceConnector.client.monitoring.projectAlertConfig.get({
                    project_id: props.projectId,
                });
            } catch (e) {
                state.projectAlertConfig = {};
                console.error(e);
            }
        };
        const getEventRuleCount = async () => {
            try {
                const { total_count } = await SpaceConnector.client.monitoring.eventRule.list({
                    project_id: props.projectId,
                });
                state.eventRuleTotalCount = total_count;
            } catch (e) {
                state.eventRuleTotalCount = 0;
                console.error(e);
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
        const onClickEditEventRule = () => {
            router.push({ name: PROJECT_ROUTE.DETAIL.EVENT_RULE._NAME, params: { projectId: props.projectId } });
        };

        watch(() => props.projectId, (projectId) => {
            if (projectId) Promise.all([getProjectAlertConfig(), getEventRuleCount()]);
        }, { immediate: true });

        return {
            ...toRefs(state),
            NOTIFICATION_URGENCY,
            getProjectAlertConfig,
            onClickUpdateNotificationPolicy,
            onClickUpdateAutoRecovery,
            onClickUpdateEscalationPolicy,
            onClickEditEventRule,
            notificationOptionFormatter,
        };
    },
};
</script>

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
        @apply border border-gray-200 col-span-12;
        position: relative;
        border-radius: 0.375rem;
        box-sizing: border-box;
        line-height: 1.8;
        padding: 1.5rem 1rem;

        .section-title {
            line-height: 1.5;
            font-size: 1.125rem;
            padding-bottom: 1rem;
        }
        .content-wrapper {
            font-size: 0.875rem;
        }
        .edit-button {
            position: absolute;
            top: 1.5rem;
            right: 1rem;
        }

        &.notification-policy-wrapper, &.auto-recovery-wrapper, &.event-rule-wrapper {
            @apply col-span-4;
            .content-wrapper {
                @apply bg-gray-100;
                text-align: center;
                border-radius: 0.375rem;
                padding: 0.875rem;
                margin: auto 0;

                .text {
                    vertical-align: middle;
                    margin-left: 0.5rem;
                }
            }
        }
        &.escalation-policy-wrapper {
            @apply grid grid-cols-12;
            .section-title {
                @apply col-span-2;
            }
            .content-wrapper {
                @apply col-span-9;
            }
        }
    }

    @screen tablet {
        .section {
            &.notification-policy-wrapper, &.auto-recovery-wrapper, &.event-rule-wrapper {
                @apply col-span-12;
            }
            &.escalation-policy-wrapper {
                display: block;
            }
        }
    }
}
</style>
