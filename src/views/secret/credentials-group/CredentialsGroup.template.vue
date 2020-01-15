<template>
    <div class="cdg">
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
                    @changePageSize="getCdg"
                    @changePageNumber="getCdg"
                    @clickRefresh="getCdg"
                    @changeSort="getCdg"
                >
                    <template slot="toolbox-left">
                        <p-button style-type="primary" @click="clickCreate">
                            {{ tr('COMMON.BTN_CRT') }}
                        </p-button>
                        <PDropdownMenuBtn
                            id="cdg-dropdown-btn"
                            class="left-toolbox-item"
                            :menu="dropdown"
                            @click-delete="clickDelete"
                            @click-update="clickUpdate"
                        >
                            Action
                        </PDropdownMenuBtn>
                        <div class="left-toolbox-item">
                            <p-search :search-text.sync="searchText" @onSearch="getCdg" />
                        </div>
                    </template>
                    <template v-slot:col-created_at-format="data">
                        {{ timestampFormatter(data.value) }}
                    </template>
                </p-toolbox-table>
            </template>
        </p-horizontal-layout>
        <PTab v-if="isSelectedOne" :tabs="tabs" :active-tab.sync="activeTab">
            <template #detail="{tabName}">
                <p-cdg-detail ref="cdgDetail"
                              :item="items[selectIndex[0]]"
                              :tag-confirm-event="tagConfirmEvent"
                              :tag-reset-event="tagResetEvent"
                />
            </template>
            <template #credential="{tabName}">
                <p-cdg-raw-data :item="items[selectIndex[0]]"
                />
            </template>
        </PTab>
        <PTab v-else-if="isSelectedMulti" :tabs="multiSelectTabs" :active-tab.sync="multiSelectActiveTab">
            <template #data="{tabName}">
                <p-data-table
                    :fields="multiSelectFields"
                    :sortable="false"
                    :selectable="false"
                    :items="getSelectedCdgItems"
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
            :items="getSelectedCdgItems"

            @confirm="checkModalConfirm"
        />
        <p-cdg-form v-if="cdgFormState.visible"
                    :header-title="cdgFormState.headerTitle"
                    :update-mode="cdgFormState.updateMode"
                    :item="cdgFormState.item"
                    :visible.sync="cdgFormState.visible"
                    :cdg-name-validation="cdgNameValidation"
                    @confirm="cdgFormConfirm"
        />
    </div>
</template>

<script>
import {
    reactive, toRefs, ref, computed,
} from '@vue/composition-api';
import { requestToolboxTableMetaReactive } from '@/components/organisms/tables/toolbox-table/ToolboxTable.util';
import { timestampFormatter, getValue } from '@/lib/util';
import { makeTrItems } from '@/lib/view-helper';
import cdgEventBus from '@/views/secret/credentials-group/CredentialsGroupEventBus';
import PButton from '@/components/atoms/buttons/Button.vue';
import PTab from '@/components/organisms/tabs/tab/Tab.vue';
import PHorizontalLayout from '@/components/organisms/layouts/horizontal-layout/HorizontalLayout.vue';
import PToolboxTable from '@/components/organisms/tables/toolbox-table/ToolboxTable.vue';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/DropdownMenuBtn.vue';
import PSearch from '@/components/molecules/search/Search.vue';
import PCdgDetail from '@/views/secret/credentials-group/modules/CredentialGroupDetail.vue';
import PTableCheckModal from '@/components/organisms/modals/action-modal/ActionConfirmModal.vue';
import PDataTable from '@/components/organisms/tables/data-table/DataTable.vue';
import PCdgForm from '@/views/secret/credentials-group/modules/CredentialGroupForm.vue';

