<template>
    <div class="user">
        <p-horizontal-layout>
            <template #container="{ height }">
                <p-toolbox-table
                    ref="toolbox"
                    :items="items"
                    :fields="fields"
                    :selectable="true"
                    :sortable="true"
                    :dragable="true"
                    :hover="true"
                    :responsive="true"
                    :sort-by.sync="sortBy"
                    :sort-desc.sync="sortDesc"
                    :all-page="allPage"
                    :this-page.sync="thisPage"
                    :select-index.sync="selectIndex"
                    :page-size.sync="pageSize"
                    :responsive-style="{'height': height+'px', 'overflow-y':'auto','overflow-x':'auto'}"
                    :setting-visible="false"
                    :loading="loading"
                    :use-spinner-loading="true"
                    :use-cursor-loading="true"
                    @changePageSize="getUsers"
                    @changePageNumber="getUsers"
                    @clickRefresh="getUsers"
                    @changeSort="getUsers"
                >
                    <template slot="toolbox-left">
                        <p-button style-type="primary" @click="clickCollectData">
                            {{ tr('COMMON.BTN_ADD') }}
                        </p-button>
                        <PDropdownMenuBtn
                            id="server-dropdown-btn"
                            class="left-toolbox-item"
                            :menu="dropdown"
                            @click-enable="clickEnable"
                            @click-disable="clickDisable"
                            @click-delete="clickDelete"
                            @click-update="clickMenuEvent"
                        >
                            Action
                        </PDropdownMenuBtn>
                        <div class="left-toolbox-item">
                            <p-search :search-text.sync="searchText" @onSearch="getUsers" />
                        </div>
                    </template>
                    <template v-slot:col-state-format="{value}">
                        <p-status v-bind="userStateFormatter(value)" />
                    </template>
                </p-toolbox-table>
            </template>
        </p-horizontal-layout>
        <PTab v-if="isSelectedOne" :tabs="tabs" :active-tab.sync="activeTab">
            <template #detail="{tabName}">
                <p-user-detail ref="userDetail"
                               :item="items[selectIndex[0]]"
                               :tag-confirm-event="tagConfirmEvent"
                               :tag-reset-event="tagResetEvent"
                />
            </template>
        </PTab>
        <PTab v-else-if="isSelectedMulti" :tabs="multiSelectTabs" :active-tab.sync="multiSelectActiveTab">
            <template #data="{tabName}">
                <p-data-table
                    :fields="multiSelectFields"
                    :sortable="false"
                    :selectable="false"
                    :items="getSelectedUserItems"
                    :col-copy="true"
                />
            </template>
        </PTab>

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
            :items="getSelectedUserItems"

            @confirm="checkModalConfirm"
        />
    </div>
</template>

<script>
import {
    reactive, toRefs, ref, computed,
} from '@vue/composition-api';
import PStatus from '@/components/molecules/status/Status';
import PButton from '@/components/atoms/buttons/Button';
import { requestToolboxTableMetaReactive } from '@/components/organisms/tables/toolbox-table/ToolboxTable.util';
import { timestampFormatter, getValue, userStateFormatter } from '@/lib/util';
import { makeTrItems } from '@/lib/view-helper';
import userEventBus from '@/views/identity/user/UserEventBus';


const PTab = () => import('@/components/organisms/tabs/tab/Tab');
const PDataTable = () => import('@/components/organisms/tables/data-table/DataTable');
const PHorizontalLayout = () => import('@/components/organisms/layouts/horizontal-layout/HorizontalLayout');
const PToolboxTable = () => import('@/components/organisms/tables/toolbox-table/ToolboxTable');
const PDropdownMenuBtn = () => import('@/components/organisms/buttons/dropdown/DropdownMenuBtn');
const PSearch = () => import('@/components/molecules/search/Search');
const PUserDetail = () => import('@/views/identity/user/modules/UserDetail');
const PTableCheckModal = () => import('@/components/organisms/modals/table-modal/TableCheckModal');
export const UserTableReactive = parent => reactive({
    fields: makeTrItems([
        ['user_id', 'COMMON.ID'],
        ['name', 'COMMON.NAME'],
        ['email', 'COMMON.EMAIL'],
        ['state', 'COMMON.STATE'],
        ['mobile', 'COMMON.PHONE', { sortable: false }],
        ['group', 'COMMON.GROUP'],
        ['language', 'COMMON.LANGUAGE'],
        ['timezone', 'COMMON.TIMEZONE'],
    ],
    parent),
    multiSelectFields: makeTrItems([
        ['user_id', 'COMMON.ID'],
        ['name', 'COMMON.NAME'],
        ['email', 'COMMON.EMAIL'],
        ['group', 'COMMON.GROUP'],
    ],
    parent),
    selectIndex: [],
    items: [],
    searchText: '',
    loading: false,
    toolbox: null, // template refs
});

/**
   * @typedef {Object} UserState
   * @property {string} sortBy
   * @property {boolean} sortDesc
   * @property {number} thisPage
   * @property {number} allPage
   * @property {number} pageSize
   * @property {Array} fields
   * @property {Array} selectIndex
   *
   */

/**
   * server default setup reactive object
   * @function
   * @return {serverState} reactive object
   */
export const eventNames = {
    tagResetEvent: '',
    tagConfirmEvent: '',
    getUserList: '',
    enableUser: '',
    disableUser: '',
    deleteUser: '',
};

