<template>
    <section class="right-contents-container">
        <p-breadcrumbs :routes="routeState.routes" />
        <p-page-title :title="$t('IDENTITY.USER.MAIN.API_KEY')"
                      :title-info="$t('IDENTITY.USER.MAIN.API_KEY_TITLE_INFO')"
        />
        <p-pane-layout class="main-table-wrapper">
            <article class="table-header">
                <div class="left-section">
                    <p-icon-text-button style-type="secondary-dark"
                                        name="ic_plus_bold"
                                        :disabled="disableCreateBtn"
                                        @click="openAPIKeyConfirmModal"
                                        @confirm="confirm"
                    >
                        {{ $t('IDENTITY.USER.MAIN.CREATE_API_KEY') }}
                    </p-icon-text-button>
                    <p-dropdown-menu-btn
                        class="dropdown-btn"
                        :menu="dropdownMenu"
                        @click-enable="onClickEnable"
                        @click-disable="onClickDisable"
                        @click-delete="onClickDelete"
                    >
                        {{ $t('IDENTITY.USER.MAIN.ACTION') }}
                    </p-dropdown-menu-btn>
                </div>
                <div class="table-desc">
                    {{ $t('IDENTITY.USER.MAIN.API_TABLE_DESC') }}
                </div>
            </article>
            <p-data-table
                :items="items"
                :loading="loading"
                :fields="fields"
                :select-index.sync="selectedIndex"
                :striped="false"
                :selectable="true"
            />
        </p-pane-layout>
        <p-pane-layout class="sub-table-wrapper">
            <div class="sub-table-header">
                {{ $t('IDENTITY.USER.MAIN.ENDPOINTS') }}
            </div>
            <p-data-table
                :items="subState.items"
                :loading="subState.loading"
                :fields="subState.fields"
                :striped="false"
            />
        </p-pane-layout>
        <user-a-p-i-key-modal v-if="visible"
                              :visible.sync="visible"
                              @clickButton="confirm"
        />
        <p-table-check-modal
            :fields="modalState.fields"
            :mode="modalState.mode"
            :items="selectedItems"
            :header-title="modalState.title"
            :sub-title="modalState.subTitle"
            :theme-color="modalState.themeColor"
            size="md"
            :visible.sync="modalState.visible"
            @confirm="checkModalConfirm"
        />
    </section>
</template>

<script lang="ts">
import {
    PEmpty, PI, PBreadcrumbs, PIconTextButton,
    PDropdownMenuBtn, PDataTable, PPageTitle, PPaneLayout, PTableCheckModal,
} from '@spaceone/design-system';
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';
import UserAPIKeyModal from '@/views/identity/user/modules/UserAPIKeyModal.vue';
import { SpaceConnector } from '@/lib/space-connector';
import { ApiQueryHelper } from '@/lib/space-connector/helper';
import { store } from '@/store';
import { TranslateResult } from 'vue-i18n';
import {
    hideLoadingMessage, showErrorMessage, showLoadingMessage, showSuccessMessage,
} from '@/lib/util';

