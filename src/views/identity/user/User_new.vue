<template>
    <general-page-layout>
        <p-page-navigation :routes="route" />
        <p-page-title title="User" />
        <p-horizontal-layout>
            <template #container="{ height }">
                <p-toolbox-table
                    ref="toolbox"
                    :items="apiHandler.tableTS.state.items"
                    :fields="fields"
                    selectable
                    sortable
                    hover
                    :setting-visible="false"
                    :responsive="true"
                    :sort-by.sync="apiHandler.tableTS.syncState.sortBy"
                    :sort-desc.sync="apiHandler.tableTS.syncState.sortDesc"
                    :all-page="apiHandler.tableTS.state.allPage"
                    :this-page.sync="apiHandler.tableTS.syncState.thisPage"
                    :select-index.sync="apiHandler.tableTS.syncState.selectIndex"
                    :page-size.sync="apiHandler.tableTS.syncState.pageSize"
                    :style="{'height': height+'px'}"
                    use-cursor-loading
                    @changePageSize="apiHandler.getData()"
                    @changePageNumber="apiHandler.getData()"
                    @clickRefresh="apiHandler.getData()"
                    @changeSort="apiHandler.getData()"
                >
                    <template slot="toolbox-left">
                        <p-icon-text-button style-type="primary-dark"
                                            name="ic_plus_bold"
                                            @click="clickAdd"
                        >
                            {{ $t('BTN.CREATE') }}
                        </p-icon-text-button>
                        <p-dropdown-menu-btn
                            id="dropdown-btn"
                            class="left-toolbox-item"
                            :menu="dropdownMenu"
                            @click-enable="clickEnable"
                            @click-disable="clickDisable"
                            @click-delete="clickDelete"
                            @click-update="clickUpdate"
                        >
                            Action
                        </p-dropdown-menu-btn>
                        <div class="left-toolbox-item hidden lg:block">
                            <p-autocomplete-search v-model="searchText"
                                                   :handler="autocompleteHandler"
                                                   @search="onSearch"
                            />
                        </div>
                    </template>
                    <template #toolbox-bottom>
                        <div class="flex flex-col flex-1">
                            <p-autocomplete-search v-model="searchText"
                                                   class="block lg:hidden mt-4"
                                                   :handler="autocompleteHandler"
                                                   @search="onSearch"
                            />
                        </div>
                    </template>
                    <template #col-state-format="{value}">
                        <p-status v-bind="userStateFormatter(value)" />
                    </template>
                </p-toolbox-table>
            </template>
        </p-horizontal-layout>
        <p-tab v-if="apiHandler.tableTS.selectState.isSelectOne" :tabs="singleItemTab.state.tabs"
               :active-tab.sync="singleItemTab.syncState.activeTab"
        >
            <template #detail>
                <p-user-detail ref="userDetail"
                               :item="apiHandler.tableTS.selectState.firstSelectItem"
                />
            </template>
            <template #summary>
                <p-user-detail ref="userDetail"
                               :item="apiHandler.tableTS.selectState.firstSelectItem"
                />
            </template>
        </p-tab>
        <p-tab v-else-if="apiHandler.tableTS.selectState.isSelectMulti" :tabs="multiItemTab.state.tabs"
               :active-tab.sync="multiItemTab.syncState.activeTab"
        >
            <template #data>
                <p-data-table
                    :fields="multiSelectFields"
                    :sortable="false"
                    :selectable="false"
                    :items="apiHandler.tableTS.selectState.selectItems"
                    :col-copy="true"
                />
            </template>
        </p-tab>

        <div v-else id="empty-space">
            Select a User above for details.
        </div>
        <p-table-check-modal
            v-if="!!checkTableModalState.mode"
            :visible.sync="checkTableModalState.visible"
            :header-title="checkTableModalState.title"
            :sub-title="checkTableModalState.subTitle"
            :theme-color="checkTableModalState.themeColor"
            :fields="multiSelectFields"
            size="lg"
            :centered="true"
            :selectable="false"
            :items="apiHandler.tableTS.selectState.selectItems"
            @confirm="checkModalConfirm"
        />
        <p-user-form v-if="userFormState.visible"
                     :header-title="userFormState.headerTitle"
                     :update-mode="userFormState.updateMode"
                     :item="userFormState.item"
                     :visible.sync="userFormState.visible"
                     @confirm="userFormConfirm"
        />
    </general-page-layout>
