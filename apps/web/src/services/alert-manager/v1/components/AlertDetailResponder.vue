<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';


import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PBadge, PCollapsibleList, PPaneLayout, PHeading, PEmpty, PHeadingLayout,
} from '@cloudforet/mirinae';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { AlertModelV1 } from '@/schema/monitoring/alert/model';
import type { EscalationPolicyGetParameters } from '@/schema/monitoring/escalation-policy/api-verbs/get';
import type { EscalationPolicyModel } from '@/schema/monitoring/escalation-policy/model';
import type { EscalationPolicyRule } from '@/schema/monitoring/escalation-policy/type';
import type { ProjectChannelListParameters } from '@/schema/notification/project-channel/api-verbs/list';
import type { ProjectChannelModel } from '@/schema/notification/project-channel/model';
import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';

import ProjectChannelList from '@/services/alert-manager/v1/components/ProjectChannelList.vue';

interface Props {
    id?: string;
    alertData?: Partial<AlertModelV1>;
    manageDisabled?: boolean;
}
interface RuleItem {
    title: TranslateResult;
    data: EscalationPolicyRule;
}

const props = withDefaults(defineProps<Props>(), {
    id: undefined,
    alertData: undefined,
    manageDisabled: false,
});

const state = reactive({
    items: computed(() => [
        { title: i18n.t('MONITORING.ALERT.DETAIL.RESPONDER.LEVEL'), data: 'LV1' },
        { title: i18n.t('MONITORING.ALERT.DETAIL.RESPONDER.LEVEL'), data: 'LV2' },
        { title: i18n.t('MONITORING.ALERT.DETAIL.RESPONDER.LEVEL'), data: 'LV3' },
    ]),
    escalationRuleItems: [] as RuleItem[],
    loading: true,
    projectChannels: [] as ProjectChannelModel[],
    unfoldedIndices: typeof props.alertData?.escalation_step === 'number' ? [props.alertData.escalation_step - 1] : [],
});

const apiQuery = new ApiQueryHelper();
const getQuery = () => {
    apiQuery
        .setFilters([{ k: 'project_id', v: props.alertData?.project_id ?? '', o: '=' }]);
    return apiQuery.data;
};
const listProjectChannel = async () => {
    try {
        const { results } = await SpaceConnector.clientV2.notification.projectChannel.list<ProjectChannelListParameters, ListResponse<ProjectChannelModel>>({ query: getQuery() });
        state.projectChannels = results ?? [];
    } catch (e) {
        ErrorHandler.handleError(e);
        state.projectChannels = [];
    }
};



const listEscalationPolicy = async () => {
    try {
        if (!props.alertData?.escalation_policy_id) throw new Error('escalation_policy_id is required');
        const { rules } = await SpaceConnector.clientV2.monitoring.escalationPolicy.get<EscalationPolicyGetParameters, EscalationPolicyModel>({
            escalation_policy_id: props.alertData.escalation_policy_id,
        });
        state.escalationRuleItems = rules.map((d) => ({
            title: i18n.t('MONITORING.ALERT.DETAIL.RESPONDER.LEVEL') as string,
            data: d,
        }));
    } catch (e) {
        ErrorHandler.handleError(e);
        state.escalationRuleItems = [];
    }
};

// LOAD REFERENCE STORE
(async () => {
    await Promise.allSettled([
        listProjectChannel(), listEscalationPolicy(),
    ]);
})();
</script>

<template>
    <p-pane-layout class="alert-detail-responder">
        <article class="responder-wrapper">
            <p-heading-layout class="pt-8 px-4 pb-4">
                <template #heading>
                    <p-heading heading-type="sub"
                               :title="$t('MONITORING.ALERT.DETAIL.RESPONDER.NOTIFICATION')"
                               class="panel-title"
                    />
                </template>
                <template #extra>
                    <div class="w-full text-right">
                        <p-badge v-if="props.alertData.escalation_ttl === 0"
                                 badge-type="solid-outline"
                                 style-type="indigo500"
                        >
                            {{ $t('MONITORING.ALERT.DETAIL.RESPONDER.COMPLETED') }}
                        </p-badge>
                    </div>
                </template>
            </p-heading-layout>
            <p-collapsible-list v-if="state.escalationRuleItems.length > 0"
                                :items="state.escalationRuleItems"
                                theme="card"
                                multi-unfoldable
                                :unfolded-indices="state.unfoldedIndices"
            >
                <template #title="{data, index}">
                    <p class="responder-info"
                       :class="{'current': data.notification_level === `LV${props.alertData.escalation_step}` }"
                    >
                        <span class="step">[{{ $t('MONITORING.ALERT.ESCALATION_POLICY.FORM.STEP') }} {{ index+1 }}]</span>
                        <span class="level">{{ data.notification_level }}</span>
                        <p-badge v-if="data.notification_level === `LV${props.alertData.escalation_step}`"
                                 badge-type="subtle"
                                 style-type="primary3"
                        >
                            {{ $t('MONITORING.ALERT.DETAIL.RESPONDER.CURRENT') }}
                        </p-badge>
                    </p>
                </template>
                <template #default="{ data }">
                    <p class="data-wrapper">
                        <project-channel-list v-if="state.projectChannels.length > 0"
                                              :project-channels="state.projectChannels"
                                              :notification-level="data.notification_level"
                        />
                        <p-empty v-else>
                            {{ $t('MONITORING.ALERT.DETAIL.RESPONDER.NO_RESPONDER') }}
                        </p-empty>
                    </p>
                </template>
            </p-collapsible-list>
        </article>
    </p-pane-layout>
</template>

<style lang="postcss" scoped>
.alert-detail-responder {
    padding: 0 1rem 2.5rem 1rem;
}
.panel-title {
    margin-left: 0;
    margin-right: 0;
}
.responder-info {
    display: inline-flex;
    font-size: 1rem;
    line-height: 125%;
    &.current {
        @apply text-violet-600;
    }
    .level {
        @apply font-bold mx-2;
    }
}

.data-wrapper {
    @apply bg-gray-100 rounded;
    padding: 0.5rem;
    .project-channel-list {
        @apply bg-transparent;
    }
}

.tag-box {
    @apply text-gray-900;
    margin-top: 0.625rem;
    .p-tag {
        margin-bottom: 0.5rem;
    }
}
</style>