export default {
    name: 'UserAPIKey',
    components: {
        UserAPIKeyModal,
        PEmpty,
        PI,
        PPaneLayout,
        PBreadcrumbs,
        PIconTextButton,
        PDropdownMenuBtn,
        PDataTable,
        PPageTitle,
        PTableCheckModal,
    },
    setup(props) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            loading: false,
            fields: [
                { name: 'api_key_id', label: 'API Key ID' },
                { name: 'state', label: 'State' },
                { name: 'created_at', label: 'Created' },
            ],
            items: [] as any,
            selectedIndex: [],
            selectedItems: computed(() => state.selectedIndex.map(i => state.items[i])),
            dropdownMenu: computed(() => ([
                {
                    type: 'item', name: 'enable', label: vm.$t('IDENTITY.USER.MAIN.ENABLE'), disabled: state.selectedIndex.length !== 1,
                },
                { type: 'divider' },
                {
                    type: 'item', name: 'disable', label: vm.$t('IDENTITY.USER.MAIN.DISABLE'), disabled: state.selectedIndex.length !== 1,
                },
                { type: 'divider' },
                {
                    type: 'item', name: 'delete', label: vm.$t('IDENTITY.USER.MAIN.DELETE'), disabled: state.selectedIndex.length !== 1,
                },
            ] as MenuItem[])),
            visible: false,
            userId: computed(() => store.state.user.userId),
            disableCreateBtn: computed(() => state.items.length >= 2),
        });
        const subState = reactive({
            loading: false,
            fields: [
                { name: 'service', label: 'Service' },
                { name: 'name', label: 'Name' },
                { name: 'version', label: 'Version' },
                { name: 'endpoint', label: 'Endpoint' },
                { name: 'status', label: 'Status' },
            ],
            items: [] as any,
        });
        const routeState = reactive({
            routes: computed(() => ([
                { name: vm.$t('MENU.IDENTITY.IDENTITY'), path: '/identity' },
                { name: vm.$t('MENU.IDENTITY.USER'), path: '/identity/user/account' },
                { name: vm.$t('IDENTITY.USER.MAIN.API_KEY') },
            ])),
        });

        const modalState = reactive({
            fields: computed(() => [
                { name: 'api_key_id', label: 'API Key ID' },
                { name: 'state', label: 'State' },
                { name: 'created_at', label: 'Created' },
            ]),
            mode: '',
            items: [] as any,
            title: '' as TranslateResult,
            subTitle: '' as TranslateResult,
            themeColor: '',
            visible: false,
        });

        const onSelect = async (index) => {
            state.selectedIndex = index;
        };

        const apiQueryHelper = new ApiQueryHelper();
        const listAPIKey = async () => {
            apiQueryHelper.setSort('created_at')
                .setFilters([{ k: 'user_id', v: state.userId, o: '=' }]);

            const res = await SpaceConnector.client.identity.apiKey.list({
                query: apiQueryHelper.data,
            });
            state.items = res.results;
        };

        const listEndpoints = async () => {
            const res = await SpaceConnector.client.identity.endpoint.list();
            subState.items = res.results;
        };

        const openAPIKeyConfirmModal = async () => {
            try {
                // showLoadingMessage('Create API Key', '', vm.$root);
                await SpaceConnector.client.identity.apiKey.create({
                    user_id: state.userId,
                });
                // hideLoadingMessage(vm.$root);
                state.visible = true;
            } catch (e) {
                console.error(e);
            } finally {
                await listAPIKey();
            }
        };

        const confirm = () => {
            state.visible = false;
        };

        const enableAPIKey = async (item) => {
            try {
                await SpaceConnector.client.identity.apiKey.enable({
                    api_key_id: item[0].api_key_id,
                });
                showSuccessMessage(vm.$t('IDENTITY.USER.MAIN.ALT_S_ENABLE_API_KEY'), '', vm.$root);
            } catch (e) {
                console.error(e);
                showErrorMessage(vm.$t('IDENTITY.USER.MAIN.ALT_S_ENABLE_API_KEY'), '', vm.$root);
            } finally {
                await listAPIKey();
                modalState.visible = false;
            }
        };

        const disableAPIKey = async (item) => {
            try {
                await SpaceConnector.client.identity.apiKey.disable({
                    api_key_id: item[0].api_key_id,
                });
                showSuccessMessage(vm.$t('IDENTITY.USER.MAIN.ALT_S_DISABLE_API_KEY'), '', vm.$root);
            } catch (e) {
                console.error(e);
                showErrorMessage(vm.$t('IDENTITY.USER.MAIN.ALT_E_DISABLE_API_KEY'), '', vm.$root);
            } finally {
                await listAPIKey();
                modalState.visible = false;
            }
        };

        const deleteAPIKey = async (item) => {
            try {
                await SpaceConnector.client.identity.apiKey.delete({
                    api_key_id: item[0].api_key_id,
                });
                showSuccessMessage(vm.$t('IDENTITY.USER.MAIN.ALT_S_DELETE_API_KEY'), '', vm.$root);
            } catch (e) {
                console.error(e);
                showErrorMessage(vm.$t('IDENTITY.USER.MAIN.ALT_E_DELETE_API_KEY'), '', vm.$root);
            } finally {
                state.selectedIndex = [];
                await listAPIKey();
                modalState.visible = false;
            }
        };

        const onClickEnable = async () => {
            modalState.mode = 'enable';
            modalState.title = vm.$t('IDENTITY.USER.MAIN.ENABLE_MODAL_TITLE') as string;
            modalState.subTitle = vm.$tc('IDENTITY.USER.MAIN.ENABLE_MODAL_DESC', state.selectedIndex.length);
            modalState.themeColor = 'safe';
            modalState.visible = true;
        };

        const onClickDisable = async () => {
            modalState.mode = 'disable';
            modalState.title = vm.$t('IDENTITY.USER.MAIN.DISABLE_MODAL_TITLE') as string;
            modalState.subTitle = vm.$tc('IDENTITY.USER.MAIN.DISABLE_MODAL_DESC', state.selectedIndex.length);
            modalState.themeColor = 'alert';
            modalState.visible = true;
        };

        const onClickDelete = async () => {
            modalState.mode = 'delete';
            modalState.title = vm.$t('IDENTITY.USER.MAIN.DELETE_MODAL_TITLE') as string;
            modalState.subTitle = vm.$tc('IDENTITY.USER.MAIN.DELETE_MODAL_DESC', state.selectedIndex.length);
            modalState.themeColor = 'alert';
            modalState.visible = true;
        };

        const checkModalConfirm = async (item) => {
            if (modalState.mode === 'delete') await deleteAPIKey(item);
            if (modalState.mode === 'enable') await enableAPIKey(item);
            if (modalState.mode === 'disable') await disableAPIKey(item);
        };


        (async () => {
            await listAPIKey();
            await listEndpoints();
        })();

        return {
            ...toRefs(state),
            subState,
            routeState,
            modalState,
            onSelect,
            onClickEnable,
            onClickDisable,
            onClickDelete,
            checkModalConfirm,
            openAPIKeyConfirmModal,
            confirm,
        };
    },

};
</script>

<style lang="postcss" scoped>
.title-extra {

}
.main-table-wrapper {
    width: 100%;
    height: 100%;
    margin-bottom: 1rem;
}

.table-header {
    display: flex;
    justify-content: space-between;
    padding-left: 1rem;
    padding-top: 1.5rem;
    padding-bottom: 1.5rem;
    .left-section {
        display: inherit;
    }
    .dropdown-btn {
        margin-left: 1rem;
    }
    .table-desc {
        @apply text-gray-500;
        padding-right: 1rem;
        font-size: 0.875rem;
        line-height: 150%;
    }
}

.sub-table-header {
    padding-left: 1rem;
    padding-top: 2rem;
    margin-bottom: 1rem;
    font-size: 1.375rem;
    line-height: 145%;
}
</style>
