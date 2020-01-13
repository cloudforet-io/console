<template>
    <div class="credential">
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
                    @changePageSize="getCredentials"
                    @changePageNumber="getCredentials"
                    @clickRefresh="getCredentials"
                    @changeSort="getCredentials"
                >
                    <template slot="toolbox-left">
                        <p-button style-type="primary" @click="clickCreate">
                            {{ tr('COMMON.BTN_ADD') }}
                        </p-button>
                        <PDropdownMenuBtn
                            id="server-dropdown-btn"
                            class="left-toolbox-item"
                            :menu="dropdown"
                            @click-delete="clickDelete"
                        >
                            Action
                        </PDropdownMenuBtn>
                        <div class="left-toolbox-item">
                            <p-search :search-text.sync="searchText" @onSearch="getCredentials" />
                        </div>
                    </template>
                    <template #col-created_at-format="data">
                        {{ timestampFormatter(data.value) }}
                    </template>
                </p-toolbox-table>
            </template>
        </p-horizontal-layout>
        <PTab v-if="isSelectedOne" :tabs="tabs" :active-tab.sync="activeTab">
            <template #detail="{tabName}">
                <p-credentials-detail ref="credentialsDetail"
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
            Select a Credentials above for details.
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
        <p-credentials-form v-if="credentialsFormState.visible"
                            :header-title="credentialsFormState.headerTitle"
                            :update-mode="credentialsFormState.updateMode"
                            :item="credentialsFormState.item"
                            :visible.sync="credentialsFormState.visible"
                            @confirm="credentialsFormConfirm"
        />
    </div>
</template>

<script>
import {
    reactive, toRefs, ref, computed,
} from '@vue/composition-api';
import PButton from '@/components/atoms/buttons/Button.vue';
import { requestToolboxTableMetaReactive } from '@/components/organisms/tables/toolbox-table/ToolboxTable.util';
import { timestampFormatter, getValue } from '@/lib/util';
import { makeTrItems } from '@/lib/view-helper';
import credentialsEventBus from '@/views/secret/credentials/CredentialsEventBus';
import PCredentialsForm from '@/views/secret/credentials/modules/CredentialsForm.vue';

const PTab = () => import('@/components/organisms/tabs/tab/Tab');
const PDataTable = () => import('@/components/organisms/tables/data-table/DataTable');
const PHorizontalLayout = () => import('@/components/organisms/layouts/horizontal-layout/HorizontalLayout');
const PToolboxTable = () => import('@/components/organisms/tables/toolbox-table/ToolboxTable');
const PDropdownMenuBtn = () => import('@/components/organisms/dropdown/dropdown-menu-btn/DropdownMenuBtn');
const PSearch = () => import('@/components/molecules/search/Search');
const PCredentialsDetail = () => import('@/views/secret/credentials/modules/CredentialsDetail');
const PTableCheckModal = () => import('@/components/organisms/modals/action-modal/ActionConfirmModal');

export const CredentialsTableReactive = parent => reactive({
    fields: makeTrItems([
        ['credential_id', 'COMMON.ID', { size: '400px' }],
        ['name', 'COMMON.NAME', { size: '400px' }],
        ['issue_type', 'COMMON.ISSUE_TYPE', { size: '400px' }],
        ['group', 'COMMON.GROUP', { size: '800px', sortable: false }],
        ['created_at', 'COMMON.CREATED', { size: '300px' }],
    ],
    parent),
    multiSelectFields: makeTrItems([
        ['credential_id', 'COMMON.ID', { size: '400px' }],
        ['name', 'COMMON.NAME', { size: '600px' }],
    ],
    parent),
    selectIndex: [],
    items: [],
    searchText: '',
    loading: false,
    toolbox: null, // template refs
});

export const eventNames = {
    tagResetEvent: '',
    tagConfirmEvent: '',
    getCredentialsList: '',
    deleteCredentials: '',
    createCredentials: '',
    updateCredentials: '',
};

export const credentialsSetup = (props, context, eventName) => {
    const eventBus = credentialsEventBus;
    const tableState = CredentialsTableReactive(context.parent);
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
        credentialsDetail: null, // template refs
    });
    const tags = ref({});
    const tabAction = reactive({
        isSelectedOne: computed(() => tableState.selectIndex.length === 1),
        isSelectedMulti: computed(() => tableState.selectIndex.length > 1),
    });
    const state = requestToolboxTableMetaReactive();
    state.sortBy = 'name';
    const getCredentials = () => {
        eventBus.$emit(eventName.getCredentialsList);
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

    const credentialsFormState = reactive({
        visible: false,
        mode: '',
        headerTitle: '',
        item: null,
        eventName: '',
    });

    const clickCreate = () => {
        credentialsFormState.updateMode = false;
        credentialsFormState.headerTitle = 'Create Credentails';
        credentialsFormState.item = null;
        credentialsFormState.eventName = eventNames.createCredentials;
        credentialsFormState.visible = true;
    };

    const credentialsFormConfirm = (item) => {
        eventBus.$emit(credentialsFormState.eventName, item);
        credentialsFormState.visible = false;
        credentialsFormState.mode = '';
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

    const clickDelete = () => {
        checkTableModalState.mode = 'delete';
        checkTableModalState.confirmEventName = eventNames.deleteCredentials;
        checkTableModalState.title = 'Delete Credentials';
        checkTableModalState.subTitle = 'Are you sure you want to delete selected Credentials below?';
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
            ['delete', 'COMMON.BTN_DELETE', { disabled: isNotSelected }],
        ],
        context.parent,
        { type: 'item' }),
    });

    return reactive({
        ...toRefs(state),
        ...toRefs(tableState),
        ...toRefs(tabData),
        ...toRefs(tabAction),
        checkTableModalState,
        tags,
        dropdown: dropdownMenu,
        timestampFormatter,
        clickCollectData() {
            console.log('add');
        },
        getCredentials,
        ...eventNames,
        getSelectedUserItems,
        getSelectUserIds,
        getFirstSelectedUserId,
        credentialsFormState,
        clickCreate,
        credentialsFormConfirm,
        clickDelete,
        checkModalConfirm,

    });
};

export default {
    name: 'CredentialsTemplate',
    filters: {
        getValue,
    },
    components: {
        PCredentialsForm,
        PButton,
        PHorizontalLayout,
        PToolboxTable,
        PDropdownMenuBtn,
        PCredentialsDetail,
        PTab,
        PDataTable,
        PSearch,
        PTableCheckModal,
    },
    setup(props, context) {
        const dataBind = reactive({
            items: computed(() => []),
        });
        const state = credentialsSetup(props, context, dataBind.items);

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
    .credential{
        margin-top: 1.5625rem;
        margin-left: 2rem;
        margin-right: 2rem;
    }
</style>
