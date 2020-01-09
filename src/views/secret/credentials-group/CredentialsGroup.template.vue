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
                    </template>
                    <PDropdownMenuBtn
                        id="cdg-dropdown-btn"
                        class="left-toolbox-item"
                        :menu="dropdown"
                        @click-enable="clickEnable"
                        @click-disable="clickDisable"
                        @click-delete="clickDelete"
                        @click-update="clickUpdate"
                    >
                        Action
                    </PDropdownMenuBtn>
                </p-toolbox-table>
            </template>
        </p-horizontal-layout>
    </div>
</template>

<script>
import {
    reactive, toRefs, ref, computed,
} from '@vue/composition-api';
import PStatus from '@/components/molecules/status/Status';
import PButton from '@/components/atoms/buttons/Button';
import { requestToolboxTableMetaReactive } from '@/components/organisms/tables/toolbox-table/ToolboxTable.util';
import { timestampFormatter, getValue, cdgStateFormatter } from '@/lib/util';
import PToolboxTable from '@/components/organisms/tables/toolbox-table/ToolboxTable.vue';
import cdgEventBus from '@/views/secret/credentials-group/CredentialsGroupEventBus';
import { makeTrItems } from '@/lib/view-helper';
import PHorizontalLayout from '@/components/organisms/layouts/horizontal-layout/HorizontalLayout.vue';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/DropdownMenuBtn.vue';

export const CdgTableReactive = parent => reactive({
    fields: makeTrItems([
        ['cdg_id', 'COMMON.ID'],
        ['name', 'COMMON.NAME'],
        ['created_at', 'COMMON.CREATE'],
    ],
    parent),
    multiSelectFields: makeTrItems([
        ['cdg_id', 'COMMON.ID'],
        ['name', 'COMMON.NAME'],
        ['created_at', 'COMMON.CREATE'],
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
    addCdg: '',
    deleteCdg: '',
    updateCdg: '',
};

export const cdgSetup = (props, context, eventName) => {
    const eventBus = cdgEventBus;
    const tableState = CdgTableReactive(context.parent);
    const state = requestToolboxTableMetaReactive();
    const getCdg = () => {
        console.log('credentialsGroup event');
        eventBus.$emit(eventName.getCdgList);
    };

    const isNotSelected = computed(() => tableState.selectIndex.length === 0);
    const isNotOnlyOneSelected = computed(() => tableState.selectIndex.length !== 1);

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
        cdgFormState.eventName = eventNames.addCdg;
        cdgFormState.visible = true;
    };
    const clickUpdate = () => {
        cdgFormState.updateMode = true;
        cdgFormState.headerTitle = 'Update Credentials Group';
        const item = getCdgItems.value[0];
        cdgFormState.item = {
            cdg_id: item.cdg_id,
            name: item.name,
            domain_id: item.domain_id,
            tags: item.tags,
            created_at: item.created_at,
        };
        cdgFormState.eventName = eventNames.updateCdg;
        cdgFormState.visible = true;
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
    return reactive({
        ...toRefs(state),
        ...toRefs(tableState),
        checkTableModalState,
        dropdown: dropdownMenu,
        cdgStateFormatter,
        getCdg,
        ...eventNames,
        cdgFormState,
        clickCreate,
        clickUpdate,
        clickEnable,
        clickDisable,
        clickDelete,
        checkModalConfirm,
    });
};
export default {
    name: 'CdgTemplate',
    components: {
        PHorizontalLayout,
        PToolboxTable,
        PButton,
        PDropdownMenuBtn,
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

<style scoped>

</style>
