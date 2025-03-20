<script setup lang="ts">
import {
    computed, onActivated, reactive, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';
import type { Location } from 'vue-router';

import { get } from 'lodash';

import { QueryHelper } from '@cloudforet/core-lib/query';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PBadge, PDivider, PI, PLink,
} from '@cloudforet/mirinae';


import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import { ESCALATION_POLICY_FINISH_CONDITION } from '@/schema/monitoring/escalation-policy/constant';
import type { EscalationPolicyModel } from '@/schema/monitoring/escalation-policy/model';
import type { EscalationPolicyFinishCondition, EscalationPolicyRule } from '@/schema/monitoring/escalation-policy/type';
import type { ProjectChannelListParameters } from '@/schema/notification/project-channel/api-verbs/list';
import type { ProjectChannelModel } from '@/schema/notification/project-channel/model';
import { i18n as _i18n } from '@/translations';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import ProjectChannelList from '@/services/alert-manager/v1/components/ProjectChannelList.vue';
import { ALERT_MANAGER_ROUTE_V1 } from '@/services/alert-manager/v1/routes/route-constant';

interface FinishConditionItem {
    name: EscalationPolicyFinishCondition;
    label: TranslateResult;
}

interface Props {
    projectId?: string;
    escalationPolicy?: EscalationPolicyModel;
}
const props = withDefaults(defineProps<Props>(), {
    projectId: undefined,
    escalationPolicy: undefined,
});

const queryHelper = new QueryHelper();
const userWorkspaceStore = useUserWorkspaceStore();
const state = reactive({
    finishConditions: computed<FinishConditionItem[]>(() => ([
        {
            name: ESCALATION_POLICY_FINISH_CONDITION.acknowledged,
            label: _i18n.t('PROJECT.DETAIL.ALERT.ACKNOWLEDGED'),
        },
        {
            name: ESCALATION_POLICY_FINISH_CONDITION.resolved,
            label: _i18n.t('PROJECT.DETAIL.ALERT.RESOLVED'),
        },
    ])),
    escalationPolicyName: computed<string|undefined>(() => get(props.escalationPolicy, 'name')),
    finishCondition: computed<TranslateResult>(() => {
        const finishCondition = get(props.escalationPolicy, 'finish_condition');
        if (finishCondition) return state.finishConditions.find((d) => d.name === finishCondition).label;
        return '';
    }),
    escalationRules: computed<EscalationPolicyRule[]|undefined>(() => get(props.escalationPolicy, 'rules')),
    repeatCount: computed<number|undefined>(() => get(props.escalationPolicy, 'repeat_count')),
    projectChannels: [] as ProjectChannelModel[],
    escalationPolicyLink: computed<Location|undefined>(() => {
        const filters: ConsoleFilter[] = [];
        const escalationPolicyId: string|undefined = get(props.escalationPolicy, 'escalation_policy_id');
        if (!escalationPolicyId) return undefined;
        filters.push({ k: 'escalation_policy_id', o: '=', v: escalationPolicyId });
        return {
            name: ALERT_MANAGER_ROUTE_V1.ESCALATION_POLICY._NAME,
            params: {
                workspaceId: userWorkspaceStore.getters.currentWorkspaceId,
            },
            query: {
                filters: queryHelper.setFilters(filters).rawQueryStrings,
            },
        };
    }),
});

/* util */
const notificationLevelFormatter = (str: string) => str.replace('LV', '');

/* api */
const apiQuery = new ApiQueryHelper();
const getQuery = () => {
    if (props.projectId) {
        apiQuery.setFilters([{ k: 'project_id', v: props.projectId, o: '=' }]);
    } else apiQuery.setFilters([]);
    return apiQuery.data;
};
const listProjectChannel = async () => {
    try {
        const { results } = await SpaceConnector.clientV2.notification.projectChannel.list<ProjectChannelListParameters, ListResponse<ProjectChannelModel>>({ query: getQuery() });
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
</script>

<template>
    <div class="project-alert-settings-escalation-policy">
        <section>
            <span class="label">{{ $t('PROJECT.DETAIL.ALERT.NAME_LABEL') }}</span>
            <p-link class="value"
                    action-icon="internal-link"
                    new-tab
                    :to="state.escalationPolicyLink"
                    highlight
            >
                {{ state.escalationPolicyName }}
            </p-link>
        </section>
        <section>
            <span class="label">{{ $t('PROJECT.DETAIL.ALERT.FINISH_CONDITION_LABEL') }}</span>
            <span>{{ state.finishCondition }}</span>
        </section>
        <section>
            <span class="label">{{ $t('PROJECT.DETAIL.ALERT.ESCALATION_RULES_LABEL') }}</span>
            <div class="escalation-rules-wrapper">
                <div v-if="state.escalationRules"
                     class="rule-wrapper"
                >
                    <div v-for="(rule, idx) in state.escalationRules"
                         :key="`rule-${idx}`"
                    >
                        <p-badge badge-type="solid-outline"
                                 style-type="gray500"
                        >
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
                        <project-channel-list :project-channels="state.projectChannels"
                                              :notification-level="rule.notification_level"
                        />
                        <p-divider class="divider" />
                    </div>
                </div>
                <div class="repeat-wrapper">
                    <p-i name="ic_repeat" />
                    <i18n path="PROJECT.DETAIL.ALERT.REPEAT_ALL"
                          class="ml-2"
                    >
                        <template #count>
                            <strong>{{ state.repeatCount }}</strong>
                        </template>
                    </i18n>
                </div>
            </div>
        </section>
    </div>
</template>

<style lang="postcss" scoped>
.project-alert-settings-escalation-policy {
    section {
        vertical-align: middle;
        margin-bottom: 1rem;
    }

    .label {
        display: inline-block;
        font-weight: bold;
        padding-right: 0.5rem;
    }
    .value {
        line-height: 1.4;
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
