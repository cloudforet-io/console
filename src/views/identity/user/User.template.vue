<template>
    <general-page-layout>
         <PPageTitle title="User" />
                    <!-- use-total-count use-selected-count
                    :total-count="apiHandler.totalCount.value"
                    :selected-count="apiHandler.tableTS.selectState.selectItems.length" -->
        <p-horizontal-layout>
            <template #container="{ height }">
                <p-toolbox-table
                    ref="toolbox"
                    :items="items"
                    :fields="fields"
                    :selectable="true"
                    :sortable="true"
                    :draggable="true"
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
                    :use-cursor-loading="true"
                    @changePageSize="getUsers"
                    @changePageNumber="getUsers"
                    @clickRefresh="getUsers"
                    @changeSort="getUsers"
                >
                    <template slot="toolbox-left">
                        <PIconTextButton style-type="primary-dark"
                                         name="ic_plus_bold"
                                         @click="clickAdd"
                        >
                            {{ $t('BTN.CREATE') }}
                        </PIconTextButton>
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
            <template #detail>
                <p-user-detail ref="userDetail"
                               :item="items[selectIndex[0]]"
                               :tag-confirm-event="tagConfirmEvent"
                               :tag-reset-event="tagResetEvent"
                />
            </template>
            <template #tag>
                <s-tags-panel
                    :is-show="activeTab==='tag'"
                    :resource-id="selectIndex[0]?items[selectIndex[0]].user_id:''"
                    tag-page-name="userTags"
                />
            </template>
        </PTab>
        <PTab v-else-if="isSelectedMulti" :tabs="multiSelectTabs" :active-tab.sync="multiSelectActiveTab">
            <template #data>
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
    </general-page-layout>
</template>

<script>
import {
    reactive, toRefs, ref, computed,
} from '@vue/composition-api';
import PStatus from '@/components/molecules/status/PStatus.vue';
import { requestToolboxTableMetaReactive } from '@/components/organisms/tables/toolbox-table/PToolboxTable.util';
import { timestampFormatter, getValue, userStateFormatter } from '@/lib/util';
import { makeTrItems } from '@/lib/view-helper';
import userEventBus from '@/views/identity/user/UserEventBus';
import PUserForm from '@/views/identity/user/modules/UserForm.vue';
import PTag from '@/components/molecules/tags/PTag.vue';
import { tagList } from '@/components/molecules/tags/PTag.toolset';
import PRow from '@/components/atoms/grid/row/Row.vue';
import PCol from '@/components/atoms/grid/col/Col.vue';
import PHr from '@/components/atoms/hr/PHr.vue';
import PQuerySearchBar from '@/components/organisms/search/query-search-bar/QuerySearchBar.vue';
import PIconButton from '@/components/molecules/buttons/icon-button/PIconButton.vue';
import GeneralPageLayout from '@/views/containers/page-layout/GeneralPageLayout.vue';
import PIconTextButton from '@/components/molecules/buttons/icon-text-button/PIconTextButton.vue';
import STagsPanel from '@/views/common/tags/tag-panel/TagsPanel.vue';
import PPageTitle from '@/components/organisms/title/page-title/PPageTitle.vue';

const PTab = () => import('@/components/organisms/tabs/tab/PTab.vue');
const PDataTable = () => import('@/components/organisms/tables/data-table/PDataTable.vue');
const PHorizontalLayout = () => import('@/components/organisms/layouts/horizontal-layout/PHorizontalLayout.vue');
const PToolboxTable = () => import('@/components/organisms/tables/toolbox-table/PToolboxTable.vue');
const PDropdownMenuBtn = () => import('@/components/organisms/dropdown/dropdown-menu-btn/PDropdownMenuBtn.vue');
const PUserDetail = () => import('@/views/identity/user/modules/UserDetail.vue');
const PTableCheckModal = () => import('@/components/organisms/modals/action-modal/PActionConfirmModal.vue');

export const UserTableReactive = parent => reactive({
    fields: makeTrItems([
        ['user_id', 'COMMON.USER_ID'],
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
        ['user_id', 'COMMON.USER_ID'],
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
            ['tag', 'TAB.TAG'],
        ],
        context.parent),
        activeTab: 'detail',
        multiSelectTabs: makeTrItems([
            ['data', 'TAB.SELECTED_DATA', { keepAlive: true }],
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
        // console.debug(item);
        userFormState.item = {
            // eslint-disable-next-line camelcase
            user_id: item.user_id,
            name: item.name,
            email: item.email,
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
        // console.debug(checkTableModalState.confirmEventName, event);
        eventBus.$emit(checkTableModalState.confirmEventName, event);
        resetCheckTableModalState();
    };

    const dropdownMenu = reactive({
        ...makeTrItems([
            ['update', 'BTN.UPDATE', { disabled: isNotOnlyOneSelected }],
            ['delete', 'BTN.DELETE', { disabled: isNotSelected }],
            [null, null, { type: 'divider' }],
            ['enable', 'BTN.ENABLE', { disabled: isNotSelected }],
            ['disable', 'BTN.DISABLE', { disabled: isNotSelected }],
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
            console.debug('add');
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
        PQuerySearchBar,
        PTag,
        PTableCheckModal,
        PRow,
        PCol,
        PHr,
        PIconButton,
        STagsPanel,
        PPageTitle,
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

<style lang="postcss" scoped>
    .left-toolbox-item{
        margin-left: 1rem;
        &:last-child {
            flex-grow: 1;
        }
    }

    #empty-space{
        @apply text-primary2 mt-6;
        text-align: center;
        margin-bottom: 0.5rem;
        font-size: 1.5rem;
    }
</style>
