<template>
    <general-page-layout>
        <p-page-navigation :routes="routes" />
        <p-page-title title="User" />
        <p-horizontal-layout>
            <template #container="{ height }">
                <p-toolbox-table
                    :loading="loading"
                    :items="users"
                    :fields="fields"
                    selectable
                    sortable
                    hover
                    :setting-visible="false"
                    :responsive="true"
                    :sort-by.sync="sortBy"
                    :sort-desc.sync="sortDesc"
                    :all-page="allPage"
                    :this-page.sync="thisPage"
                    :select-index.sync="selectedIndexes"
                    :page-size.sync="pageSize"
                    :style="{'height': height+'px'}"
                    use-cursor-loading
                    @changePageSize="getUsers"
                    @changePageNumber="getUsers"
                    @clickRefresh="getUsers"
                    @changeSort="getUsers"
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
                                                   @search="getUsers"
                            />
                        </div>
                    </template>
                    <template #toolbox-bottom>
                        <div class="flex flex-col flex-1">
                            <p-autocomplete-search v-model="searchText"
                                                   class="block lg:hidden mt-4"
                                                   :handler="autocompleteHandler"
                                                   @search="getUsers"
                            />
                        </div>
                    </template>
                    <template #col-state-format="{value}">
                        <p-status v-bind="userStateFormatter(value)" />
                    </template>
                </p-toolbox-table>
            </template>
        </p-horizontal-layout>
        <p-tab v-if="selectedIndexes.length === 1" :tabs="singleItemTab.state.tabs"
               :active-tab.sync="singleItemTab.syncState.activeTab"
        >
            <template #detail>
                <p-user-detail ref="userDetail"
                               :item="selectedUsers[0]"
                />
            </template>
        </p-tab>
        <p-tab v-else-if="selectedIndexes.length > 1" :tabs="multiItemTab.state.tabs"
               :active-tab.sync="multiItemTab.syncState.activeTab"
        >
            <template #data>
                <p-data-table
                    :fields="multiSelectFields"
                    :sortable="false"
                    :selectable="false"
                    :items="selectedUsers"
                    :col-copy="true"
                />
            </template>
        </p-tab>

        <div v-else id="empty-space">
            Select a User above for details.
        </div>
        <p-table-check-modal
            v-if="!!modalState.mode"
            :visible.sync="modalState.visible"
            :header-title="modalState.title"
            :sub-title="modalState.subTitle"
            :theme-color="modalState.themeColor"
            :fields="multiSelectFields"
            size="lg"
            :centered="true"
            :selectable="false"
            :items="selectedUsers"
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
import { map } from 'lodash';

