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
                        <p-button style-type="primary-dark" @click="clickAdd">
                            {{ tr('COMMON.BTN_ADD') }}
                        </p-button>
                        <PDropdownMenuBtn
                            id="server-dropdown-btn"
                            class="left-toolbox-item"
                            :menu="dropdown"
                            @click-enable="clickEnable"
                            @click-disable="clickDisable"
                            @click-delete="clickDelete"
                            @click-update="clickUpdate"
                        >
                            Action
                        </PDropdownMenuBtn>
                        <div class="left-toolbox-item">
                            <PQuerySearchBar :search-text.sync="searchText" :autocomplete-handler="ACHandler" @newQuery="queryListTools.addTag" />
                        </div>
                    </template>
                    <template v-if="queryListTools.tags.length !== 0" slot="toolbox-bottom">
                        <p-col :col="12" style="margin-bottom: .5rem;">
                            <p-hr style="width: 100%;" />
                            <p-row style="margin-top: .5rem;">
                                <div style="flex-grow: 0">
                                    <p-icon-button name="ic_delete" @click="queryListTools.deleteAllTags" />
                                </div>
                                <div style="flex-grow: 1;margin-left: 1rem;">
                                    <p-tag v-for="(tag, idx) in queryListTools.tags" :key="idx + tag" style="margin-top: 0.375rem;margin-bottom: 0.37rem"
                                           @delete="queryListTools.deleteTag(idx)"
                                    >
                                        {{ tag.key }}:{{ tag.operator }} {{ tag.value }}
                                    </p-tag>
                                </div>
                            </p-row>
                        </p-col>
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
        <p-user-form v-if="userFormState.visible"
                     :header-title="userFormState.headerTitle"
                     :update-mode="userFormState.updateMode"
                     :item="userFormState.item"
                     :visible.sync="userFormState.visible"
                     @confirm="userFormConfirm"
        />
    </div>
</template>

<script>
import {
    reactive, toRefs, ref, computed,
} from '@vue/composition-api';
import PStatus from '@/components/molecules/status/Status.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
import { requestToolboxTableMetaReactive } from '@/components/organisms/tables/toolbox-table/ToolboxTable.util';
import { timestampFormatter, getValue, userStateFormatter } from '@/lib/util';
import { makeTrItems } from '@/lib/view-helper';
import userEventBus from '@/views/identity/user/UserEventBus';
import PUserForm from '@/views/identity/user/modules/UserForm.vue';
import PTag, { tagList } from '@/components/molecules/tags/Tag.vue';
import PRow from '@/components/atoms/grid/row/Row.vue';
import PCol from '@/components/atoms/grid/col/Col.vue';
import PHr from '@/components/atoms/hr/Hr.vue';
import PQuerySearchBar from '@/components/organisms/search/query-search-bar/QuerySearchBar.vue';
import PIconButton from '@/components/molecules/buttons/IconButton.vue';

const PTab = () => import('@/components/organisms/tabs/tab/Tab.vue');
const PDataTable = () => import('@/components/organisms/tables/data-table/DataTable.vue');
const PHorizontalLayout = () => import('@/components/organisms/layouts/horizontal-layout/HorizontalLayout.vue');
const PToolboxTable = () => import('@/components/organisms/tables/toolbox-table/ToolboxTable.vue');
const PDropdownMenuBtn = () => import('@/components/organisms/dropdown/dropdown-menu-btn/DropdownMenuBtn.vue');
const PSearch = () => import('@/components/molecules/search/Search.vue');
const PUserDetail = () => import('@/views/identity/user/modules/UserDetail.vue');
const PTableCheckModal = () => import('@/components/organisms/modals/action-modal/ActionConfirmModal.vue');
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
    addUser: '',
    updateUser: '',
};

export const userSetup = (props, context, eventName, ACHandler) => {
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
    const isNotOnlyOneSelected = computed(() => tableState.selectIndex.length !== 1);
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

    const userFormState = reactive({
        visible: false,
        mode: '',
        headerTitle: '',
        item: null,
        eventName: '',
    });

    const clickAdd = () => {
        userFormState.updateMode = false;
        userFormState.headerTitle = 'Add User';
        userFormState.item = null;
        userFormState.eventName = eventNames.addUser;
        userFormState.visible = true;
    };

    const clickUpdate = () => {
        userFormState.updateMode = true;
        userFormState.headerTitle = 'Update User';
        const item = getSelectedUserItems.value[0];
        console.log(item);
        userFormState.item = {
            userId: item.user_id,
            name: item.name,
            email: item.name,
            mobile: item.mobile,
            group: item.group,
            language: item.language,
            timezone: item.timezone,
            tags: item.tags,
        };
        userFormState.eventName = eventNames.updateUser;
        userFormState.visible = true;
    };


    const userFormConfirm = (item) => {
        eventBus.$emit(userFormState.eventName, item);
        userFormState.visible = false;
        userFormState.mode = '';
    };

    const checkTableModalState = reactive({
        visible: false,
        mode: '',
        item: null,
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
            ['update', 'COMMON.BTN_UPT', { disabled: isNotOnlyOneSelected }],
            ['delete', 'COMMON.BTN_DELETE', { disabled: isNotSelected }],
            [null, null, { type: 'divider' }],
            ['enable', 'COMMON.BTN_ENABLE', { disabled: isNotSelected }],
            ['disable', 'COMMON.BTN_DISABLE', { disabled: isNotSelected }],
        ],
        context.parent,
        { type: 'item' }),
    });
    const queryList = ref([]);
    const queryListTools = tagList(queryList, true, eventBus, eventName.getUserList);

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
        // todo: need confirm that this is good way - sinsky
        // EventBus Names
        ...eventNames,
        getSelectedUserItems,
        getSelectUserIds,
        getFirstSelectedUserId,
        userFormState,
        clickAdd,
        clickUpdate,
        userFormConfirm,
        clickEnable,
        clickDisable,
        clickDelete,
        checkModalConfirm,
        ACHandler,
        queryListTools,

    });
};

export default {
    name: 'UserTemplate',
    filters: {
        getValue,
    },
    components: {
        PUserForm,
        PStatus,
        PHorizontalLayout,
        PToolboxTable,
        PButton,
        PDropdownMenuBtn,
        PUserDetail,
        PTab,
        PDataTable,
        PQuerySearchBar,
        PTag,
        PTableCheckModal,
        PRow,
        PCol,
        PHr,
        PIconButton,
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
