<template>
    <general-page-layout>
        <p-page-navigation :routes="routes" />
        <p-page-title title="User" />
        <p-horizontal-layout>
            <template #container="{ height }">
                <p-query-search-table
                    :loading="loading"
                    :items="users"
                    :fields="fields"
                    :setting-visible="false"
                    :excel-visible="false"
                    :responsive="true"
                    :sort-by.sync="sortBy"
                    :sort-desc.sync="sortDesc"
                    :this-page.sync="thisPage"
                    :page-size.sync="pageSize"
                    :total-count="totalCount"
                    :key-items="keyItems"
                    :value-handler-map="valueHandlerMap"
                    :query-tags="tags"
                    :style="{'height': height+'px'}"
                    use-cursor-loading
                    @select="onSelect"
                    @change="onChange"
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
                            class="left-toolbox-item mr-4"
                            :menu="dropdownMenu"
                            @click-enable="clickEnable"
                            @click-disable="clickDisable"
                            @click-delete="clickDelete"
                            @click-update="clickUpdate"
                        >
                            Action
                        </p-dropdown-menu-btn>
                    </template>
                    <template #col-state-format="{value}">
                        <p-status v-bind="userStateFormatter(value)" />
                    </template>
                </p-query-search-table>
            </template>
        </p-horizontal-layout>
        <p-tab v-if="selectedIndex.length === 1" :tabs="singleItemTabState.tabs"
               :active-tab.sync="singleItemTabState.activeTab"
        >
            <template #detail>
                <p-user-detail ref="userDetail"
                               :item="selectedUsers[0]"
                />
            </template>
        </p-tab>
        <p-tab v-else-if="selectedIndex.length > 1" :tabs="multiItemTabState.tabs"
               :active-tab.sync="multiItemTabState.activeTab"
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
import PPageTitle from '@/components/organisms/title/page-title/PPageTitle.vue';
import PTab from '@/components/organisms/tabs/tab/PTab.vue';
import PQuerySearchTable from '@/components/organisms/tables/query-search-table/PQuerySearchTable.vue';
import PDataTable from '@/components/organisms/tables/data-table/PDataTable.vue';
import PHorizontalLayout from '@/components/organisms/layouts/horizontal-layout/PHorizontalLayout.vue';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/PDropdownMenuBtn.vue';
import PTableCheckModal from '@/components/organisms/modals/table-modal/PTableCheckModal.vue';
import PStatus from '@/components/molecules/status/PStatus.vue';
import PIconTextButton from '@/components/molecules/buttons/icon-text-button/PIconTextButton.vue';
import PPageNavigation from '@/components/molecules/page-navigation/PPageNavigation.vue';
import { showErrorMessage, showSuccessMessage, userStateFormatter } from '@/lib/util';
import { makeTrItems } from '@/lib/view-helper';
import { useStore } from '@/store/toolset';
import { QueryHelper, SpaceConnector } from '@/lib/space-connector';
import { queryStringToQueryTags, queryTagsToQueryString, replaceQuery } from '@/lib/router-query-string';
import { KeyItem } from '@/components/organisms/search/query-search/type';
import { Options } from '@/components/organisms/tables/query-search-table/type';
import { makeDistinctValueHandler } from '@/lib/component-utils/query-search';
import { getPageStart } from '@/lib/component-utils/pagination';
import { getFiltersFromQueryTags } from '@/lib/component-utils/query-search-tags';
import { Timestamp } from '@/components/util/type';

interface UserModel {
    // eslint-disable-next-line camelcase
    created_at: Timestamp;
    domain_id: string;
    email: string;
    group: string;
    language: string;
    // eslint-disable-next-line camelcase
    last_accessed_at: Timestamp;
    mobile: string;
    name: string;
    roles: string[];
    state: string;
    tags: {};
    timezone: string;
    // eslint-disable-next-line camelcase
    user_id: string;
}

