<template>
    <general-page-layout class="spot-group-detail-page">
        <div class="page-inner">
            <p-breadcrumbs :routes="routeState.routes" />
            <div class="top-wrapper">
                <p-page-title :title="spotGroup.name" child @goBack="$router.go(-1)" />
                <div class="button-group">
                    <p-icon-button name="ic_trashcan"
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
            <p-button-modal :header-title="headerTitle"
                            :centered="true"
                            :scrollable="false"
                            size="md"
                            :fade="true"
                            :backdrop="true"
                            :visible.sync="spotGroupDeleteModalVisible"
                            :theme-color="themeColor"
                            @confirm="spotGroupDeleteModalConfirm"
            >
                <template #body>
                    <p class="delete-modal-content">
                        {{ modalContent }}
                    </p>
                </template>
            </p-button-modal>
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
    PBreadcrumbs, PPageTitle, PIconButton, PTab, PButtonModal,
} from '@spaceone/design-system';
import { TabItem } from '@spaceone/design-system/dist/src/navigation/tabs/tab/type';

import SpotGroupDetailMember from '@/views/automation/spot-automation/modules/spot-group-detail-dashboard/SpotGroupDetailMember.vue';
import TagsPanel from '@/common/modules/tags-panel/TagsPanel.vue';

import { SpaceConnector } from '@/lib/space-connector';
import { TranslateResult } from 'vue-i18n';
import { showErrorMessage, showSuccessMessage } from '@/lib/util';

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
        PButtonModal,
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
                { name: 'member', label: vm.$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.TAB_MEMBER'), keepAlive: true },
                { name: 'tag', label: vm.$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.TAB_TAG'), keepAlive: true },
                // { name: 'history', label: vm.$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.TAB_HISTORY') },
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

        // Member modal
        const formState = reactive({
            spotGroupDeleteModalVisible: false,
            spotGroupEditModalVisible: false,
            headerTitle: '' as TranslateResult,
            themeColor: '',
            modalContent: '' as TranslateResult,
        });

        /* event */

        const openSpotGroupDeleteModal = () => {
            formState.spotGroupDeleteModalVisible = true;
            formState.headerTitle = vm.$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.MODAL_DELETE_SPOT_GROUP_TITLE');
            formState.themeColor = 'alert';
            formState.modalContent = vm.$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.MODAL_DELETE_SPOT_GROUP_CONTENT');
        };

        const spotGroupDeleteModalConfirm = async () => {
            try {
                await SpaceConnector.client.spotAutomation.spotGroup.delete({
                    spot_group_id: state.spotGroupId,
                });
                await vm.$store.dispatch('favorite/spotGroup/removeItem', { id: state.spotGroupId });
                showSuccessMessage(vm.$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.ALT_S_DELETE_SPOT_GROUP'), '', root);
                vm.$router.go(-1);
            } catch (e) {
                showErrorMessage(vm.$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.ALT_E_DELETE_SPOT_GROUP'), e, root);
            } finally {
                formState.spotGroupDeleteModalVisible = false;
            }
        };

        const deleteSpotGroup = async () => {
            console.log('delete spot group');
        };

        const openSpotGroupEditModal = () => {
            console.log('open spot group');
        };

        const updateSpotGroup = async () => {
            console.log('update spot group');
        };

        return {
            ...toRefs(state),
            ...toRefs(formState),
            tabState,
            routeState,
            spotGroupDeleteModalConfirm,
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
