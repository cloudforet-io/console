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
                        <div v-if="channelFormatter(rule.notification_level).length > 0" class="channel-box">
                            <div v-for="(channel, cIdx) in channelFormatter(rule.notification_level)" :key="`channel-${cIdx}`"
                                 :class="{ disabled: channel.state === CHANNEL_STATE.DISABLED }"
                            >
                                <p class="title">
                                    [{{ CHANNEL_SCHEMA[channel.schema] }}] {{ channel.name }}
                                    <p-i name="ic_bell" color="inherit" class="ml-1"
                                         width="1rem" height="1rem"
                                    />
                                    {{ channel.state === CHANNEL_STATE.ENABLED ? 'ON' : 'OFF' }}
                                </p>
                                <div v-if="channel.schema === 'spaceone_user'" class="info">
                                    <p v-for="(user, uIdx) in channel.data.users" :key="`user-${uIdx}`">
                                        {{ user }}
                                    </p>
                                </div>
                            </div>
                        </div>
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

import { FINISH_CONDITION } from '@/views/monitoring/alert/type';
import { SpaceConnector } from '@/lib/space-connector';
import { ApiQueryHelper } from '@/lib/space-connector/helper';


const CHANNEL_SCHEMA = Object.freeze({
    spaceone_user: 'Member',
    slack_webhook: 'Slack',
});
const CHANNEL_STATE = Object.freeze({
    ENABLED: 'ENABLED',
    DISABLED: 'DISABLED',
});

export default {
    name: 'ProjectEscalationPolicy',
    components: {
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
            //
            projectChannels: [],
            projectChannelForLevel: {},
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
            CHANNEL_STATE,
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
            .channel-box {
                @apply bg-white rounded;
                font-size: 0.75rem;
                line-height: 1.5;
                padding: 0.5rem;
                margin-top: 0.5rem;

                .title {
                    @apply text-blue-900;
                    display: flex;
                    align-items: center;
                    font-weight: bold;
                }
                .info {
                    @apply text-gray-700;
                }

                .disabled {
                    .title {
                        @apply text-gray-300;
                    }
                    .info {
                        @apply text-gray-300;
                    }
                }
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
