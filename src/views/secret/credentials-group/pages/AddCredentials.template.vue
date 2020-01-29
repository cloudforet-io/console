<template>
    <div class="addCdg">
        <span class="back">
            <p-i name="ic_back" width="1.5rem" height="1.5rem"
                 color="transparent inherit"
            />
            <span>
                Back to Credentials Group List
            </span>
        </span>
        <p-pane-layout class="add-cdg-container">
            <p class="title">
                Add Credentials
            </p>
            <p-toolbox-table
                ref="toolbox"
                :items="items"
                :fields="fields"
                :selectable="true"
                :sortable="true"
                :dragable="true"
                :hover="true"
                :shadow="false"
                :border="false"
                :responsive="true"
                :sort-by.sync="sortBy"
                :sort-desc.sync="sortDesc"
                :all-page="allPage"
                :this-page.sync="thisPage"
                :responsive-style="{'height': '50vh', 'overflow-y':'auto','overflow-x':'auto'}"
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
            <p-box-layout class="tag-container">
                <p-tag v-for="(tag, idx) in tagTools.tags" :key="`tag-${tag}`"
                       @delete="tagTools.deleteTag(idx)"
                />
            </p-box-layout>
            <p-row>
                <p-button class="cancel-btn" style-type="dark" outline
                          @click="goBack"
                >
                    {{ tr('COMMON.BTN_CANCEL') }}
                </p-button>

                <p-button class="add-btn" style-type="primary" @click="clickAdd">
                    {{ tr('COMMON.BTN_ADD') }}
                </p-button>
            </p-row>
        </p-pane-layout>
        <p-table-check-modal
            v-if="!!checkTableModalState.mode"
            :visible.sync="checkTableModalState.visible"
            :header-title="checkTableModalState.title"
            :sub-title="checkTableModalState.subTitle"
            :theme-color="checkTableModalState.themeColor"
            :fields="modalFields"
            size="lg"
            :centered="true"
            :selectable="false"
            :items="getSelectedCdItems"
            @confirm="checkModalConfirm"
        />
        <p-cdg-form v-if="cdgFormState.visible"
                    :header-title="cdgFormState.headerTitle"
                    :update-mode="cdgFormState.updateMode"
                    :visible.sync="cdgFormState.visible"
                    @confirm="cdgFormConfirm"
        />
    </div>
</template>
<script>
import {
    reactive, toRefs, ref, computed,
} from '@vue/composition-api';
import router from 'vue-router';
import { requestToolboxTableMetaReactive } from '@/components/organisms/tables/toolbox-table/ToolboxTable.util';
import { timestampFormatter, getValue } from '@/lib/util';
import { makeTrItems } from '@/lib/view-helper';
import cdgEventBus from '@/views/secret/credentials-group/CredentialsGroupEventBus';
import PButton from '@/components/atoms/buttons/Button.vue';
import PRow from '@/components/atoms/grid/row/Row.vue';
import PCol from '@/components/atoms/grid/col/Col.vue';
import PTag, { tagList } from '@/components/molecules/tags/Tag.vue';
import PToolboxTable from '@/components/organisms/tables/toolbox-table/ToolboxTable.vue';
import PSearch from '@/components/molecules/search/Search.vue';
// import PCdData from '@/views/secret/credentials-group/pages/AddCredentials.vue';
import PBoxLayout from '@/components/molecules/layouts/box-layout/BoxLayout.vue';
import PTableCheckModal from '@/components/organisms/modals/action-modal/ActionConfirmModal.vue';
import PPaneLayout from '@/components/molecules/layouts/pane-layout/PaneLayout.vue';
import PI from '@/components/atoms/icons/PI.vue';
import PCdgForm from '@/views/secret/credentials-group/modules/CredentialGroupForm.vue';

export const CdTableReactive = parent => reactive({
    fields: makeTrItems([
        ['credential_id', 'COMMON.ID'],
        ['name', 'COMMON.NAME'],
        ['created_at', 'COMMON.CREATE'],
    ],
    parent),
    modalFields: makeTrItems([
        ['credential_id', 'COMMON.ID'],
        ['name', 'COMMON.NAME'],
    ],
    parent),
    selectIndex: [],
    items: [],
    searchText: '',
    loading: false,
    toolbox: null, // template refs
    tagTools: tagList(),
});
export const eventNames = {
    tagResetEvent: '',
    tagConfirmEvent: '',
    getCdList: '',
    getCdData: '',
    addCd: '',
    deleteCd: '',
};

export const cdgSetup = (props, context, eventName) => {
    const eventBus = cdgEventBus;
    const tableState = CdTableReactive(context.parent);
    const tags = ref({});
    const state = requestToolboxTableMetaReactive();
    const getCd = () => {
        eventBus.$emit(eventName.getCdList);
    };
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
            ids.push(item.credential_id); // 여기서 item의 해당하는 값 잘 확인하기!!
        });
        return ids;
    });
    const getFirstSelectedCdId = computed(() => (getSelectedCdIds.value.length >= 1 ? getSelectedCdIds[0] : ''));

    const cdgFormState = reactive({
        visible: false,
        mode: '',
        headerTitle: '',
        item: null,
        eventName: '',
    });

    const checkTableModalState = reactive({
        visible: false,
        mode: '',
        item: null,
        confirmEventName: '',
        title: '',
        subTitle: '',
        themeColor: '',
    });


    const clickAdd = () => {
        checkTableModalState.mode = 'add';
        checkTableModalState.confirmEventName = eventName.addCd;
        checkTableModalState.title = 'Add Credentials';
        checkTableModalState.subTitle = '[Mockup Text] test';
        checkTableModalState.themeColor = 'primary';
        checkTableModalState.visible = true;
    };


    const cdgFormConfirm = (item) => {
        eventBus.$emit(cdgFormState.eventName, item);
        cdgFormState.visible = false;
        cdgFormState.mode = '';
    };

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
        tags,
        timestampFormatter,
        checkTableModalState,
        getCd,
        ...eventName,
        getSelectedCdItems,
        getSelectedCdIds,
        getFirstSelectedCdId,
        cdgFormState,
        clickAdd,
        cdgFormConfirm,
        checkModalConfirm,
    });
};
export default {
    name: 'AddCdgTemplate',
    filters: {
        getValue,
    },
    components: {
        PI,
        PPaneLayout,
        PToolboxTable,
        PButton,
        PCdgForm,
        PSearch,
        PBoxLayout,
        PTableCheckModal,
        PRow,
        PCol,
    },
    setup(props, context) {
        const dataBind = reactive({
            items: computed(() => []),
        });
        const state = cdgSetup(props, context, eventNames);

        return {
            ...toRefs(state),
            ...toRefs(dataBind),
            goBack: () => {
                console.log('context', context);
                context.root.$router.push('/secret/credentials-group');
            },
        };
    },
};
</script>

<style lang="scss" scoped>
    .back {
        color: #A5ACCE;
    }

    .add-cdg-container {
        margin-top: 0.75rem;
        padding: 1rem;
    }

    .left-toolbox-item {
        min-width: 30rem;
    }

    .title {
        font-size: 1.5rem;
        padding-top: 1.4rem;
        padding-bottom: 1.5rem;
    }

    .toolbox-table {
        padding: 0px;
        margin-bottom: 1.28rem;
    }

    .cancel-btn {
        margin-right: auto;
    }

    .addCdg{
        margin-top: 1.5625rem;
        margin-left: 2rem;
        margin-right: 2rem;
    }

    .tag-container {
        min-height: 80px;
        margin-bottom: 1.75rem;
    }
</style>
