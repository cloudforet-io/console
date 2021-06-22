<template>
    <div class="project-escalation-policy">
        <div>
            <span class="label">{{ $t('PROJECT.DETAIL.ALERT.NAME_LABEL') }}</span>
            <span class="value">{{ escalationPolicyName }}</span>
        </div>
        <div>
            <span class="label">{{ $t('PROJECT.DETAIL.ALERT.FINISH_CONDITION_LABEL') }}</span>
            <span class="value">{{ finishCondition }}</span>
        </div>
        <div>
            <span class="label">{{ $t('PROJECT.DETAIL.ALERT.ESCALATION_RULES_LABEL') }}</span>
            <div class="escalation-rules-wrapper">
                <div class="rule-wrapper">
                    <div v-for="(rule, idx) in escalationRules" :key="`rule-${idx}`">
                        <p-badge outline style-type="gray">
                            {{ $t('PROJECT.DETAIL.ALERT.STEP') }} {{ idx + 1 }}
                        </p-badge>
                        <span class="text">
                            {{ $t('PROJECT.DETAIL.ALERT.NOTIFICATION_LEVEL') }}
                            <strong>{{ notificationLevelFormatter(rule.notification_level) }}</strong>
                        </span>
                        <template v-if="rule.escalate_minutes">
                            <span class="vertical-divider"> | </span>
                            <span class="text">
                                {{ $t('PROJECT.DETAIL.ALERT.ESCALATES_AFTER') }}
                                <strong>{{ rule.escalate_minutes }}</strong>
                                {{ $t('PROJECT.DETAIL.ALERT.MINUTE') }}
                            </span>
                        </template>
                        <project-channel-list :project-channels="projectChannels" :notification-level="rule.notification_level" />
                        <p-divider class="divider" />
                    </div>
                </div>
                <div class="repeat-wrapper">
                    <p-i name="ic_repeat" />
                    <span>
                        {{ $t('PROJECT.DETAIL.ALERT.REPEAT_ALL') }}
                        <strong>{{ repeatCount }}</strong>
                        {{ $tc('PROJECT.DETAIL.ALERT.REPEAT_ALL', repeatCount) }}
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import { get, filter } from 'lodash';

import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';

import { PBadge, PDivider, PI } from '@spaceone/design-system';
import ProjectChannelList from '@/views/monitoring/alert-manager/components/ProjectChannelList.vue';

import { SpaceConnector } from '@/lib/space-connector';
import { ApiQueryHelper } from '@/lib/space-connector/helper';
import { FINISH_CONDITION } from '@/views/monitoring/alert-manager/lib/config';


const CHANNEL_SCHEMA = Object.freeze({
    spaceone_user: 'Member',
    slack_webhook: 'Slack',
});

export default {
    name: 'ProjectEscalationPolicy',
    components: {
        ProjectChannelList,
        PDivider,
        PBadge,
        PI,
    },
    props: {
        projectId: {
            type: String,
            default: undefined,
        },
        escalationPolicyId: {
            type: String,
            default: undefined,
        },
    },
    setup(props) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            finishConditions: computed(() => ([
                {
                    name: FINISH_CONDITION.acknowledged,
                    label: vm.$t('PROJECT.DETAIL.ALERT.ACKNOWLEDGED'),
                },
                {
                    name: FINISH_CONDITION.resolved,
                    label: vm.$t('PROJECT.DETAIL.ALERT.RESOLVED'),
                },
            ])),
            escalationPolicyRule: {},
            escalationPolicyName: computed(() => get(state.escalationPolicyRule, 'name')),
            finishCondition: computed(() => {
                const finishCondition = get(state.escalationPolicyRule, 'finish_condition');
                if (finishCondition) return state.finishConditions.find(d => d.name === finishCondition).label;
                return '';
            }),
            escalationRules: computed(() => get(state.escalationPolicyRule, 'rules')),
            repeatCount: computed(() => get(state.escalationPolicyRule, 'repeat_count')),
            projectChannels: [],
        });

        /* util */
        const notificationLevelFormatter = str => str.replace('LV', '');
        const channelFormatter = level => filter(state.projectChannels, { notification_level: level });

        /* api */
        const apiQuery = new ApiQueryHelper();
        const getQuery = () => {
            apiQuery
                .setFilters([{ k: 'project_id', v: props.projectId, o: '=' }]);
            return apiQuery.data;
        };
        const listProjectChannel = async () => {
            try {
                const { results } = await SpaceConnector.client.notification.projectChannel.list({ query: getQuery() });
                state.projectChannels = results;
            } catch (e) {
                state.projectChannels = [];
                console.error(e);
            }
        };
        const getEscalationPolicy = async () => {
            try {
                state.escalationPolicyRule = await SpaceConnector.client.monitoring.escalationPolicy.get({
                    escalation_policy_id: props.escalationPolicyId,
                });
            } catch (e) {
                state.escalationPolicyRule = {};
                console.error(e);
            }
        };

        watch([() => props.escalationPolicyId, () => props.projectId], async (escalationPolicyId, projectId) => {
            if (escalationPolicyId && projectId) {
                await Promise.all([getEscalationPolicy(), listProjectChannel()]);
            }
        }, { immediate: true });

        return {
            ...toRefs(state),
            CHANNEL_SCHEMA,
            notificationLevelFormatter,
            channelFormatter,
        };
    },
};
</script>

<style lang="postcss" scoped>
.project-escalation-policy {
    .label {
        display: inline-block;
        font-weight: bold;
        padding-right: 0.5rem;
        margin-bottom: 1rem;
    }

    .escalation-rules-wrapper {
        @apply bg-gray-100 border border-gray-200;
        box-sizing: border-box;
        border-radius: 0.375rem;
        padding: 1rem;

        .rule-wrapper {
            .p-badge {
                margin-right: 0.5rem;
            }
            .vertical-divider {
                @apply text-gray-300;
                padding: 0 0.5rem;
            }
            .divider {
                margin: 1rem 0;
            }

            @screen mobile {
                .p-badge {
                    display: flex;
                    margin-bottom: 0.5rem;
                }
                .vertical-divider {
                    display: none;
                }
                .text {
                    display: block;
                }
            }
        }
    }
}
</style>
