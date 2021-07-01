<template>
    <p-pane-layout class="alert-detail-responder">
        <article class="responder-wrapper">
            <p-panel-top class="-ml-1">
                {{ $t('MONITORING.ALERT.DETAIL.RESPONDER.RESPONDER') }}
            </p-panel-top>
            <p-collapsible-list :items="items" theme="card" multi-unfoldable>
                <template #title="{title, index}">
                    <span class="level" :class="{'current': index + 1 === alertData.escalation_step}">{{ title }}</span>
                    <span class="level font-bold" :class="{'current': index + 1 === alertData.escalation_step}"> {{ index+1 }} </span>
                    <p-badge v-if="index + 1 === alertData.escalation_step" style-type="primary3">
                        {{ $t('MONITORING.ALERT.DETAIL.RESPONDER.CURRENT') }}
                    </p-badge>
                </template>
                <template #default="{data}">
                    {{ data }}
                    <p class="data-wrapper">
                        <project-channel-list :project-channels="projectChannels" :notification-level="data" />
                    </p>
                </template>
            </p-collapsible-list>
            <p class="search-title">
                {{ $t('MONITORING.ALERT.DETAIL.RESPONDER.ADDITIONAL_RESPONDER') }}
            </p>
            <p-autocomplete-search v-model="responderState.search" :menu="responderState.allMemberItems" :loading="responderState.loading"
                                   class="autocomplete-search" @select-menu="onSelectMember"
            >
                <template #menu-item--format="{item, id}">
                    <p-check-box :id="id" v-model="responderState.selectedMemberItems" class="tag-menu-item"
                                 :value="item.name"
                    >
                        {{ item.label }}
                    </p-check-box>
                </template>
                <template #menu-no-data-format>
                    <div v-if="responderState.loading" class="fake-no-data" />
                </template>
            </p-autocomplete-search>
            <div class="tag-box">
                <p-tag v-for="(tag, i) in responderState.selectedMemberItems" :key="tag" @delete="onDeleteTag(i)">
                    {{ tag ? tag : '' }}
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
import { SpaceConnector } from '@/core-lib/space-connector';
import {
    AlertDataModel,
} from '@/views/monitoring/alert-manager/type';
import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';
import { ApiQueryHelper } from '@/core-lib/space-connector/helper';
import ProjectChannelList from '@/views/monitoring/alert-manager/components/ProjectChannelList.vue';
import { i18n } from '@/translations';
import {store} from "@/store";

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
    setup(props: PropsType) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            items: computed(() => [
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
            allMember: [] as string[],
            allMemberItems: computed(() => responderState.allMember.map(d => ({
                name: d.user_id,
                label: d.name,
                type: 'item',
            }))),
            selectedMemberItems: props.alertData.responders.map(d => d.resource_id),
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

        const addResponder = async (userID) => {
            try {
                await SpaceConnector.client.monitoring.alert.addResponder({
                    alert_id: props.id,
                    resource_type: 'identity.User',
                    resource_id: userID,
                });
            } catch (e) {
                console.error(e);
            }
        };

        const onSelectMember = async (item: MenuItem) => {
            responderState.search = '';
            // const idx = state.selectedMemberItems.findIndex(k => k === item.name);
            responderState.selectedMemberItems = [...responderState.selectedMemberItems, item.name];
            await responderState.selectedMemberItems.forEach((i) => {
                addResponder(i);
            });
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
            await Promise.all([listProjectChannel(), listMember(), store.dispatch('resource/protocol/load')]);
        })();


        return {
            ...toRefs(state),
            responderState,
            onSelectMember,
            addResponder,
            onDeleteTag,
        };
    },
};


</script>

<style lang="postcss" scoped>
.alert-detail-responder {
    padding: 0 1rem 2.5rem 1rem;
}
.level {
    font-size: 1rem;
    line-height: 125%;
    &.current {
        @apply text-violet-500;
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
