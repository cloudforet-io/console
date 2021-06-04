<template>
    <p-pane-layout class="project-settings">
        <h3 class="sub-title">
            {{ $t('PROJECT.DETAIL.ALERT.SETTINGS') }}
        </h3>
        <section class="section notification-policy-wrapper">
            <div class="section-title">
                {{ $t('PROJECT.DETAIL.ALERT.NOTIFICATION_POLICY') }}
            </div>
            <div class="content-wrapper">
                <p-i :name="notificationOption === NOTIFICATION_OPTION.all ? 'ic_bell' : 'ic_alert'" />
                <span class="text">{{ notificationOptionFormatter(notificationOption) }}</span>
            </div>
            <p-icon-button class="edit-button" name="ic_edit" @click="onClickUpdateNotificationPolicy" />
        </section>
        <section class="section escalation-policy-wrapper">
            <div class="section-title">
                {{ $t('PROJECT.DETAIL.ALERT.ESCALATION_POLICY') }}
            </div>
            <div class="content-wrapper">
                <project-escalation-policy :escalation-policy-id="escalationPolicyId" />
            </div>
            <p-icon-button class="edit-button" name="ic_edit" @click="onClickUpdateEscalationPolicy" />
        </section>
        <!--modals-->
        <project-notification-policy-update-modal
            :project-id="projectId"
            :visible.sync="updateNotificationPolicyModalVisible"
            :notification-option="notificationOption"
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
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';

import ProjectEscalationPolicy from '@/views/project/project/modules/project-alert/ProjectEscalationPolicy.vue';
import ProjectNotificationPolicyUpdateModal from '@/views/project/project/modules/project-alert/ProjectNotificationPolicyUpdateModal.vue';
import ProjectEscalationPolicyUpdateModal from '@/views/project/project/modules/project-alert/ProjectEscalationPolicyUpdateModal.vue';

import {
    PI, PPaneLayout, PIconButton,
} from '@spaceone/design-system';

import { SpaceConnector } from '@/lib/space-connector';


enum NOTIFICATION_OPTION {
    all = 'ALL',
    highOnly = 'HIGH_ONLY'
}

export default {
    name: 'ProjectSettings',
    components: {
        ProjectNotificationPolicyUpdateModal,
        ProjectEscalationPolicyUpdateModal,
        ProjectEscalationPolicy,
        PPaneLayout,
        PI,
        PIconButton,
    },
    props: {
        projectId: {
            type: String,
            default: '',
        },
    },
    setup(props) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            notificationOptions: computed(() => ([
                {
                    name: NOTIFICATION_OPTION.all,
                    label: vm.$t('PROJECT.DETAIL.ALERT.ALL_NOTIFICATIONS'),
                },
                {
                    name: NOTIFICATION_OPTION.highOnly,
                    label: vm.$t('PROJECT.DETAIL.ALERT.HIGH_URGENCY_NOTIFICATIONS'),
                },
            ])),
            notificationOption: '' as any,
            escalationPolicyId: undefined,
            //
            updateNotificationPolicyModalVisible: false,
            updateEscalationPolicyModalVisible: false,
        });

        /* util */
        const notificationOptionFormatter = option => state.notificationOptions.find(d => d.name === option)?.label;

        /* api */
        const getProjectAlertConfig = async () => {
            try {
                const res = await SpaceConnector.client.monitoring.projectAlertConfig.get({
                    project_id: props.projectId,
                });
                state.notificationOption = res.notification_options.urgency;
                state.escalationPolicyId = res.escalation_policy_info.escalation_policy_id;
            } catch (e) {
                console.error(e);
            }
        };

        /* event */
        const onClickUpdateNotificationPolicy = () => {
            state.updateNotificationPolicyModalVisible = true;
        };
        const onClickUpdateEscalationPolicy = () => {
            state.updateEscalationPolicyModalVisible = true;
        };

        watch(() => props.projectId, (projectId) => {
            if (projectId) getProjectAlertConfig();
        }, { immediate: true });

        return {
            ...toRefs(state),
            NOTIFICATION_OPTION,
            getProjectAlertConfig,
            onClickUpdateNotificationPolicy,
            onClickUpdateEscalationPolicy,
            notificationOptionFormatter,
        };
    },
};
</script>

<style lang="postcss" scoped>
.project-settings {
    @apply border-none grid gap-4;
    margin: 2.5rem 1rem 0;

    .sub-title {
        font-size: 1.375rem;
        line-height: 145%;
        margin-bottom: 0.5rem;
    }

    .section {
        @apply border border-gray-200 grid grid-cols-12;
        position: relative;
        border-radius: 0.375rem;
        box-sizing: border-box;
        line-height: 1.8;
        padding: 1.5rem 1rem;

        .section-title {
            @apply col-span-2;
            line-height: 1.5;
            font-size: 1.125rem;

            @screen tablet {
                @apply col-span-12;
                padding-bottom: 1rem;
            }
        }

        .content-wrapper {
            @apply col-span-10;
            font-size: 0.875rem;

            @screen tablet {
                @apply col-span-12;
            }
        }

        .edit-button {
            position: absolute;
            top: 1.5rem;
            right: 1rem;
        }

        &.notification-policy-wrapper {
            .content-wrapper {
                margin: auto 0;

                .text {
                    vertical-align: middle;
                    margin-left: 0.5rem;
                }

                @screen tablet {
                    @apply bg-gray-100;
                    text-align: center;
                    border-radius: 0.375rem;
                    padding: 0.875rem;
                }
            }
        }
    }
}
</style>
