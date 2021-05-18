<template>
    <section class="right-contents-container">
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
        <user-a-p-i-key-modal v-if="visible && !modalState.loading"
                              :visible.sync="visible"
                              :api-key-item="modalState.items"
                              :endpoints="modalState.endpoints"
                              @clickButton="confirm"
        />
        <p-table-check-modal
            :fields="checkModalState.fields"
            :mode="checkModalState.mode"
            :items="selectedItems"
            :header-title="checkModalState.title"
            :sub-title="checkModalState.subTitle"
            :theme-color="checkModalState.themeColor"
            size="md"
            :visible.sync="checkModalState.visible"
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
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs, watch,
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
        PPaneLayout,
        PIconTextButton,
        PDropdownMenuBtn,
        PDataTable,
        PTableCheckModal,
    },
    props: {
        userId: {
            type: String,
            default: '',
        },
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
            user: props.userId || '',
            disableCreateBtn: computed(() => state.items.length >= 2),
        });

        const modalState = reactive({
            loading: false,
            items: [] as any,
            endpoints: null as any,
        });

        const checkModalState = reactive({
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
        const listAPIKey = async (userId) => {
            state.loading = true;
            try {
                apiQueryHelper.setSort('created_at')
                    .setFilters([{ k: 'user_id', v: userId, o: '=' }]);

                const res = await SpaceConnector.client.identity.apiKey.list({
                    query: apiQueryHelper.data,
                });
                state.items = res.results;
            } catch (e) {
                state.items = [];
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        const openAPIKeyConfirmModal = async () => {
            try {
                modalState.loading = true;
                showLoadingMessage('Create API Key', '', vm.$root);
                const resp = await SpaceConnector.client.identity.apiKey.create({
                    user_id: state.user,
                });
                modalState.items = resp;
                modalState.loading = false;
                hideLoadingMessage(vm.$root);
                state.visible = true;
            } catch (e) {
                console.error(e);
            } finally {
                await listAPIKey(state.user);
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
                await listAPIKey(state.user);
                checkModalState.visible = false;
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
                await listAPIKey(state.user);
                checkModalState.visible = false;
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
                await listAPIKey(state.user);
                checkModalState.visible = false;
            }
        };

        const onClickEnable = async () => {
            checkModalState.mode = 'enable';
            checkModalState.title = vm.$t('IDENTITY.USER.MAIN.ENABLE_MODAL_TITLE') as string;
            checkModalState.subTitle = vm.$tc('IDENTITY.USER.MAIN.ENABLE_MODAL_DESC', state.selectedIndex.length);
            checkModalState.themeColor = 'safe';
            checkModalState.visible = true;
        };

        const onClickDisable = async () => {
            checkModalState.mode = 'disable';
            checkModalState.title = vm.$t('IDENTITY.USER.MAIN.DISABLE_MODAL_TITLE') as string;
            checkModalState.subTitle = vm.$tc('IDENTITY.USER.MAIN.DISABLE_MODAL_DESC', state.selectedIndex.length);
            checkModalState.themeColor = 'alert';
            checkModalState.visible = true;
        };

        const onClickDelete = async () => {
            checkModalState.mode = 'delete';
            checkModalState.title = vm.$t('IDENTITY.USER.MAIN.DELETE_MODAL_TITLE') as string;
            checkModalState.subTitle = vm.$tc('IDENTITY.USER.MAIN.DELETE_MODAL_DESC', state.selectedIndex.length);
            checkModalState.themeColor = 'alert';
            checkModalState.visible = true;
        };

        const checkModalConfirm = async (item) => {
            if (checkModalState.mode === 'delete') await deleteAPIKey(item);
            if (checkModalState.mode === 'enable') await enableAPIKey(item);
            if (checkModalState.mode === 'disable') await disableAPIKey(item);
        };

        const endpointQueryHelper = new ApiQueryHelper();
        const listEndpoints = async () => {
            state.loading = true;
            endpointQueryHelper.setSort('created_at')
                .setFilters([{ k: 'service', v: 'inventory', o: '=' }]);
            try {
                const res = await SpaceConnector.client.identity.endpoint.list({
                    query: endpointQueryHelper.data,
                });
                modalState.endpoints = {
                    endpoints: res.results.map(d => `${d.service}: ${d.endpoint}`).join('\n'),
                };
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        watch(() => props.userId, async (after) => {
            if (after) {
                state.user = after;
                await listAPIKey(state.user);
            }
        }, { immediate: true });

        (async () => {
            await listAPIKey(state.user);
            await listEndpoints();
        })();

        return {
            ...toRefs(state),
            modalState,
            checkModalState,
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
</style>
