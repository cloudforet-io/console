<template>
    <div class="project-escalation-policy">
        <section>
            <span class="label">{{ $t('PROJECT.DETAIL.ALERT.NAME_LABEL') }}</span>
            <p-anchor class="value"
                      :to="escalationPolicyLink"
                      highlight
            >
                {{ escalationPolicyName }}
            </p-anchor>
        </section>
        <section>
            <span class="label">{{ $t('PROJECT.DETAIL.ALERT.FINISH_CONDITION_LABEL') }}</span>
            <span class="value">{{ finishCondition }}</span>
        </section>
        <section>
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
                                <i18n path="PROJECT.DETAIL.ALERT.ESCALATES_AFTER">
                                    <template #minute>
                                        <strong>{{ rule.escalate_minutes }}</strong>
                                    </template>
                                </i18n>
                            </span>
                        </template>
                        <project-channel-list :project-channels="projectChannels" :notification-level="rule.notification_level" />
                        <p-divider class="divider" />
                    </div>
                </div>
                <div class="repeat-wrapper">
                    <p-i name="ic_repeat" />
                    <i18n path="PROJECT.DETAIL.ALERT.REPEAT_ALL" class="ml-2">
                        <template #count>
                            <strong>{{ repeatCount }}</strong>
                        </template>
                    </i18n>
                </div>
            </div>
        </section>
    </div>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import { get, filter } from 'lodash';

import {
    computed, onActivated, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PBadge, PDivider, PI, PAnchor,
} from '@spaceone/design-system';
import ProjectChannelList from '@/services/monitoring/alert-manager/alert/alert-detail/modules/alert-responder/modules/ProjectChannelList.vue';

import { FINISH_CONDITION } from '@/services/monitoring/alert-manager/lib/config';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import { QueryHelper } from '@spaceone/console-core-lib/query';
import { QueryStoreFilter } from '@spaceone/console-core-lib/query/type';
import { MONITORING_ROUTE } from '@/services/monitoring/routes';
import { i18n } from '@/translations';
import ErrorHandler from '@/common/composables/error/errorHandler';


export default {
    name: 'ProjectEscalationPolicy',
    components: {
        ProjectChannelList,
        PDivider,
        PBadge,
        PI,
        PAnchor,
    },
    props: {
        projectId: {
            type: String,
            default: undefined,
        },
        escalationPolicy: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props) {
        const queryHelper = new QueryHelper();
        const state = reactive({
            finishConditions: computed(() => ([
                {
                    name: FINISH_CONDITION.acknowledged,
                    label: i18n.t('PROJECT.DETAIL.ALERT.ACKNOWLEDGED'),
                },
                {
                    name: FINISH_CONDITION.resolved,
                    label: i18n.t('PROJECT.DETAIL.ALERT.RESOLVED'),
                },
            ])),
            escalationPolicyName: computed(() => get(props.escalationPolicy, 'name')),
            finishCondition: computed(() => {
                const finishCondition = get(props.escalationPolicy, 'finish_condition');
                if (finishCondition) return state.finishConditions.find(d => d.name === finishCondition).label;
                return '';
            }),
            escalationRules: computed(() => get(props.escalationPolicy, 'rules')),
            repeatCount: computed(() => get(props.escalationPolicy, 'repeat_count')),
            projectChannels: [],
            escalationPolicyLink: computed(() => {
                const filters: QueryStoreFilter[] = [];
                filters.push({ k: 'escalation_policy_id', o: '=', v: get(props.escalationPolicy, 'escalation_policy_id') });
                return {
                    name: MONITORING_ROUTE.ALERT_MANAGER.ESCALATION_POLICY._NAME,
                    query: {
                        filters: queryHelper.setFilters(filters).rawQueryStrings,
                    },
                };
            }),
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
                ErrorHandler.handleError(e);
            }
        };

        watch(() => props.projectId, async (projectId) => {
            if (projectId) {
                await listProjectChannel();
            }
        }, { immediate: true });

        onActivated(async () => {
            await listProjectChannel();
        });

        return {
            ...toRefs(state),
            MONITORING_ROUTE,
            notificationLevelFormatter,
            channelFormatter,
        };
    },
};
</script>

<style lang="postcss" scoped>
.project-escalation-policy {
    section {
        vertical-align: middle;
        margin-bottom: 1rem;
    }

    .label {
        display: inline-block;
        font-weight: bold;
        padding-right: 0.5rem;
    }

    .escalation-rules-wrapper {
        @apply bg-gray-100 rounded-lg;
        box-sizing: border-box;
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