export const userSetup = (props, context, eventName) => {
    const eventBus = userEventBus;
    const tableState = UserTableReactive(context.parent);
    const tabData = reactive({
        tabs: makeTrItems([
            ['detail', 'COMMON.DETAILS', { keepAlive: true }],
        ],
        context.parent),
        activeTab: 'detail',
        multiSelectTabs: makeTrItems([
            ['data', 'COMMON.DATA', { keepAlive: true }],
        ], context.parent),
        multiSelectActiveTab: 'data',
        userDetail: null, // template refs
    });
    const tags = ref({});
    const tabAction = reactive({
        isSelectedOne: computed(() => tableState.selectIndex.length === 1),
        isSelectedMulti: computed(() => tableState.selectIndex.length > 1),
    });
    const state = requestToolboxTableMetaReactive();
    state.sortBy = 'name';
    const getUsers = () => {
        eventBus.$emit(eventName.getUserList);
    };

    const sortSelectIndex = computed(() => {
        const idxs = [...tableState.selectIndex];
        idxs.sort((a, b) => a - b);
        return idxs;
    });
    const isNotSelected = computed(() => tableState.selectIndex.length === 0);
    const getSelectedUserItems = computed(() => {
        const items = [];
        sortSelectIndex.value.forEach((idx) => {
            items.push(tableState.items[idx]);
        });
        return items;
    });
    const getSelectUserIds = computed(() => {
        const ids = [];
        getSelectedUserItems.value.forEach((item) => {
            ids.push(item.server_id);
        });
        return ids;
    });
    const getFirstSelectedUserId = computed(() => (getSelectUserIds.value.length >= 1 ? getSelectUserIds[0] : ''));

    const checkTableModalState = reactive({
        visible: false,
        mode: '',
        confirmEventName: '',
        title: '',
        subTitle: '',
        themeColor: '',
    });

    const resetCheckTableModalState = () => {
        checkTableModalState.visible = false;
        checkTableModalState.mode = '';
        checkTableModalState.confirmEventName = '';
        checkTableModalState.title = '';
        checkTableModalState.subTitle = '';
        checkTableModalState.themeColor = '';
    };

    const clickEnable = () => {
        checkTableModalState.mode = 'enable';
        checkTableModalState.confirmEventName = eventNames.enableUser;
        checkTableModalState.title = 'User Enable';
        checkTableModalState.subTitle = 'Are you sure you want to Enable selected User(s) below?';
        checkTableModalState.themeColor = 'safe';
        checkTableModalState.visible = true;
    };
    const clickDisable = () => {
        checkTableModalState.mode = 'disable';
        checkTableModalState.confirmEventName = eventNames.disableUser;
        checkTableModalState.title = 'User Disable';
        checkTableModalState.subTitle = 'Are you sure you want to Disable selected User(s) below?';
        checkTableModalState.themeColor = 'alert';
        checkTableModalState.visible = true;
    };
    const clickDelete = () => {
        checkTableModalState.mode = 'delete';
        checkTableModalState.confirmEventName = eventNames.deleteUser;
        checkTableModalState.title = 'User Delete';
        checkTableModalState.subTitle = 'Are you sure you want to delete selected User(s) below?';
        checkTableModalState.themeColor = 'alert';
        checkTableModalState.visible = true;
    };


    const checkModalConfirm = (event) => {
        console.log(checkTableModalState.confirmEventName, event);
        eventBus.$emit(checkTableModalState.confirmEventName, event);
        resetCheckTableModalState();
    };

    const dropdownMenu = reactive({
        ...makeTrItems([
            ['update', 'COMMON.BTN_UPT'],
            ['delete', 'COMMON.BTN_DELETE'],
            ['enable', 'COMMON.BTN_ENABLE'],
            ['disable', 'COMMON.BTN_DISABLE'],
        ],
        context.parent,
        { type: 'item', disabled: isNotSelected }),
    });

    return reactive({
        ...toRefs(state),
        ...toRefs(tableState),
        ...toRefs(tabData),
        ...toRefs(tabAction),
        checkTableModalState,
        tags,
        dropdown: dropdownMenu,
        userStateFormatter,
        timestampFormatter,
        clickCollectData() {
            console.log('add');
        },
        getUsers,
        clickMenuEvent(menuName) {
            console.log(menuName);
        },
        // todo: need confirm that this is good way - sinsky
        // EventBus Names
        ...eventNames,
        getSelectedUserItems,
        getSelectUserIds,
        getFirstSelectedUserId,
        clickEnable,
        clickDisable,
        clickDelete,
        checkModalConfirm,
    });
};

export default {
    name: 'UserTemplate',
    filters: {
        getValue,
    },
    components: {
        PStatus,
        PHorizontalLayout,
        PToolboxTable,
        PButton,
        PDropdownMenuBtn,
        PUserDetail,
        PTab,
        PDataTable,
        PSearch,
        PTableCheckModal,
    },
    setup(props, context) {
        const dataBind = reactive({
            items: computed(() => []),
        });
        const state = userSetup(props, context, dataBind.items);

        return {
            ...toRefs(state),
            ...toRefs(dataBind),
        };
    },
};

</script>

<style lang="scss" scoped>
    .left-toolbox-item{
        margin-left: 1rem;
        &:last-child {
            flex-grow: 1;
        }
    }

    #empty-space{
        text-align: center;
        margin-bottom: 0.5rem;
        color: $primary2;
        font: 24px/32px Arial;
    }
    .user{
        margin-top: 1.5625rem;
        margin-left: 2rem;
        margin-right: 2rem;
    }
</style>