</template>

<script lang="ts">
import {
    reactive, toRefs, ref, computed,
} from '@vue/composition-api';
import PStatus from '@/components/molecules/status/PStatus.vue';
import {
    getValue, userStateFormatter, showErrorMessage,
} from '@/lib/util';
import { map } from 'lodash';
import { makeTrItems } from '@/lib/view-helper';
import PUserForm from '@/views/identity/user/modules/UserForm.vue';
import GeneralPageLayout from '@/views/containers/page-layout/GeneralPageLayout.vue';
import PIconTextButton from '@/components/molecules/buttons/icon-text-button/PIconTextButton.vue';
import PPageTitle from '@/components/organisms/title/page-title/PPageTitle.vue';
import {
    SearchTableFluentAPI,
} from '@/lib/api/table';
import {
    TabBarState,
} from '@/components/molecules/tabs/tab-bar/PTabBar.toolset';
import { fluentApi } from '@/lib/fluent-api';
import PPageNavigation from '@/components/molecules/page-navigation/PPageNavigation.vue';
import {
    makeAutocompleteHandlerWithReference,
} from '@/lib/component-utils/query-search';
import PAutocompleteSearch from '@/components/organisms/search/autocomplete-search/PAutocompleteSearch.vue';

const PTab = () => import('@/components/organisms/tabs/tab/PTab.vue');
const PDataTable = () => import('@/components/organisms/tables/data-table/PDataTable.vue');
const PHorizontalLayout = () => import('@/components/organisms/layouts/horizontal-layout/PHorizontalLayout.vue');
const PToolboxTable = () => import('@/components/organisms/tables/toolbox-table/PToolboxTable.vue');
const PDropdownMenuBtn = () => import('@/components/organisms/dropdown/dropdown-menu-btn/PDropdownMenuBtn.vue');
const PUserDetail = () => import('@/views/identity/user/modules/UserDetail.vue');
const PTableCheckModal = () => import('@/components/organisms/modals/action-modal/PActionConfirmModal.vue');