export const CdgTableReactive = parent => reactive({
    fields: makeTrItems([
        ['credential_group_id', 'COMMON.ID'],
        ['name', 'COMMON.NAME'],
        ['created_at', 'COMMON.CREATE'],
    ],
    parent),
    multiSelectFields: makeTrItems([
        ['credential_group_id', 'COMMON.ID'],
        ['name', 'COMMON.NAME'],
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
    getCdgList: '',
    createCdg: '',
    deleteCdg: '',
    updateCdg: '',
};

export const cdgSetup = (props, context, eventName, cdgNameValidation) => {
    const eventBus = cdgEventBus;
    const tableState = CdgTableReactive(context.parent);
    const tabData = reactive({
        tabs: makeTrItems([
            ['detail', 'COMMON.DETAILS', { keepAlive: true }],
            ['credentials', 'COMMON.CREDENTIALS'],
        ],
        context.parent),
        activeTab: 'detail',
        multiSelectTabs: makeTrItems([
            ['data', 'COMMON.DATA', { keepAlive: true }],
        ], context.parent),
        multiSelectActiveTab: 'data',
        cdgDetail: null,
    });
    const tags = ref({});
    const tabAction = reactive({
        isSelectedOne: computed(() => tableState.selectIndex.length === 1),
        isSelectedMulti: computed(() => tableState.selectIndex.length > 1),
    });
    const state = requestToolboxTableMetaReactive();
    const getCdg = () => {
        eventBus.$emit(eventName.getCdgList);
    };
    const cdData = reactive({
        items: [],
        sortBy: '',
        sortDesc: true,
        pageSize: 15,
        allPage: 1,
        thisPage: 1,
        searchText: '',
        loading: false,
    });

    const sortSelectIndex = computed(() => {
        const idxs = [...tableState.selectIndex];
        idxs.sort((a, b) => a - b);
        return idxs;
    });
    const isNotSelected = computed(() => tableState.selectIndex.length === 0);
    const isNotOnlyOneSelected = computed(() => tableState.selectIndex.length !== 1);
    const getSelectedCdgItems = computed(() => {
        const items = [];
        sortSelectIndex.value.forEach((idx) => {
            items.push(tableState.items[idx]);
        });
        return items;
    });
    const getSelectedCdgIds = computed(() => {
        const ids = [];
        getSelectedCdgItems.value.forEach((item) => {
            ids.push(item.credential_group_id);
        });
        return ids;
    });
    const getFirstSelectedCdgId = computed(() => (getSelectedCdgIds.value.length >= 1 ? getSelectedCdgIds[0] : ''));

    const cdgFormState = reactive({
        visible: false,
        mode: '',
        headerTitle: '',
        item: null,
        eventNames: '',
    });
    const clickCreate = () => {
        cdgFormState.updateMode = false;
        cdgFormState.headerTitle = 'Create Credentials Group';
        cdgFormState.item = null;
        cdgFormState.eventName = eventNames.createCdg;
        cdgFormState.visible = true;
    };
    const clickUpdate = () => {
        cdgFormState.updateMode = true;
        cdgFormState.headerTitle = 'Update Credentials Group';
        const item = getSelectedCdgItems.value[0];
        cdgFormState.item = {
            cdgId: item.credential_group_id,
            name: item.name,
            tags: item.tags,
        };
        cdgFormState.eventName = eventNames.updateCdg;
        cdgFormState.visible = true;
    };

    const cdgFormConfirm = (item) => {
        eventBus.$emit(cdgFormState.eventName, item);
        cdgFormState.visible = false;
        cdgFormState.mode = '';
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
        checkTableModalState.confirmEventName = eventNames.deleteCdg;
        checkTableModalState.title = 'Credentials Group Delete';
        checkTableModalState.subTitle = 'Are you sure you want to delete selected Credentials Group(s) below?';
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
        getCdg,
        eventNames,
        cdData,
        getSelectedCdgItems,
        getSelectedCdgIds,
        getFirstSelectedCdgId,
        cdgFormState,
        clickCreate,
        clickUpdate,
        clickDelete,
        cdgFormConfirm,
        checkModalConfirm,
        cdgNameValidation,
    });
};
export default {
    name: 'CdgTemplate',
    filters: {
        getValue,
    },
    components: {
        PCdgForm,
        PHorizontalLayout,
        PToolboxTable,
        PButton,
        PDropdownMenuBtn,
        PCdgDetail,
        PTab,
        PSearch,
        PTableCheckModal,
        PDataTable,
    },
    setup(props, context) {
        const dataBind = reactive({
            items: computed(() => []),
        });
        const state = cdgSetup(props, context, dataBind.items);

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
    .cdg{
        margin-top: 1.5625rem;
        margin-left: 2rem;
        margin-right: 2rem;
    }
</style>