import {
    ComponentRenderProxy,
    computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';

import GeneralPageLayout from '@/views/containers/page-layout/GeneralPageLayout.vue';
import PUserForm from '@/views/identity/user/modules/UserForm.vue';
import PUserDetail from '@/views/identity/user/modules/UserDetail.vue';
import PAutocompleteSearch from '@/components/organisms/search/autocomplete-search/PAutocompleteSearch.vue';
import PPageTitle from '@/components/organisms/title/page-title/PPageTitle.vue';
import PTab from '@/components/organisms/tabs/tab/PTab.vue';
import PDataTable from '@/components/organisms/tables/data-table/PDataTable.vue';
import PHorizontalLayout from '@/components/organisms/layouts/horizontal-layout/PHorizontalLayout.vue';
import PToolboxTable from '@/components/organisms/tables/toolbox-table/PToolboxTable.vue';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/PDropdownMenuBtn.vue';
import PTableCheckModal from '@/components/organisms/modals/table-modal/PTableCheckModal.vue';
import PStatus from '@/components/molecules/status/PStatus.vue';
import PIconTextButton from '@/components/molecules/buttons/icon-text-button/PIconTextButton.vue';
import PPageNavigation from '@/components/molecules/page-navigation/PPageNavigation.vue';

import { TabBarState } from '@/components/molecules/tabs/tab-bar/PTabBar.toolset';

import { showErrorMessage, showSuccessMessage, userStateFormatter } from '@/lib/util';
import { makeAutocompleteHandlerWithReference } from '@/lib/component-utils/query-search';
import { makeTrItems } from '@/lib/view-helper';
import { fluentApi, Tags, TimeStamp } from '@/lib/fluent-api';
import { useStore } from '@/store/toolset';

interface UserModel {
    // eslint-disable-next-line camelcase
    created_at: TimeStamp;
    domain_id: string;
    email: string;
    group: string;
    language: string;
    // eslint-disable-next-line camelcase
    last_accessed_at: TimeStamp;
    mobile: string;
    name: string;
    roles: string[];
    state: string;
    tags: Tags;
    timezone: string;
    // eslint-disable-next-line camelcase
    user_id: string;
}

export default {
    name: 'User',
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
    setup(props, { root, parent }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const { user } = useStore();
        const state = reactive({
            loading: false,
            users: [] as UserModel[],
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
            sortBy: '',
            sortDesc: '',
            pageSize: 15,
            thisPage: 1,
            totalCount: 0,
            allPage: computed(() => Math.ceil(state.totalCount / state.pageSize) || 1),
            // selected
            selectedIndexes: [],
            selectedUsers: computed(() => {
                const users = [] as UserModel[];
                state.selectedIndexes.map(d => users.push(state.users[d]));
                return users;
            }),
            multiSelectFields: computed(() => [
                ...makeTrItems([
                    ['user_id', 'COMMON.USER_ID'],
                    ['name', 'COMMON.NAME'],
                    ['email', 'COMMON.EMAIL'],
                    ['group', 'COMMON.GROUP'],
                ], null),
            ]),
            dropdownMenu: computed(() => (makeTrItems([
                ['update', 'BTN.UPDATE', { disabled: state.selectedIndexes.length > 1 || state.selectedIndexes.length === 0 }],
                ['delete', 'BTN.DELETE', { disabled: state.selectedIndexes.length === 0 }],
                [null, null, { type: 'divider' }],
                ['enable', 'BTN.ENABLE', { disabled: state.selectedIndexes.length === 0 }],
                ['disable', 'BTN.DISABLE', { disabled: state.selectedIndexes.length === 0 }],
            ], parent, { type: 'item', disabled: true }))),
            //
            autocompleteHandler: makeAutocompleteHandlerWithReference('identity.User'),
            searchText: '',
        });
        const modalState = reactive({
            visible: false,
            mode: '',
            title: '',
            subTitle: '',
            themeColor: '',
        });
        const userFormState = reactive({
            visible: false,
            updateMode: false,
            headerTitle: '',
            item: null,
        });
        const routeState = reactive({
            routes: [{ name: 'Identity', path: '/identity' }, { name: 'User', path: '/identity/user' }],
        });

        const singleItemTab = new TabBarState(
            {
                tabs: computed(() => makeTrItems([
                    ['detail', 'COMMON.DETAILS', { keepAlive: true }],
                ],
                parent)),
            },
            {
                activeTab: 'detail',
            },
        );
        const multiItemTab = new TabBarState(
            {
                tabs: makeTrItems([
                    ['data', 'TAB.SELECTED_DATA', { keepAlive: true }],
                ], parent),
            },
            {
                activeTab: 'data',
            },
        );

        const getUsers = async () => {
            state.loading = true;
            const res = await fluentApi.identity().user().list()
                .setPageSize(state.pageSize)
                .setThisPage(state.thisPage)
                .setSortBy(state.sortBy)
                .setSortDesc(state.sortDesc)
                .setKeyword(state.searchText)
                .setOnly('user_id', 'name', 'email',
                    'state', 'mobile', 'group', 'timezone', 'language')
                .execute();
            state.users = res.data.results;
            state.totalCount = res.data.total_count;
            state.loading = false;
        };

        const clickAdd = () => {
            userFormState.visible = true;
            userFormState.updateMode = false;
            userFormState.headerTitle = 'Add User';
            userFormState.item = null;
        };
        const clickUpdate = () => {
            userFormState.visible = true;
            userFormState.updateMode = true;
            userFormState.headerTitle = 'Update User';
            userFormState.item = state.users[state.selectedIndexes[0]];
            userFormState.visible = true;
        };
        const clickDelete = () => {
            modalState.mode = 'delete';
            modalState.title = 'User Delete';
            modalState.subTitle = 'Are you sure you want to delete selected User(s) below?';
            modalState.themeColor = 'alert';
            modalState.visible = true;
        };
        const clickEnable = () => {
            modalState.mode = 'enable';
            modalState.title = 'Enable User';
            modalState.subTitle = 'Are you sure you want to Enable selected User(s) below?';
            modalState.themeColor = 'safe';
            modalState.visible = true;
        };
        const clickDisable = () => {
            modalState.mode = 'disable';
            modalState.title = 'User Disable';
            modalState.subTitle = 'Are you sure you want to Disable selected User(s) below?';
            modalState.themeColor = 'alert';
            modalState.visible = true;
        };

        const addUser = async (item) => {
            try {
                await fluentApi.identity().user().create().setParameter({ ...item })
                    .execute();
                showSuccessMessage('Success', 'User has been successfully added.', root);
            } catch (e) {
                showErrorMessage('Fail to Add User', e, root);
            }
            userFormState.visible = false;
        };
        const updateUser = async (item) => {
            try {
                await fluentApi.identity().user().update().setParameter({ ...item })
                    .execute();
                if (user.state.userId === item.user_id) {
                    await user.setUser('USER', item.user_id, vm);
                    vm.$i18n.locale = item.language;
                }
                showSuccessMessage('Success', 'User has been successfully updated.', root);
            } catch (e) {
                showErrorMessage('Fail to Update User', e, root);
            }
            userFormState.visible = false;
        };
        const userFormConfirm = async (item) => {
            if (userFormState.updateMode) {
                await updateUser(item);
            } else {
                await addUser(item);
            }
            await getUsers();
        };

        const getUsersParam = items => ({ users: map(items, 'user_id') });
        const deleteUser = async (items) => {
            try {
                await parent.$http.post('/identity/user/delete', getUsersParam(items)).then(async () => {
                    await getUsers();
                    showSuccessMessage('Success', 'delete users', root);
                });
            } catch (e) {
                showErrorMessage('Fail to Delete User', e, root);
            }
            await getUsers();
            modalState.visible = false;
        };
        const enableUser = async (items) => {
            try {
                await parent.$http.post('/identity/user/enable', getUsersParam(items)).then(async () => {
                    showSuccessMessage('Success', 'enable users', root);
                });
            } catch (error) {
                showErrorMessage('Fail to Enable User', error, root);
            }
            await getUsers();
            modalState.visible = false;
        };
        const disableUser = async (items) => {
            try {
                await parent.$http.post('/identity/user/disable', getUsersParam(items)).then(async () => {
                    showSuccessMessage('Success', 'disable users', root);
                });
            } catch (e) {
                showErrorMessage('Fail to Disable User', e, root);
            }
            await getUsers();
            modalState.visible = false;
        };
        const checkModalConfirm = async (item) => {
            if (modalState.mode === 'delete') await deleteUser(item);
            if (modalState.mode === 'enable') await enableUser(item);
            if (modalState.mode === 'disable') await disableUser(item);
        };

        const init = async () => {
            await getUsers();
        };
        init();

        return {
            ...toRefs(state),
            ...toRefs(routeState),
            userFormState,
            userStateFormatter,
            modalState,
            singleItemTab,
            multiItemTab,
            getUsers,
            clickAdd,
            clickUpdate,
            clickDelete,
            clickEnable,
            clickDisable,
            userFormConfirm,
            checkModalConfirm,
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
