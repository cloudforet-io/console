<template>
    <general-page-layout>
        <p-page-navigation :routes="routes" />
        <p-page-title :title="$t('IDENTITY.USER.TITLE')" />
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
                    :key-item-sets="keyItemSets"
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
                            {{ $t('IDENTITY.USER.CREATE') }}
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
                            {{ $t('IDENTITY.USER.ACTION') }}
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
            <p-empty>{{ $t('IDENTITY.USER.NO_SELECTED') }}</p-empty>
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
/* eslint-disable camelcase */
import { map } from 'lodash';

import {
    ComponentRenderProxy,
    computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';

import GeneralPageLayout from '@/views/common/components/page-layout/GeneralPageLayout.vue';
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
import { Options } from '@/components/organisms/tables/query-search-table/type';
import { MenuItem } from '@/components/organisms/context-menu/type';
import { TabItem } from '@/components/organisms/tabs/tab/type';
import { Timestamp } from '@/components/util/type';

import { showErrorMessage, showSuccessMessage } from '@/lib/util';
import { SpaceConnector } from '@/lib/space-connector';
import { ApiQueryHelper } from '@/lib/space-connector/helper';
import { replaceUrlQuery } from '@/lib/router-query-string';
import { makeDistinctValueHandler } from '@/lib/component-utils/query-search';
import { getPageStart } from '@/lib/component-utils/pagination';
import PEmpty from '@/components/atoms/empty/PEmpty.vue';
import { store } from '@/store';
import { KeyItemSet } from '@/components/organisms/search/query-search/type';
import {userStateFormatter} from "@/views/identity/user/lib/helper";


interface UserModel {
    created_at: Timestamp;
    domain_id: string;
    email: string;
    group: string;
    language: string;
    last_accessed_at: Timestamp;
    mobile: string;
    name: string;
    roles: string[];
    state: string;
    tags: {};
    timezone: string;
    user_id: string;
}

export default {
    name: 'User',
    components: {
        PEmpty,
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
        const queryHelper = new ApiQueryHelper().setFiltersAsRawQueryString(vm.$route.query.filters);
        const handlers = {
            keyItemSets: [{
                title: 'Filters',
                items: [
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
            }],
            valueHandlerMap: {
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
            fields: computed(() => ([
                { name: 'user_id', label: 'User ID' },
                { name: 'name', label: 'Name' },
                { name: 'email', label: 'Email' },
                { name: 'state', label: 'State' },
                { name: 'mobile', label: 'Mobile' },
                { name: 'group', label: 'Group' },
                { name: 'language', label: 'Language' },
                { name: 'timezone', label: 'Timezone' },
            ])),
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
            isSelected: computed(() => state.selectedIndex.length > 0),
            multiSelectFields: computed(() => ([
                { name: 'user_id', label: vm.$t('IDENTITY.USER.USER_ID') },
                { name: 'name', label: vm.$t('IDENTITY.USER.NAME') },
                { name: 'email', label: vm.$t('IDENTITY.USER.EMAIL') },
                { name: 'group', label: vm.$t('IDENTITY.USER.GROUP') },
            ])),
            dropdownMenu: computed(() => ([
                {
                    type: 'item',
                    name: 'update',
                    label: vm.$t('IDENTITY.USER.UPDATE'),
                    disabled: state.selectedIndex.length > 1 || !state.isSelected,
                },
                {
                    type: 'item', name: 'delete', label: vm.$t('IDENTITY.USER.DELETE'), disabled: !state.isSelected,
                },
                { type: 'divider' },
                {
                    type: 'item', name: 'enable', label: vm.$t('IDENTITY.USER.ENABLE'), disabled: !state.isSelected,
                },
                {
                    type: 'item', name: 'disable', label: vm.$t('IDENTITY.USER.DISABLE'), disabled: !state.isSelected,
                },
            ] as MenuItem[])),
            keyItemSets: handlers.keyItemSets as KeyItemSet[],
            valueHandlerMap: handlers.valueHandlerMap,
            tags: queryHelper.setKeyItemSets(handlers.keyItemSets).queryTags,
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
            routes: computed(() => ([
                { name: vm.$t('MENU.IDENTITY.IDENTITY'), path: '/identity' },
                { name: vm.$t('MENU.IDENTITY.USER'), path: '/identity/user' },
            ])),
        });

        const singleItemTabState = reactive({
            tabs: computed(() => ([
                { name: 'detail', label: vm.$t('IDENTITY.USER.DETAILS'), keepAlive: true },
            ] as TabItem[])),
            activeTab: 'detail',
        });

        const multiItemTabState = reactive({
            tabs: computed(() => ([
                { name: 'data', label: vm.$t('IDENTITY.USER.SELECTED_DATA'), keepAlive: true },
            ] as TabItem[])),
            activeTab: 'data',
        });

        const apiQuery = new ApiQueryHelper();
        const getQuery = () => {
            apiQuery.setSort(state.sortBy, state.sortDesc)
                .setPage(getPageStart(state.thisPage, state.pageSize), state.pageSize)
                .setFilters(queryHelper.filters);
            return apiQuery.data;
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

        const onSelect = (index) => {
            state.selectedIndex = index;
        };

        const onChange = async (options: Options, changed: Partial<Options>) => {
            if (changed) {
                if (changed.pageSize !== undefined) state.pageSize = changed.pageSize;
                if (changed.thisPage !== undefined) state.thisPage = changed.thisPage;
                if (changed.queryTags !== undefined) {
                    state.tags = changed.queryTags;
                    queryHelper.setFiltersAsQueryTag(changed.queryTags);
                    replaceUrlQuery('filters', queryHelper.rawQueryStrings);
                }
            }
            await getUsers();
        };

        const clickAdd = () => {
            userFormState.visible = true;
            userFormState.updateMode = false;
            userFormState.headerTitle = vm.$t('IDENTITY.USER.FORM.ADD_TITLE') as string;
            userFormState.item = undefined;
        };
        const clickUpdate = () => {
            userFormState.visible = true;
            userFormState.updateMode = true;
            userFormState.headerTitle = vm.$t('IDENTITY.USER.FORM.UPDATE_TITLE') as string;
            userFormState.item = state.users[state.selectedIndex[0]];
            userFormState.visible = true;
        };
        const clickDelete = () => {
            modalState.mode = 'delete';
            modalState.title = vm.$t('IDENTITY.USER.DELETE_MODAL_TITLE') as string;
            modalState.subTitle = vm.$tc('IDENTITY.USER.DELETE_MODAL_DESC', state.selectedIndex.length);
            modalState.themeColor = 'alert';
            modalState.visible = true;
        };
        const clickEnable = () => {
            modalState.mode = 'enable';
            modalState.title = vm.$t('IDENTITY.USER.ENABLE_MODAL_TITLE') as string;
            modalState.subTitle = vm.$tc('IDENTITY.USER.ENABLE_MODAL_DESC', state.selectedIndex.length);
            modalState.themeColor = 'safe';
            modalState.visible = true;
        };
        const clickDisable = () => {
            modalState.mode = 'disable';
            modalState.title = vm.$t('IDENTITY.USER.DISABLE_MODAL_TITLE') as string;
            modalState.subTitle = vm.$tc('IDENTITY.USER.DISABLE_MODAL_DESC', state.selectedIndex.length);
            modalState.themeColor = 'alert';
            modalState.visible = true;
        };

        const getUsersParam = items => ({ users: map(items, 'user_id') });
        const addUser = async (item) => {
            try {
                await SpaceConnector.client.identity.user.create({
                    ...item,
                });
                showSuccessMessage(vm.$t('IDENTITY.USER.ALT_S_ADD_USER'), '', root);
            } catch (e) {
                showErrorMessage(vm.$t('IDENTITY.USER.ALT_E_ADD_USER'), e, root);
            }
            userFormState.visible = false;
        };
        const updateUser = async (item) => {
            try {
                await SpaceConnector.client.identity.user.update({
                    ...item,
                });
                if (store.state.user.userId === item.user_id) {
                    // await user.setUser('USER', item.user_id, vm);
                    await store.dispatch('user/setUser', 'USER', item.user_id);
                    vm.$i18n.locale = item.language;
                }
                showSuccessMessage(vm.$t('IDENTITY.USER.ALT_S_UPDATE_USER'), '', root);
            } catch (e) {
                showErrorMessage(vm.$t('IDENTITY.USER.ALT_E_UPDATE_USER'), e, root);
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
                showSuccessMessage(vm.$tc('IDENTITY.USER.ALT_S_DELETE_USER', state.selectedIndex.length), '', root);
            } catch (e) {
                showErrorMessage(vm.$tc('IDENTITY.USER.ALT_E_DELETE_USER', state.selectedIndex.length), e, root);
            } finally {
                await getUsers();
                modalState.visible = false;
            }
        };
        const enableUser = async (items) => {
            try {
                await parent.$http.post('/identity/user/enable', getUsersParam(items)).then(async () => {
                    showSuccessMessage(vm.$tc('IDENTITY.USER.ALT_S_ENABLE', state.selectedIndex.length), '', root);
                });
            } catch (e) {
                showErrorMessage(vm.$tc('IDENTITY.USER.ALT_E_ENABLE', state.selectedIndex.length), e, root);
            } finally {
                await getUsers();
                modalState.visible = false;
            }
        };
        const disableUser = async (items) => {
            try {
                await parent.$http.post('/identity/user/disable', getUsersParam(items)).then(async () => {
                    showSuccessMessage(vm.$tc('IDENTITY.USER.ALT_S_DISABLE', state.selectedIndex.length), '', root);
                });
            } catch (e) {
                showErrorMessage(vm.$tc('IDENTITY.USER.ALT_E_DISABLE', state.selectedIndex.length), e, root);
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
