<template>
    <div class="right-contents-container">
        <p-page-navigation :routes="routes" />
        <p-page-title :title="$t('IDENTITY.USER.MAIN.USER_MANAGEMENT')"
                      use-total-count use-selected-count
                      :total-count="totalCount"
                      :selected-count="selectedIndex.length"
        />
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
                            {{ $t('IDENTITY.USER.MAIN.CREATE') }}
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
                            {{ $t('IDENTITY.USER.MAIN.ACTION') }}
                        </p-dropdown-menu-btn>
                    </template>
                    <template #col-state-format="{value}">
                        <p-status v-bind="userStateFormatter(value)" class="capitalize" />
                    </template>
                    <template #col-user_type-format="{value}">
                        <span v-if="value === 'API_USER'">API Only</span>
                        <span v-else>Console, API</span>
                    </template>
                    <template #col-last_accessed_at-format="{ value }">
                        <span v-if="value === 0">
                            {{$t('IDENTITY.USER.MAIN.TODAY')}}
                        </span>
                        <span v-else-if="value === 1">
                            {{$t('IDENTITY.USER.MAIN.YESTERDAY')}}
                        </span>
                        <span v-else>
                            {{ value }} {{$t('IDENTITY.USER.MAIN.DAYS')}}
                        </span>
                    </template>
                </p-query-search-table>
            </template>
        </p-horizontal-layout>
        <p-tab v-if="selectedIndex.length === 1" :tabs="singleItemTabState.tabs"
               :active-tab.sync="singleItemTabState.activeTab"
        >
            <template #detail>
                <user-detail ref="userDetail"
                             :user-id="selectedUsers[0].user_id"
                             :timezone="timezone"
                />
            </template>
            <template #tag>
                <p-tags-panel :resource-id="selectedUsers[0].user_id"
                              resource-type="identity.User"
                              resource-key="user_id"
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
                    class="selected-data-tab"
                />
            </template>
        </p-tab>
        <div v-else id="empty-space">
            <p-empty>{{ $t('IDENTITY.USER.MAIN.NO_SELECTED') }}</p-empty>
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
        <user-form v-if="userFormState.visible"
                   :header-title="userFormState.headerTitle"
                   :update-mode="userFormState.updateMode"
                   :item="userFormState.item"
                   :visible.sync="userFormState.visible"
                   @confirm="userFormConfirm"
        />
    </div>
</template>

<script lang="ts">
import PEmpty from '@/components/atoms/empty/PEmpty.vue';
import PQuerySearchTable from '@/components/organisms/tables/query-search-table/PQuerySearchTable.vue';
import PPageNavigation from '@/components/molecules/page-navigation/PPageNavigation.vue';
import PIconTextButton from '@/components/molecules/buttons/icon-text-button/PIconTextButton.vue';
import UserForm from '@/views/identity/user/modules/UserForm.vue';
import PStatus from '@/components/molecules/status/PStatus.vue';
import PHorizontalLayout from '@/components/organisms/layouts/horizontal-layout/PHorizontalLayout.vue';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/PDropdownMenuBtn.vue';
import UserDetail from '@/views/identity/user/modules/UserDetail.vue';
import PTab from '@/components/organisms/tabs/tab/PTab.vue';
import PTagsPanel from '@/views/common/components/tags/TagsPanel.vue';
import PDataTable from '@/components/organisms/tables/data-table/PDataTable.vue';
import PTableCheckModal from '@/components/organisms/modals/table-modal/PTableCheckModal.vue';
import PPageTitle from '@/components/organisms/title/page-title/PPageTitle.vue';
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import { ApiQueryHelper } from '@/lib/space-connector/helper';
import { makeDistinctValueHandler } from '@/lib/component-utils/query-search';
import { store } from '@/store';
import { MenuItem } from '@/components/organisms/context-menu/type';
import { KeyItemSet } from '@/components/organisms/search/query-search/type';
import { TabItem } from '@/components/organisms/tabs/tab/type';
import { getPageStart } from '@/lib/component-utils/pagination';
import { SpaceConnector } from '@/lib/space-connector';
import { calculateTime, userStateFormatter } from '@/views/identity/user/lib/helper';
import dayjs from 'dayjs';
import { Options } from '@/components/organisms/tables/query-search-table/type';
import { replaceUrlQuery } from '@/lib/router-query-string';
import { map } from 'lodash';
import { showErrorMessage, showSuccessMessage, timestampFormatter } from '@/lib/util';
import { Timestamp } from '@/components/util/type';

interface UserModel {
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
    user_id: string;
}

