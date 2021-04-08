<template>
    <general-page-layout class="spot-group-detail-page">
        <div class="page-content">
            <p-breadcrumbs :routes="routeState.routes" />
            <div class="top-wrapper">
                <p-page-title :title="spotGroup.name" child @goBack="$router.go(-1)" />
                <div class="button-group">
                    <p-icon-button name="ic_transhcan"
                                   class="delete-button"
                                   @click="openSpotGroupDeleteModal"
                    />
                    <p-icon-button name="ic_edit-text"
                                   class="edit-button"
                                   @click="openSpotGroupEditModal"
                    />
                </div>
            </div>
            <p-tab :tabs="tabState.tabs" :active-tab.sync="tabState.activeTab"
                   class="tab-content"
            >
                <template #summary>
                    <spot-group-detail-dashboard :spot-group="spotGroup" />
                </template>
                <template #instance />
                <template #loadBalancer />
                <template #member>
                    <spot-group-detail-member :spot-group-id="spotGroupId" />
                </template>
                <template #tag>
                    <tags-panel :resource-id="spotGroupId"
                                resource-key="spot_group_id"
                                resource-type="spot_automation.SpotGroup"
                                class="tab-bg"
                    />
                </template>
                <template #history />
            </p-tab>
        </div>
    </general-page-layout>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';

import GeneralPageLayout from '@/common/components/layouts/GeneralPageLayout.vue';
import SpotGroupDetailDashboard from '@/views/automation/spot-automation/modules/spot-group-detail-dashboard/SpotGroupDetailDashboard.vue';
import {
    PBreadcrumbs, PPageTitle, PIconButton, PTab,
} from '@spaceone/design-system';
import { TabItem } from '@spaceone/design-system/dist/src/navigation/tabs/tab/type';

import { SpaceConnector } from '@/lib/space-connector';

import TagsPanel from '@/common/modules/tags-panel/TagsPanel.vue';
import SpotGroupDetailMember
    from '@/views/automation/spot-automation/modules/spot-group-detail-dashboard/SpotGroupDetailMember.vue';

export default {
    name: 'SpotGroupDetailPage',
    components: {
        SpotGroupDetailDashboard,
        SpotGroupDetailMember,
        GeneralPageLayout,
        PBreadcrumbs,
        PPageTitle,
        PIconButton,
        PTab,
        TagsPanel,
    },
    setup(props, { root }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            spotGroupId: computed(() => root.$route.params.id),
            spotGroup: {},
        });
        const tabState = reactive({
            tabs: computed(() => ([
                { name: 'summary', label: vm.$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.TAB_SUMMARY'), keepAlive: true },
                { name: 'member', label: vm.$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.TAB_MEMBER') },
                { name: 'tag', label: vm.$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.TAB_TAG') },
                { name: 'history', label: vm.$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.TAB_HISTORY') },
            ] as TabItem[])),
            activeTab: 'summary',
        });
        const routeState = reactive({
            routes: computed(() => ([
                { name: vm.$t('MENU.AUTOMATION.AUTOMATION'), path: '/automation' },
                { name: vm.$t('MENU.AUTOMATION.SPOT_AUTOMATION'), path: '/automation/spot-automation/spot-group' },
                { name: vm.$t('MENU.AUTOMATION.SPOT_GROUP') },
            ])),
        });

        /* api */
        const getSpotGroup = async () => {
            try {
                state.spotGroup = await SpaceConnector.client.spotAutomation.spotGroup.get({ spot_group_id: state.spotGroupId });
            } catch (e) {
                console.error(e);
            }
        };

        const init = () => {
            getSpotGroup();
        };
        init();

        /* event */
        const openSpotGroupDeleteModal = () => {
            console.log('open delete modal');
        };
        const openSpotGroupEditModal = () => {
            console.log('open edit modal');
        };

        return {
            ...toRefs(state),
            tabState,
            routeState,
            openSpotGroupDeleteModal,
            openSpotGroupEditModal,
        };
    },
};
</script>

<style lang="postcss" scoped>
.spot-group-detail-page {
    .page-inner {
        max-width: 85.5rem;
        margin: 0 auto;
    }
    .p-tab::v-deep {
        border: none;
        margin: auto;

        .p-tab-bar {
            border: none;
        }
        .tab-pane {
            @apply border border-gray-200;
            padding: 0;
        }
    }
    .top-wrapper {
        display: flex;
        margin-bottom: 2rem;
        .p-page-title {
            width: auto;
            margin-bottom: 0;
        }
        .button-group {
            margin-left: 0.75rem;
        }
    }

    .tab-bg {
        @apply bg-white rounded-sm pb-8;
    }
}
</style>
