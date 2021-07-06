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
                                   @click="openSpotGroupEditForm"
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
            <p-button-modal :header-title="$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.MODAL_DELETE_SPOT_GROUP_TITLE')"
                            :centered="true"
                            :scrollable="false"
                            size="sm"
                            :fade="true"
                            :backdrop="true"
                            :visible.sync="spotGroupDeleteModalVisible"
                            :theme-color="themeColor"
                            @confirm="deleteSpotGroup"
            >
                <template #body>
                    <p class="delete-modal-content">
                        {{ modalContent }}
                    </p>
                </template>
            </p-button-modal>
            <p-button-modal :header-title="$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.MODAL_UPDATE_SPOT_GROUP_TITLE')"
                            :centered="true"
                            size="sm"
                            :fade="true"
                            :scrollable="false"
                            :backdrop="true"
                            :visible.sync="spotGroupEditFormVisible"
                            :disabled="showNameValidation && !isNameValid"
                            @confirm="confirm"
            >
                <template #body>
                    <p-field-group :label="$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.MODAL_UPDATE_SPOT_GROUP_LABEL')"
                                   :invalid="!isNameValid"
                                   :invalid-text="$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.MODAL_UPDATE_SPOT_GROUP_NAME_DESC')"
                                   required
                    >
                        <template #default>
                            <p-text-input v-model="spotGroupName"
                                          class="block w-full"
                                          :invalid="!isNameValid"
                                          :placeholder="$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.MODAL_UPDATE_SPOT_GROUP_PLACEHOLDER')"
                            />
                        </template>
                    </p-field-group>
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
    PBreadcrumbs, PPageTitle, PIconButton, PTab, PButtonModal, PTextInput, PFieldGroup,
} from '@spaceone/design-system';
import { TabItem } from '@spaceone/design-system/dist/src/navigation/tabs/tab/type';

import SpotGroupDetailMember from '@/views/automation/spot-automation/modules/spot-group-detail-dashboard/SpotGroupDetailMember.vue';
import TagsPanel from '@/common/modules/tags-panel/TagsPanel.vue';

import { SpaceConnector } from '@/core-lib/space-connector';
import { TranslateResult } from 'vue-i18n';
import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { spotGroupNameRegex } from '@/views/automation/spot-automation/lib/validations';

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
        PTextInput,
        PFieldGroup,
    },
    setup(props, { root }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            spotGroupId: computed(() => root.$route.params.id),
            spotGroup: {},
            spotGroupName: '' as string,
            showNameValidation: false,
            isNameValid: computed(() => (!state.showNameValidation || spotGroupNameRegex.test(state.spotGroupName))),
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
                state.spotGroupName = state.spotGroup.name;
            } catch (e) {
                console.error(e);
                state.spotGroup = {};
                state.spotGroupName = '';
            }
        };

        const init = () => {
            getSpotGroup();
        };
        init();

        // Member modal
        const formState = reactive({
            spotGroupDeleteModalVisible: false,
            spotGroupEditFormVisible: false,
            themeColor: '',
            modalContent: '' as TranslateResult,
        });

        /* event */
        const openSpotGroupDeleteModal = () => {
            formState.spotGroupDeleteModalVisible = true;
            formState.modalContent = vm.$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.MODAL_DELETE_SPOT_GROUP_CONTENT');
            formState.themeColor = 'alert';
        };

        const deleteSpotGroup = async () => {
            try {
                await SpaceConnector.client.spotAutomation.spotGroup.delete({
                    spot_group_id: state.spotGroupId,
                });
                // await vm.$store.dispatch('favorite/spotGroup/removeItem', { id: state.spotGroupId });
                showSuccessMessage(vm.$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.ALT_S_DELETE_SPOT_GROUP'), '', root);
                vm.$router.go(-1);
            } catch (e) {
                showErrorMessage(vm.$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.ALT_E_DELETE_SPOT_GROUP'), e, root);
            } finally {
                formState.spotGroupDeleteModalVisible = false;
            }
        };

        const openSpotGroupEditForm = () => {
            formState.spotGroupEditFormVisible = true;
        };

        const updateSpotGroupName = async (params) => {
            try {
                await SpaceConnector.client.spotAutomation.spotGroup.update({
                    ...params,
                });
                state.spotGroup.name = state.spotGroupName;
                formState.spotGroupEditFormVisible = false;
                showSuccessMessage(vm.$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.EDIT.ALT_S_EDIT_SPOT_GROUP'), '', vm.$root);
            } catch (e) {
                showErrorMessage(vm.$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.EDIT.ALT_E_EDIT_SPOT_GROUP'), e, vm.$root);
                throw new Error(e);
            }
        };

        const confirm = () => {
            if (!state.showNameValidation) state.showNameValidation = true;
            if (!state.isNameValid) return;

            const params = {
                spot_group_id: state.spotGroupId,
                name: state.spotGroupName,
            };

            try {
                updateSpotGroupName(params);
            } catch (e) {
                console.error(e);
            } finally {
                state.showNameValidation = false;
            }
        };

        return {
            ...toRefs(state),
            ...toRefs(formState),
            tabState,
            routeState,
            deleteSpotGroup,
            confirm,
            openSpotGroupDeleteModal,
            openSpotGroupEditForm,
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

    .delete-modal-content {
        line-height: 1.4;
    }
}
</style>