export default {
    name: 'UserManagement',
    components: {
        PEmpty,
        PQuerySearchTable,
        PPageNavigation,
        PIconTextButton,
        UserForm,
        PStatus,
        PHorizontalLayout,
        PDropdownMenuBtn,
        UserDetail,
        PTab,
        PTagsPanel,
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
            timezone: computed(() => store.state.user.timezone),
            fields: computed(() => ([
                { name: 'user_id', label: 'User ID' },
                { name: 'name', label: 'Name' },
                { name: 'state', label: 'State' },
                { name: 'user_type', label: 'Access Control' },
                { name: 'backend', label: 'Auth Type' },
                { name: 'last_accessed_at', label: 'Last Activity' },
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
                { name: 'user_id', label: vm.$t('IDENTITY.USER.MAIN.USER_ID') },
                { name: 'name', label: vm.$t('IDENTITY.USER.MAIN.NAME') },
            ])),
            dropdownMenu: computed(() => ([
                {
                    type: 'item',
                    name: 'update',
                    label: vm.$t('IDENTITY.USER.MAIN.UPDATE'),
                    disabled: state.selectedIndex.length > 1 || !state.isSelected,
                },
                {
                    type: 'item', name: 'delete', label: vm.$t('IDENTITY.USER.MAIN.DELETE'), disabled: !state.isSelected,
                },
                { type: 'divider' },
                {
                    type: 'item', name: 'enable', label: vm.$t('IDENTITY.USER.MAIN.ENABLE'), disabled: !state.isSelected,
                },
                {
                    type: 'item', name: 'disable', label: vm.$t('IDENTITY.USER.MAIN.DISABLE'), disabled: !state.isSelected,
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
                { name: vm.$t('IDENTITY.USER.MAIN.USER_MANAGEMENT'), path: '/identity/user/user-management' },
            ])),
        });

        const singleItemTabState = reactive({
            tabs: computed(() => ([
                { label: vm.$t('IDENTITY.USER.MAIN.DETAILS'), name: 'detail', keepAlive: true },
                { label: vm.$t('IDENTITY.USER.MAIN.TAG'), name: 'tag', keepAlive: true },
            ] as TabItem[])),
            activeTab: 'detail',
        });

        const multiItemTabState = reactive({
            tabs: computed(() => ([
                { name: 'data', label: vm.$t('IDENTITY.USER.MAIN.TAB_SELECTED_DATA'), keepAlive: true },
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
                    only: ['user_id', 'name', 'email', 'state', 'timezone', 'user_type', 'backend', 'last_accessed_at'],
                });
                state.users = res.results.map(d => ({
                    ...d,
                    // eslint-disable-next-line camelcase
                    last_accessed_at: calculateTime(d.last_accessed_at, { seconds: dayjs().unix() }, state.timezone),
                }));
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
            modalState.title = vm.$t('IDENTITY.USER.MAIN.DELETE_MODAL_TITLE') as string;
            modalState.subTitle = vm.$tc('IDENTITY.USER.MAIN.DELETE_MODAL_DESC', state.selectedIndex.length);
            modalState.themeColor = 'alert';
            modalState.visible = true;
        };
        const clickEnable = () => {
            modalState.mode = 'enable';
            modalState.title = vm.$t('IDENTITY.USER.MAIN.ENABLE_MODAL_TITLE') as string;
            modalState.subTitle = vm.$tc('IDENTITY.USER.MAIN.ENABLE_MODAL_DESC', state.selectedIndex.length);
            modalState.themeColor = 'safe';
            modalState.visible = true;
        };
        const clickDisable = () => {
            modalState.mode = 'disable';
            modalState.title = vm.$t('IDENTITY.USER.MAIN.DISABLE_MODAL_TITLE') as string;
            modalState.subTitle = vm.$tc('IDENTITY.USER.MAIN.DISABLE_MODAL_DESC', state.selectedIndex.length);
            modalState.themeColor = 'alert';
            modalState.visible = true;
        };

        const getUsersParam = items => ({ users: map(items, 'user_id') });
        const addUser = async (item) => {
            try {
                await SpaceConnector.client.identity.user.create({
                    ...item,
                });
                showSuccessMessage(vm.$t('IDENTITY.USER.MAIN.ALT_S_ADD_USER'), '', root);
            } catch (e) {
                showErrorMessage(vm.$t('IDENTITY.USER.MAIN.ALT_E_ADD_USER'), e, root);
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
                showSuccessMessage(vm.$t('IDENTITY.USER.MAIN.ALT_S_UPDATE_USER'), '', root);
            } catch (e) {
                showErrorMessage(vm.$t('IDENTITY.USER.MAIN.ALT_E_UPDATE_USER'), e, root);
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
                showSuccessMessage(vm.$tc('IDENTITY.USER.MAIN.ALT_S_DELETE_USER', state.selectedIndex.length), '', root);
            } catch (e) {
                showErrorMessage(vm.$tc('IDENTITY.USER.MAIN.ALT_E_DELETE_USER', state.selectedIndex.length), e, root);
            } finally {
                await getUsers();
                modalState.visible = false;
            }
        };
        const enableUser = async (items) => {
            try {
                await SpaceConnector.client.identity.user.enable(getUsersParam(items));
                showSuccessMessage(vm.$tc('IDENTITY.USER.MAIN.ALT_S_ENABLE', state.selectedIndex.length), '', root);
            } catch (e) {
                showErrorMessage(vm.$tc('IDENTITY.USER.MAIN.ALT_E_ENABLE', state.selectedIndex.length), e, root);
            } finally {
                await getUsers();
                modalState.visible = false;
            }
        };
        const disableUser = async (items) => {
            try {
                await SpaceConnector.client.identity.user.disable(getUsersParam(items));
                showSuccessMessage(vm.$tc('IDENTITY.USER.MAIN.ALT_S_DISABLE', state.selectedIndex.length), '', root);
            } catch (e) {
                showErrorMessage(vm.$tc('IDENTITY.USER.MAIN.ALT_E_DISABLE', state.selectedIndex.length), e, root);
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
            timestampFormatter,
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
.right-contents-container {
    @apply mx-0;
    max-width: 100%;

}

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
.selected-data-tab {
    @apply mt-8;
}
>>> .modal-content {
    min-width: 31.25rem;
    max-width: 50rem;
    min-height: 30rem;
    max-height: calc(100vh - 4rem);
}
</style>
