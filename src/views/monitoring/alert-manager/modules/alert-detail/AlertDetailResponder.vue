<template>
    <p-pane-layout class="alert-detail-responder">
        <article class="responder-wrapper">
            <p-panel-top class="panel-title">
                {{ $t('MONITORING.ALERT.DETAIL.RESPONDER.RESPONDER') }}
            </p-panel-top>
            <p-collapsible-list :items="items" theme="card" multi-unfoldable
                                :unfolded-indices="[alertData.escalation_step]"
            >
                <template #title="{title, index}">
                    <p class="responder-info" :class="{'current': items[index].data === `LV${alertData.escalation_step}`}">
                        <span class="step">[{{ $t('MONITORING.ALERT.ESCALATION_POLICY.FORM.STEP') }} {{ index+1 }}]</span>
                        <span class="level">{{ items[index].data }}</span>
                        <p-badge v-if="items[index].data === `LV${alertData.escalation_step}`" style-type="primary3">
                            {{ $t('MONITORING.ALERT.DETAIL.RESPONDER.CURRENT') }}
                        </p-badge>
                    </p>
                </template>
                <template #default="{data}">
                    <p class="data-wrapper">
                        <project-channel-list :project-channels="projectChannels" :notification-level="data" />
                    </p>
                </template>
            </p-collapsible-list>
            <p class="search-title">
                {{ $t('MONITORING.ALERT.DETAIL.RESPONDER.ADDITIONAL_RESPONDER') }}
                <span class="text-gray-500"> ({{ responderState.selectedMemberItems.length }})</span>
            </p>
            <p-autocomplete-search v-model="responderState.search" :menu="responderState.allMemberItems" :loading="responderState.loading"
                                   class="autocomplete-search" @select-menu="onSelectMember" @hide-menu="addResponder"
            >
                <template #menu-item--format="{item, id}">
                    <p-check-box :id="id" v-model="responderState.selectedMemberItems" class="tag-menu-item"
                                 :value="item.name"
                    >
                        {{ item.name }} ({{ item.label ? item.label : item.name }})
                    </p-check-box>
                </template>
                <template #menu-no-data-format>
                    <div v-if="responderState.loading" class="fake-no-data" />
                </template>
            </p-autocomplete-search>
            <div class="tag-box">
                <p-tag v-for="(tag, i) in responderState.selectedMemberItems" :key="tag" @delete="onDeleteTag(i)">
                    {{ tag ? tag : '' }}
                    <template v-if="!responderState.loading">
                        ({{ responderNameFormatter(tag) }})
                    </template>
                </p-tag>
            </div>
        </article>
    </p-pane-layout>
</template>

<script lang="ts">
import {
    PAutocompleteSearch,
    PBadge, PCheckBox, PCollapsibleList, PPaneLayout, PPanelTop, PTag,
} from '@spaceone/design-system';
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import { difference } from 'lodash';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import {
    AlertDataModel,
} from '@/views/monitoring/alert-manager/type';
import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import ProjectChannelList from '@/views/monitoring/alert-manager/components/ProjectChannelList.vue';
import { i18n } from '@/translations';
import { store } from '@/store';
import { UserState } from '@/store/modules/user/type';

interface PropsType {
    id?: string;
    alertData: AlertDataModel;
}

export default {
    name: 'AlertDetailResponder',
    components: {
        PPaneLayout,
        PPanelTop,
        PCollapsibleList,
        PBadge,
        PAutocompleteSearch,
        PCheckBox,
        PTag,
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
    setup(props: PropsType, { emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            items: computed(() => [
                { title: i18n.t('MONITORING.ALERT.DETAIL.RESPONDER.LEVEL'), data: 'ALL' },
                { title: i18n.t('MONITORING.ALERT.DETAIL.RESPONDER.LEVEL'), data: 'LV1' },
                { title: i18n.t('MONITORING.ALERT.DETAIL.RESPONDER.LEVEL'), data: 'LV2' },
                { title: i18n.t('MONITORING.ALERT.DETAIL.RESPONDER.LEVEL'), data: 'LV3' },
            ]),
            loading: true,
            projectChannels: [],
        });

        const responderState = reactive({
            search: '',
            loading: true,
            allMember: [] as UserState[],
            allMemberItems: computed(() => responderState.allMember.map(d => ({
                name: d.user_id,
                label: d.name,
                type: 'item',
            }))),
            selectedMemberItems: props.alertData.responders.map(d => d.resource_id),
        });

        const responderNameFormatter = (resourceId) => {
            const target = responderState.allMemberItems.find(d => d.name === resourceId);
            if (target.label) return target.label;
            return target.name;
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
                state.projectChannels = [];
                console.error(e);
            }
        };

        const listMember = async () => {
            responderState.loading = true;
            try {
                const res = await SpaceConnector.client.identity.user.list();
                responderState.allMember = res.results;
            } catch (e) {
                responderState.allMember = [];
                console.error(e);
            } finally {
                responderState.loading = false;
            }
        };

        const addResponderAPI = async (items) => {
            await Promise.all(items.map((d) => {
                SpaceConnector.client.monitoring.alert.addResponder({
                    alert_id: props.id,
                    resource_type: 'identity.User',
                    resource_id: d,
                });
            }));
        };

        const addResponder = async () => {
            try {
                const originResponders = Object.fromEntries((
                    Object.entries(props.alertData.responders).map(([key, { resource_id }]) => [key, resource_id])));
                const targetItems = difference(responderState.selectedMemberItems, Object.values(originResponders));
                await addResponderAPI(targetItems);
            } catch (e) {
                console.error(e);
            }
        };

        const onSelectMember = async (item: MenuItem) => {
            responderState.search = '';
            const idx = responderState.selectedMemberItems.findIndex(k => k === item.name);
            if (idx === -1) responderState.selectedMemberItems.push(item.name);
        };

        const removeResponder = async (userID) => {
            try {
                await SpaceConnector.client.monitoring.alert.removeResponder({
                    alert_id: props.id,
                    resource_type: 'identity.User',
                    resource_id: userID,
                });
            } catch (e) {
                console.error(e);
            }
        };

        const onDeleteTag = async (idx) => {
            await removeResponder(responderState.selectedMemberItems[idx]);
            responderState.selectedMemberItems.splice(idx, 1);
            vm.$nextTick(() => {
                responderState.selectedMemberItems = [...responderState.selectedMemberItems];
            });
        };

        (async () => {
            await Promise.all([listProjectChannel(), listMember(),
                store.dispatch('resource/protocol/load'), store.dispatch('resource/user/load')]);
        })();


        return {
            ...toRefs(state),
            responderState,
            onSelectMember,
            addResponder,
            onDeleteTag,
            responderNameFormatter,
        };
    },
};


</script>

<style lang="postcss" scoped>
.alert-detail-responder {
    padding: 0 1rem 2.5rem 1rem;
}
.panel-title {
    @apply -ml-1;
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