export default {
    name: 'User',
    components: {
        PQuerySearchTable,
        PPageNavigation,
        PIconTextButton,
        GeneralPageLayout,
        PUserForm,
        PStatus,
        PHorizontalLayout,
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
        const handlers = {
            keyItems: [
                {
                    name: 'user_id',
                    label: 'User ID',
                },
                {
                    name: 'name',
                    label: 'Name',
                },
                {
                    name: 'group',
                    label: 'Group',
                },
                {
                    name: 'email',
                    label: 'E-mail',
                },
                {
                    name: 'mobile',
                    label: 'Phone',
                },
            ],
            valueHandlerMap: {
                // eslint-disable-next-line camelcase
                user_id: makeDistinctValueHandler('identity.User', 'user_id'),
                name: makeDistinctValueHandler('identity.User', 'name'),
                group: makeDistinctValueHandler('identity.User', 'group'),
                email: makeDistinctValueHandler('identity.User', 'email'),
                mobile: makeDistinctValueHandler('identity.User', 'mobile'),
            },
        };
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
            // selected
            selectedIndex: [],
            selectedUsers: computed(() => {
                const users = [] as UserModel[];
                state.selectedIndex.map(d => users.push(state.users[d]));
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
                ['update', 'BTN.UPDATE', { disabled: state.selectedIndex.length > 1 || state.selectedIndex.length === 0 }],
                ['delete', 'BTN.DELETE', { disabled: state.selectedIndex.length === 0 }],
                [null, null, { type: 'divider' }],
                ['enable', 'BTN.ENABLE', { disabled: state.selectedIndex.length === 0 }],
                ['disable', 'BTN.DISABLE', { disabled: state.selectedIndex.length === 0 }],
            ], parent, { type: 'item', disabled: true }))),
            keyItems: handlers.keyItems as KeyItem[],
            valueHandlerMap: handlers.valueHandlerMap,
            tags: queryStringToQueryTags(vm.$route.query.filters, handlers.keyItems),
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
            item: undefined,
        });
        const routeState = reactive({
            routes: [{ name: 'Identity', path: '/identity' }, { name: 'User', path: '/identity/user' }],
        });

        const singleItemTabState = reactive({
            tabs: computed(() => makeTrItems([
                ['detail', 'COMMON.DETAILS', { keepAlive: true }],
            ], parent)),
            activeTab: 'detail',
        });

        const multiItemTabState = reactive({
            tabs: makeTrItems([
                ['data', 'TAB.SELECTED_DATA', { keepAlive: true }],
            ], parent),
            activeTab: 'data',
        });

        const getQuery = () => {
            const { andFilters, orFilters, keywords } = getFiltersFromQueryTags(state.tags);
            const query = new QueryHelper();
            query.setSort(state.sortBy, state.sortDesc)
                .setPage(getPageStart(state.thisPage, state.pageSize), state.pageSize)
                .setFilter(...andFilters)
                .setFilterOr(...orFilters)
                .setKeyword(...keywords);
            return query.data;
        };

        const getUsers = async () => {
            state.loading = true;
            try {
                const res = await SpaceConnector.client.identity.user.list({
                    query: getQuery(),
                    only: ['user_id', 'name', 'email', 'state', 'mobile', 'group', 'timezone', 'language'],
                });
                state.users = res.results;
                state.totalCount = res.total_count;
                state.loading = false;
            } catch (e) {
                console.error(e);
                state.items = [];
                state.totalCount = 0;
            } finally {
                state.loading = false;
            }
        };

        const changeQueryString = async (options) => {
            await replaceQuery('filters', queryTagsToQueryString(options.queryTags));
        };

        const onSelect = (index) => {
            state.selectedIndex = index;
        };

        const onChange = async (options: Options, changed: Partial<Options>) => {
            if (changed) {
                if (changed.pageSize !== undefined) state.pageSize = changed.pageSize;
                if (changed.thisPage !== undefined) state.thisPage = changed.thisPage;
                if (changed.queryTags !== undefined) {
                    state.tags = changed.queryTags;
                    replaceQuery('filters', queryTagsToQueryString(changed.queryTags));
                }
            }
            await getUsers();
        };

        const clickAdd = () => {
            userFormState.visible = true;
            userFormState.updateMode = false;
            userFormState.headerTitle = 'Add User';
            userFormState.item = undefined;
        };
        const clickUpdate = () => {
            userFormState.visible = true;
            userFormState.updateMode = true;
            userFormState.headerTitle = 'Update User';
            userFormState.item = state.users[state.selectedIndex[0]];
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

        const getUsersParam = items => ({ users: map(items, 'user_id') });
        const addUser = async (item) => {
            try {
                await SpaceConnector.client.identity.user.create({
                    ...item,
                });
                showSuccessMessage('Success', 'User has been successfully added.', root);
            } catch (e) {
                showErrorMessage('Fail to Add User', e, root);
            }
            userFormState.visible = false;
        };
        const updateUser = async (item) => {
            try {
                await SpaceConnector.client.identity.user.update({
                    ...item,
                });
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
        const deleteUser = async (items) => {
            try {
                await SpaceConnector.client.identity.user.delete(getUsersParam(items));
                showSuccessMessage('Success', 'Success to Delete Users', root);
            } catch (e) {
                showErrorMessage('Fail to Delete User', e, root);
            } finally {
                await getUsers();
                modalState.visible = false;
            }
        };
        const enableUser = async (items) => {
            try {
                await parent.$http.post('/identity/user/enable', getUsersParam(items)).then(async () => {
                    showSuccessMessage('Success', 'enable users', root);
                });
            } catch (error) {
                showErrorMessage('Fail to Enable User', error, root);
            } finally {
                await getUsers();
                modalState.visible = false;
            }
        };
        const disableUser = async (items) => {
            try {
                await parent.$http.post('/identity/user/disable', getUsersParam(items)).then(async () => {
                    showSuccessMessage('Success to Disable User', 'disable users', root);
                });
            } catch (e) {
                showErrorMessage('Fail to Disable User', e, root);
            } finally {
                await getUsers();
                modalState.visible = false;
            }
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
            singleItemTabState,
            multiItemTabState,
            getUsers,
            clickAdd,
            clickUpdate,
            clickDelete,
            clickEnable,
            clickDisable,
            userFormConfirm,
            checkModalConfirm,
            onSelect,
            onChange,
            changeQueryString,
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
