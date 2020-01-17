<template>
    <div class="cdg">
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
            :setting-visible="false"
            :loading="loading"
            :use-spinner-loading="true"
            :use-cursor-loading="true"
            @changePageSize="getCd"
            @changePageNumber="getCd"
            @clickRefresh="getCd"
            @changeSort="getCd"
        >
            <template slot="toolbox-left">
                <div class="left-toolbox-item">
                    <p-search :search-text.sync="searchText" @onSearch="getCd" />
                </div>
            </template>
        </p-toolbox-table>

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
import PTag, { tagList } from '@/components/molecules/tags/Tag.vue';
import PToolboxTable from '@/components/organisms/tables/toolbox-table/ToolboxTable.vue';
import PSearch from '@/components/molecules/search/Search.vue';
import PCdData from '@/views/secret/credentials-group/modules/AddCredentials.vue';
import PTableCheckModal from '@/components/organisms/modals/action-modal/ActionConfirmModal.vue';
import PCdgForm from '@/views/secret/credentials-group/modules/CredentialGroupForm.vue';

export const CdgTableReactive = parent => reactive({
    fields: makeTrItems([
        ['credential_id', 'COMMON.ID'],
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
    getCdList: '',
    getCdData: '',
};

export const cdgSetup = (props, context, eventName, cdgNameValidation) => {
    const eventBus = cdgEventBus;
    const tableState = CdgTableReactive(context.parent);
    const tags = ref({});
    const state = requestToolboxTableMetaReactive();
    const getCd = () => {
        eventBus.$emit(eventName.getCdList);
    };
    const cdData = reactive({
        items: [],
        sortBy: '',
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

    const getSelectedCdItems = computed(() => {
        const items = [];
        sortSelectIndex.value.forEach((idx) => {
            items.push(tableState.items[idx]);
        });
        return items;
    });
    const getSelectedCdIds = computed(() => {
        const ids = [];
        getSelectedCdItems.value.forEach((item) => {
            ids.push(item.credential_id);
        });
        return ids;
    });
    const getFirstSelectedCdId = computed(() => (getSelectedCdIds.value.length >= 1 ? getSelectedCdIds[0] : ''));

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

    const checkModalConfirm = (event) => {
        console.log(checkTableModalState.confirmEventName, event);
        eventBus.$emit(checkTableModalState.confirmEventName, event);
        resetCheckTableModalState();
    };
    return reactive({
        ...toRefs(state),
        ...toRefs(tableState),
        checkTableModalState,
        tags,
        timestampFormatter,
        getCd,
        ...eventNames,
        getSelectedCdItems,
        getSelectedCdIds,
        getFirstSelectedCdId,
        cdgFormState,
        cdData,
        clickCreate,
        cdgFormConfirm,
        checkModalConfirm,
        cdgNameValidation,
    });
};
export default {
    name: 'AddCdgTemplate',
    filters: {
        getValue,
    },
    components: {
        PCdgForm,
        PToolboxTable,
        PButton,
        PCdData,
        PSearch,
        PTableCheckModal,
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
        margin-right: 1rem;
        display: inline;

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
