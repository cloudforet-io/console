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
                            <strong>{{ rule.notification_level }}</strong>
                        </span>
                        <template v-if="rule.escalate_minutes">
                            <span class="vertical-divider"> | </span>
                            <span class="text">
                                {{ $t('PROJECT.DETAIL.ALERT.ESCALATES_AFTER') }}
                                <strong>{{ rule.escalate_minutes }}</strong>
                                {{ $t('PROJECT.DETAIL.ALERT.MINUTE') }}
                            </span>
                        </template>
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
import { find } from 'lodash';

import {
    PBadge, PDivider, PI,
} from '@spaceone/design-system';

import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';
import { FINISH_CONDITION } from '@/views/monitoring/alert/type';
import { SpaceConnector } from '@/lib/space-connector';

export default {
    name: 'ProjectEscalationPolicy',
    components: {
        PDivider,
        PBadge,
        PI,
    },
    props: {
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
            escalationPolicyName: '',
            finishCondition: '' as any,
            escalationRules: [],
            repeatCount: 0,
        });

        /* api */
        const getEscalationPolicy = async () => {
            try {
                const res = await SpaceConnector.client.monitoring.escalationPolicy.get({
                    escalation_policy_id: props.escalationPolicyId,
                });
                state.escalationPolicyName = res.name;
                state.escalationRules = res.rules.map(rule => ({
                    notification_level: rule.notification_level.replace('LV', ''),
                    escalate_minutes: rule.escalate_minutes,
                }));
                state.finishCondition = find(state.finishConditions, { name: res.finish_condition })?.label;
                state.repeatCount = res.repeat_count;
            } catch (e) {
                console.error(e);
            }
        };

        watch(() => props.escalationPolicyId, (escalationPolicyId) => {
            if (escalationPolicyId) getEscalationPolicy();
        }, { immediate: true });

        return {
            ...toRefs(state),
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
