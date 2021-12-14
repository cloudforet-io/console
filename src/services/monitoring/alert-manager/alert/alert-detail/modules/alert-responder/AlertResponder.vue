<template>
    <p-pane-layout class="alert-responder">
        <article class="responder-wrapper">
            <p-panel-top class="panel-title">
                {{ $t('MONITORING.ALERT.DETAIL.RESPONDER.RESPONDER') }}
                <template #extra>
                    <div class="w-full text-right">
                        <p-badge v-if="alertData.escalation_ttl === 0" outline style-type="indigo">
                            {{ $t('MONITORING.ALERT.DETAIL.RESPONDER.COMPLETED') }}
                        </p-badge>
                    </div>
                </template>
            </p-panel-top>
            <p-collapsible-list :items="escalationRuleItems" theme="card" multi-unfoldable
                                :unfolded-indices="[alertData.escalation_step - 1]"
            >
                <template #title="{data, title, index}">
                    <p class="responder-info" :class="{'current': data.notification_level === `LV${alertData.escalation_step}` }">
                        <span class="step">[{{ $t('MONITORING.ALERT.ESCALATION_POLICY.FORM.STEP') }} {{ index+1 }}]</span>
                        <span class="level">{{ data.notification_level }}</span>
                        <p-badge v-if="data.notification_level === `LV${alertData.escalation_step}`" style-type="primary3">
                            {{ $t('MONITORING.ALERT.DETAIL.RESPONDER.CURRENT') }}
                        </p-badge>
                    </p>
                </template>
                <template #default="{data, index}">
                    <p class="data-wrapper">
                        <project-channel-list :project-channels="projectChannels" :notification-level="data.notification_level" />
                    </p>
                </template>
            </p-collapsible-list>
            <p class="search-title">
                {{ $t('MONITORING.ALERT.DETAIL.RESPONDER.ADDITIONAL_RESPONDER') }}
                <span class="text-gray-500"> ({{ responderState.selectedMemberItems.length }})</span>
            </p>
            <p-search-dropdown type="checkbox"
                               :menu="responderState.allMemberItems"
                               :selected.sync="responderState.selectedMemberItems"
                               @hide-menu="onHideMenu"
                               @delete-tag="onDeleteTag"
            />
        </article>
    </p-pane-layout>
</template>

<script lang="ts">
import {
    PBadge, PCollapsibleList, PPaneLayout, PPanelTop, PSearchDropdown,
} from '@spaceone/design-system';
import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';
import {
    computed, reactive, toRefs,
} from '@vue/composition-api';
import { difference } from 'lodash';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import {
    AlertDataModel,
} from '@/services/monitoring/alert-manager/type';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import ProjectChannelList from '@/services/monitoring/alert-manager/alert/alert-detail/modules/alert-responder/modules/ProjectChannelList.vue';
import { i18n } from '@/translations';
import { store } from '@/store';
import VueI18n from 'vue-i18n';
import ErrorHandler from '@/common/composables/error/errorHandler';

import TranslateResult = VueI18n.TranslateResult;


interface PropsType {
    id?: string;
    alertData: AlertDataModel;
}
interface Rule {
    title: TranslateResult;
    data: object;
}
export default {
    name: 'AlertResponder',
    components: {
        PPaneLayout,
        PPanelTop,
        PCollapsibleList,
        PBadge,
        PSearchDropdown,
        ProjectChannelList,
    },
    props: {
        id: {
            type: String,
            default: undefined,
        },
        alertData: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props: PropsType) {
        const state = reactive({
            items: computed(() => [
                { title: i18n.t('MONITORING.ALERT.DETAIL.RESPONDER.LEVEL'), data: 'LV1' },
                { title: i18n.t('MONITORING.ALERT.DETAIL.RESPONDER.LEVEL'), data: 'LV2' },
                { title: i18n.t('MONITORING.ALERT.DETAIL.RESPONDER.LEVEL'), data: 'LV3' },
            ]),
            escalationRuleItems: [] as Rule[],
            loading: true,
            projectChannels: [],
        });

        const responderState = reactive({
            loading: true,
            allMember: [] as any[],
            allMemberItems: computed(() => {
                const userItems = responderState.userItem;
                return responderState.allMember.map((d) => {
                    const userName = userItems[d.user_id]?.name;
                    return {
                        name: d.user_id,
                        label: userName ? `${d.user_id} (${userName})` : d.user_id,
                        type: 'item',
                    };
                });
            }),
            selectedMemberItems: props.alertData.responders.map(d => ({ name: d.resource_id, label: d.resource_id })) as MenuItem[],
            selectedResourceIds: computed<string[]>(() => responderState.selectedMemberItems.map(d => d.name)),
            userItem: computed(() => store.state.resource.user.items),
        });

        const responderNameFormatter = (resourceId) => {
            const target = responderState.allMemberItems.find(d => d.name === resourceId);
            if (target?.label) return target.label;
            return resourceId;
        };


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

        const onHideMenu = () => {
            const originResponders = Object.fromEntries((
                Object.entries(props.alertData.responders).map(([key, { resource_id }]) => [key, resource_id])
            ));
            const targetItems = difference(responderState.selectedResourceIds, Object.values(originResponders));
            targetItems.forEach((item) => {
                addResponder(item);
            });
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

        const onDeleteTag = async (item) => {
            await removeResponder(item.name);
        };

        const listEscalationPolicy = async () => {
            const { rules } = await SpaceConnector.client.monitoring.escalationPolicy.get({
                // eslint-disable-next-line camelcase
                escalation_policy_id: props.alertData.escalation_policy_id,
            });
            state.escalationRuleItems = rules.map(d => ({
                title: i18n.t('MONITORING.ALERT.DETAIL.RESPONDER.LEVEL'),
                data: d,
            }));
        };

        (async () => {
            await Promise.all([listProjectChannel(), listMember(), listEscalationPolicy(),
                store.dispatch('resource/protocol/load'), store.dispatch('resource/user/load')]);
        })();


        return {
            ...toRefs(state),
            responderState,
            addResponder,
            onDeleteTag,
            onHideMenu,
            responderNameFormatter,
        };
    },
};


</script>

<style lang="postcss" scoped>
.alert-responder {
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
        @apply text-violet-500;
    }
    .level {
        @apply font-bold mx-2;
    }
}

.project-channel-list::v-deep {
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