export default {
    name: 'UserTemplate',
    filters: {
        getValue,
    },
    components: {
        PAutocompleteSearch,
        PPageNavigation,
        PIconTextButton,
        GeneralPageLayout,
        PUserForm,
        PStatus,
        PHorizontalLayout,
        PToolboxTable,
        PDropdownMenuBtn,
        PUserDetail,
        PTab,
        PDataTable,
        PTableCheckModal,
        PPageTitle,
    },
    setup(props, context) {
        const state = reactive({
            fields: computed(() => [
                ...makeTrItems([
                    ['user_id', 'COMMON.USER_ID'],
                    ['name', 'COMMON.NAME'],
                    ['email', 'COMMON.EMAIL'],
                    ['state', 'COMMON.STATE'],
                    ['mobile', 'COMMON.PHONE', { sortable: false }],
                    ['group', 'COMMON.GROUP'],
                    ['language', 'COMMON.LANGUAGE'],
                    ['timezone', 'COMMON.TIMEZONE'],
                ], null),
            ]),
            multiSelectFields: computed(() => [
                ...makeTrItems([
                    ['user_id', 'COMMON.USER_ID'],
                    ['name', 'COMMON.NAME'],
                    ['email', 'COMMON.EMAIL'],
                    ['group', 'COMMON.GROUP'],
                ], null),
            ]),
            selectIndex: [],
            sortBy: '',
            sortDesc: '',
            pageSize: 10,
            thisPage: 1,
            allPage: computed(() => Math.ceil(state.totalCount / state.pageSize) || 1),
            items: [],
            searchText: '',
            loading: false,
            toolbox: null,
        });

        const routeState = reactive({
            route: [{ name: 'Identity', path: '/identity' }, { name: 'User', path: '/identity/user' }],
        });

        /**
             * Handling API
             * * */
        const userApi = fluentApi.identity().user();
        const userListApi = fluentApi.identity().user().list()
            .setPageSize(state.pageSize)
            .setThisPage(state.thisPage)
            .setSortBy(state.sortBy)
            .setSortDesc(state.sortDesc);

        const apiHandler = new SearchTableFluentAPI(
            userListApi,
            {
                selectable: true,
                sortable: true,
                hover: true,
                responsive: true,
                settingVisible: false,
                userCursorLoading: true,
            }, undefined,
        );

        const searchText = ref('');
        const autocompleteHandler = makeAutocompleteHandlerWithReference('identity.User');
        const onSearch = async (val?: string) => {
            apiHandler.tableTS.searchText.value = val || '';
            await apiHandler.getData();
        };

        apiHandler.getData();

        /**
             * Tab data / State
             * */

        const singleItemTab = new TabBarState(
            {
                tabs: computed(() => makeTrItems([
                    ['detail', 'COMMON.DETAILS', { keepAlive: true }],
                ],
                context.parent)),
            },
            {
                activeTab: 'detail',
            },
        );
        const multiItemTab = new TabBarState(
            {
                tabs: makeTrItems([
                    ['data', 'TAB.SELECTED_DATA', { keepAlive: true }],
                ], context.parent),
            },
            {
                activeTab: 'data',
            },
        );

        /**
             Dropdown Menu
             */
        const isNotSelected = computed(() => apiHandler.tableTS.selectState.isNotSelected);
        const dropdownMenu = reactive({
            ...makeTrItems([
                ['update', 'BTN.UPDATE', { disabled: isNotSelected || apiHandler.tableTS.selectState.isSelectMulti }],
                ['delete', 'BTN.DELETE', { disabled: isNotSelected }],
                [null, null, { type: 'divider' }],
                ['enable', 'BTN.ENABLE', { disabled: isNotSelected }],
                ['disable', 'BTN.DISABLE', { disabled: isNotSelected }],
            ],
            context.parent,
            { type: 'item', disabled: true }),
        });


        /**
             * Handling Forms
             */
        const userFormState = reactive({
            visible: false,
            updateMode: false,
            headerTitle: '',
            item: null,
        });
        const clickAdd = () => {
            userFormState.visible = true;
            userFormState.updateMode = false;
            userFormState.headerTitle = 'Add User';
            userFormState.item = null;
        };
        const addUser = async (item) => {
            try {
                await fluentApi.identity().user().create().setParameter({
                    ...item,
                })
                    .execute();
                context.root.$notify({
                    group: 'noticeTopRight',
                    type: 'success',
                    title: 'Success',
                    text: 'User has been successfully added.',
                    duration: 2000,
                    speed: 1000,
                });
            } catch (e) {
                showErrorMessage('Fail to Add User', e, context.root);
            }
            userFormState.visible = false;
        };
        const clickUpdate = () => {
            userFormState.visible = true;
            userFormState.updateMode = true;
            userFormState.headerTitle = 'Update User';
            const item = apiHandler.tableTS.selectState.firstSelectItem;
            userFormState.item = item;
            userFormState.visible = true;
        };
        const updateUser = async (item) => {
            try {
                await fluentApi.identity().user().update().setParameter({
                    ...item,
                })
                    .execute();
                context.root.$notify({
                    group: 'noticeTopRight',
                    type: 'success',
                    title: 'Success',
                    text: 'User has been successfully updated.',
                    duration: 2000,
                    speed: 1000,
                });
            } catch (e) {
                showErrorMessage('Fail to Update User', e, context.root);
            }
            userFormState.visible = false;
        };

        const userFormConfirm = async (item) => {
            if (userFormState.updateMode) {
                await updateUser(item);
            } else {
                await addUser(item);
            }
        };
        const checkTableModalState = reactive({
            visible: false,
            mode: '',
            item: null,
            title: '',
            subTitle: '',
            themeColor: '',
        });


        const checkModalConfirm = async (item) => {
            if (checkTableModalState.mode === 'enable') await enableUser(item);
            if (checkTableModalState.mode === 'disable') await disableUser(item);
            if (checkTableModalState.mode === 'delete') await deleteUser(item);
        };
        const getUsersParam = (items) => {
            const result = { users: map(items, 'user_id') };
            return result;
        };

        const clickEnable = () => {
            checkTableModalState.mode = 'enable';
            checkTableModalState.title = 'Enable User';
            checkTableModalState.subTitle = 'Are you sure you want to Enable selected User(s) below?';
            checkTableModalState.themeColor = 'safe';
            checkTableModalState.visible = true;
        };

        const enableUser = async (items) => {
            try {
                await context.parent.$http.post('/identity/user/enable', getUsersParam(items)).then(async (_) => {
                    context.root.$notify({
                        group: 'noticeTopRight',
                        type: 'success',
                        title: 'success',
                        text: 'enable users',
                        duration: 2000,
                        speed: 1000,
                    });
                });
            } catch (error) {
                showErrorMessage('Fail to Enable User', error, context.root);
            }
            await apiHandler.getData();
            checkTableModalState.visible = false;
        };

        const clickDisable = () => {
            checkTableModalState.mode = 'disable';
            checkTableModalState.title = 'User Disable';
            checkTableModalState.subTitle = 'Are you sure you want to Disable selected User(s) below?';
            checkTableModalState.themeColor = 'alert';
            checkTableModalState.visible = true;
        };

        const disableUser = async (items) => {
            try {
                await context.parent.$http.post('/identity/user/disable', getUsersParam(items)).then(async (_) => {
                    // await userListApi.execute();
                    context.root.$notify({
                        group: 'noticeTopRight',
                        type: 'success',
                        title: 'success',
                        text: 'disable users',
                        duration: 2000,
                        speed: 1000,
                    });
                });
            } catch (e) {
                showErrorMessage('Fail to Disable User', e, context.root);
            }
            await apiHandler.getData();
            checkTableModalState.visible = false;
        };

        const clickDelete = () => {
            checkTableModalState.mode = 'delete';
            checkTableModalState.title = 'User Delete';
            checkTableModalState.subTitle = 'Are you sure you want to delete selected User(s) below?';
            checkTableModalState.themeColor = 'alert';
            checkTableModalState.visible = true;
        };

        const deleteUser = async (items) => {
            try {
                await context.parent.$http.post('/identity/user/delete', getUsersParam(items)).then(async (_) => {
                    // await userListApi.execute();
                    context.root.$notify({
                        group: 'noticeTopRight',
                        type: 'success',
                        title: 'success',
                        text: 'delete users',
                        duration: 2000,
                        speed: 1000,
                    });
                });
            } catch (e) {
                showErrorMessage('Fail to Delete User', e, context.root);
            }
            await apiHandler.getData();
            checkTableModalState.visible = false;
        };


        return {
            ...toRefs(state),
            ...toRefs(routeState),
            ...toRefs(dropdownMenu),
            userFormState,
            userStateFormatter,
            checkTableModalState,
            apiHandler,
            singleItemTab,
            multiItemTab,
            dropdownMenu,
            clickAdd,
            clickUpdate,
            userFormConfirm,
            checkModalConfirm,
            clickEnable,
            enableUser,
            clickDisable,
            disableUser,
            clickDelete,
            deleteUser,
            searchText,
            autocompleteHandler,
            onSearch,
        };
    },
};


</script>

<style lang="postcss" scoped>
    .left-toolbox-item {
        margin-left: 1rem;
        &:last-child {
            flex-grow: 1;
        }
    }

    #empty-space {
        @apply text-primary2 mt-6;
        text-align: center;
        margin-bottom: 0.5rem;
        font-size: 1.5rem;
    }
</style>
