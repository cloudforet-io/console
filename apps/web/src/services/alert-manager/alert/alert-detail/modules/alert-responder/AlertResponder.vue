<script lang="ts" setup>
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PBadge, PCollapsibleList, PPaneLayout, PHeading, PFilterableDropdown,
} from '@spaceone/design-system';
import type { FilterableDropdownMenuItem } from '@spaceone/design-system/types/inputs/dropdown/filterable-dropdown/type';
import { differenceBy } from 'lodash';
import {
    computed, reactive,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import type { UserReferenceMap } from '@/store/modules/reference/user/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

import ProjectChannelList from '@/services/alert-manager/alert/alert-detail/modules/alert-responder/modules/ProjectChannelList.vue';
import type {
    AlertDataModel,
} from '@/services/alert-manager/type';


interface Props {
    id?: string;
    alertData: AlertDataModel;
    manageDisabled: boolean;
}
interface Rule {
    title: string;
    data: Record<string, string | number>;
}

const props = withDefaults(defineProps<Props>(), {
    id: '',
    alertData: () => ({}) as AlertDataModel,
    manageDisabled: false,
});
const { t } = useI18n();
const store = useStore();

const state = reactive({
    items: computed(() => [
        { title: t('MONITORING.ALERT.DETAIL.RESPONDER.LEVEL'), data: 'LV1' },
        { title: t('MONITORING.ALERT.DETAIL.RESPONDER.LEVEL'), data: 'LV2' },
        { title: t('MONITORING.ALERT.DETAIL.RESPONDER.LEVEL'), data: 'LV3' },
    ]),
    escalationRuleItems: [] as Rule[],
    loading: true,
    projectChannels: [],
});

const responderState = reactive({
    loading: true,
    allMember: [] as any[],
    allMemberItems: computed(() => responderState.allMember.map((d) => {
        const userName = responderState.users[d.user_id]?.name;
        return {
            name: d.user_id,
            label: userName ? `${d.user_id} (${userName})` : d.user_id,
            type: 'item',
        };
    })),
    prevSelectedMemberItems: props.alertData.responders.map((d) => ({ name: d.resource_id, label: d.resource_id })) as FilterableDropdownMenuItem[],
    selectedMemberItems: props.alertData.responders.map((d) => ({ name: d.resource_id, label: d.resource_id })) as FilterableDropdownMenuItem[],
    selectedResourceIds: computed<string[]>(() => responderState.selectedMemberItems.map((d) => d.name)),
    users: computed<UserReferenceMap>(() => store.getters['reference/userItems']),
});

const apiQuery = new ApiQueryHelper();
const getQuery = () => {
    apiQuery
        .setFilters([{ k: 'project_id', v: props.alertData.project_id, o: '=' }]);
    return apiQuery.data;
};
const listProjectChannel = async () => {
    try {
        const { results } = await SpaceConnector.client.notification.projectChannel.list({ query: getQuery() });
        state.projectChannels = results;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.projectChannels = [];
    }
};

const listMember = async () => {
    responderState.loading = true;
    try {
        const res = await SpaceConnector.client.identity.user.list();
        responderState.allMember = res.results;
    } catch (e) {
        ErrorHandler.handleError(e);
        responderState.allMember = [];
    } finally {
        responderState.loading = false;
    }
};

const addResponder = async (userId: string) => {
    try {
        await SpaceConnector.client.monitoring.alert.addResponder({
            alert_id: props.id,
            resource_type: 'identity.User',
            resource_id: userId,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

const removeResponder = async (userID: string) => {
    try {
        await SpaceConnector.client.monitoring.alert.removeResponder({
            alert_id: props.id,
            resource_type: 'identity.User',
            resource_id: userID,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

const listEscalationPolicy = async () => {
    const { rules } = await SpaceConnector.client.monitoring.escalationPolicy.get({
        // eslint-disable-next-line camelcase
        escalation_policy_id: props.alertData.escalation_policy_id,
    });
    state.escalationRuleItems = rules.map((d) => ({
        title: t('MONITORING.ALERT.DETAIL.RESPONDER.LEVEL'),
        data: d,
    }));
};

const handleUpdateSelected = (selected: FilterableDropdownMenuItem[]) => {
    const addedItems: FilterableDropdownMenuItem[] = differenceBy(selected, responderState.prevSelectedMemberItems, 'name');
    const deletedItems: FilterableDropdownMenuItem[] = differenceBy(responderState.prevSelectedMemberItems, selected, 'name');

    if (addedItems.length) {
        addedItems.forEach((item) => addResponder(item.name || ''));
    }
    if (deletedItems.length) {
        deletedItems.forEach((item) => removeResponder(item.name || ''));
    }

    responderState.prevSelectedMemberItems = [...selected];
};

// LOAD REFERENCE STORE
(async () => {
    await Promise.allSettled([
        store.dispatch('reference/protocol/load'),
        store.dispatch('reference/user/load'),
    ]);
    await Promise.allSettled([
        listProjectChannel(), listMember(), listEscalationPolicy(),
    ]);
})();

</script>

<template>
    <p-pane-layout class="alert-responder">
        <article class="responder-wrapper">
            <p-heading heading-type="sub"
                       :title="t('MONITORING.ALERT.DETAIL.RESPONDER.RESPONDER')"
                       class="panel-title"
            >
                <template #extra>
                    <div class="w-full text-right">
                        <p-badge v-if="alertData.escalation_ttl === 0"
                                 badge-type="solid-outline"
                                 style-type="indigo500"
                        >
                            {{ t('MONITORING.ALERT.DETAIL.RESPONDER.COMPLETED') }}
                        </p-badge>
                    </div>
                </template>
            </p-heading>
            <p-collapsible-list :items="state.escalationRuleItems"
                                theme="card"
                                multi-unfoldable
                                :unfolded-indices="[alertData.escalation_step - 1]"
            >
                <template #title="{data, index}">
                    <p class="responder-info"
                       :class="{'current': data.notification_level === `LV${alertData.escalation_step}` }"
                    >
                        <span class="step">[{{ t('MONITORING.ALERT.ESCALATION_POLICY.FORM.STEP') }} {{ index+1 }}]</span>
                        <span class="level">{{ data.notification_level }}</span>
                        <p-badge v-if="data.notification_level === `LV${alertData.escalation_step}`"
                                 badge-type="subtle"
                                 style-type="primary3"
                        >
                            {{ t('MONITORING.ALERT.DETAIL.RESPONDER.CURRENT') }}
                        </p-badge>
                    </p>
                </template>
                <template #default="{ data }">
                    <p class="data-wrapper">
                        <project-channel-list :project-channels="state.projectChannels"
                                              :notification-level="data.notification_level"
                        />
                    </p>
                </template>
            </p-collapsible-list>
            <p class="search-title">
                {{ t('MONITORING.ALERT.DETAIL.RESPONDER.ADDITIONAL_RESPONDER') }}
                <span class="text-gray-500"> ({{ responderState.selectedMemberItems.length }})</span>
            </p>
            <p-filterable-dropdown :menu="responderState.allMemberItems"
                                   :selected="responderState.selectedMemberItems"
                                   :disabled="manageDisabled"
                                   multi-selectable
                                   show-select-marker
                                   appearance-type="stack"
                                   @update:selected="handleUpdateSelected"
            />
        </article>
    </p-pane-layout>
</template>

<style lang="postcss" scoped>
.alert-responder {
    padding: 0 1rem 2.5rem;
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

/* custom project-channel-list */
:deep(.project-channel-list) {
    @apply bg-gray-100;
}

.search-title {
    margin-top: 2rem;
    margin-bottom: 0.5rem;
    font-size: 1rem;
    line-height: 140%;
}
.tag-box {
    @apply text-gray-900;
    margin-top: 0.625rem;
    .p-tag {
        margin-bottom: 0.5rem;
    }
}
</style>
