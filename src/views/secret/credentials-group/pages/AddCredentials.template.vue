<template>
    <div class="addCdg">
        <span class="back" @click="goBack">
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
                :selectable="false"
                :sortable="true"
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
                @rowLeftClick="onSelect"
                @changePageSize="getCd"
                @changePageNumber="getCd"
                @clickRefresh="getCd"
                @changeSort="getCd"
            >
                <template slot="toolbox-left">
                    <div class="left-toolbox-item">
                        <PQuerySearchBar :search-text.sync="searchText"
                                         :autocomplete-handler="ACHandler"
                                         @newQuery="queryListTools.addTag"
                        />
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
                <template #col-tags-format="{value}">
                    <p-dict-list :dict="value" />
                </template>
            </p-toolbox-table>
            <p-box-layout class="tag-container">
                <p-tag v-for="(tag, idx) in tagTools.tags" :key="`tag-${tag.name}`"
                       @delete="tagTools.deleteTag(idx)"
                >
                    {{ tag.name }}
                </p-tag>
            </p-box-layout>
            <p-row>
                <p-button class="cancel-btn" style-type="dark" outline
                          @click="goBack"
                >
                    {{ $t('BTN.CANCEL') }}
                </p-button>

                <p-button class="add-btn" style-type="primary-dark" @click="clickAdd">
                    {{ $t('BTN.ADD') }}
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
                    :items="cdgFormState.items"
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
import { requestToolboxTableMetaReactive } from '@/components/organisms/tables/toolbox-table/ToolboxTable.util';
import { timestampFormatter, getValue } from '@/lib/util';
import { makeTrItems } from '@/lib/view-helper';
import cdgEventBus from '@/views/secret/credentials-group/CredentialsGroupEventBus';
import PButton from '@/components/atoms/buttons/Button.vue';
import PRow from '@/components/atoms/grid/row/Row.vue';
import PCol from '@/components/atoms/grid/col/Col.vue';
import PHr from '@/components/atoms/hr/Hr.vue';
import PTag, { tagList } from '@/components/molecules/tags/Tag.vue';
import PToolboxTable from '@/components/organisms/tables/toolbox-table/ToolboxTable.vue';
import PQuerySearchBar from '@/components/organisms/search/query-search-bar/QuerySearchBar.vue';
import PBoxLayout from '@/components/molecules/layouts/box-layout/BoxLayout.vue';
import PTableCheckModal from '@/components/organisms/modals/action-modal/ActionConfirmModal.vue';
import PPaneLayout from '@/components/molecules/layouts/pane-layout/PaneLayout.vue';
import PI from '@/components/atoms/icons/PI.vue';
import PCdgForm from '@/views/secret/credentials-group/modules/CredentialGroupForm.vue';
import PIconButton from '@/components/molecules/buttons/IconButton.vue';

const PDictList = () => import('@/components/molecules/lists/DictList');

export const CdTableReactive = parent => reactive({
    fields: makeTrItems([
        ['credential_id', 'COMMON.ID'],
        ['name', 'COMMON.NAME'],
        ['tags', 'COMMON.TAG'],
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
    duplicateCheckEvent: '',
};

export const cdgSetup = (props, context, eventName, ACHandler) => {
    const eventBus = cdgEventBus;
    const tableState = CdTableReactive(context.parent);
    const tags = ref({});
    const state = requestToolboxTableMetaReactive();
    const getCd = () => {
        eventBus.$emit(eventName.getCdList);
    };

    const getSelectedCdItems = computed(() => {
        const items = [];
        for (let idx = 0; idx < tableState.tagTools.tags.length; idx++) { // 추후 리팩토링 예정
            items.push(tableState.tagTools.tags[idx]);
        }
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
        searchText: '',
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
        searchText: '',
    });

    const onSelect = async (item) => {
        let credentialId = item.credential_id;
        let result = false;
        await context.parent.$http.post('/secret/credential/list', {
            query: {
                minimal: true,
                filter: [{
                    k: 'credential_id',
                    v: [credentialId],
                    o: 'in',
                }],
            },
            include_credential_group: true,
            credential_group_id: context.root.$route.params.id,
            count_only: true,
        }).then((res) => {
            if (res.data.total_count === 1) {
                context.root.$notify({
                    group: 'noticeBottomRight',
                    type: 'alert',
                    title: 'Fail',
                    text: 'Duplicate credentials',
                    duration: 2000,
                    speed: 1000,
                });
                result = false;
            } else {
                result = true;
            }
        });
        if (result === true) {
            tableState.tagTools.addTag(item);
        }
    };

    const clickAdd = () => {
        checkTableModalState.mode = 'add';
        checkTableModalState.confirmEventName = eventName.addCd;
        checkTableModalState.title = 'Add Credentials';
        checkTableModalState.subTitle = 'Are you sure you want to add selected Credential(s) below?';
        checkTableModalState.themeColor = 'primary';
        checkTableModalState.items = null;
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
        eventBus.$emit(checkTableModalState.confirmEventName, event);
        resetCheckTableModalState();
    };

    const queryList = ref([]);
    const queryListTools = tagList(queryList, true, eventBus, eventName.getCdList);

    return reactive({
        ...toRefs(state),
        ...toRefs(tableState),
        tags,
        timestampFormatter,
        checkTableModalState,
        getCd,
        onSelect,
        ...eventNames,
        getSelectedCdItems,
        getSelectedCdIds,
        getFirstSelectedCdId,
        cdgFormState,
        clickAdd,
        cdgFormConfirm,
        checkModalConfirm,
        ACHandler,
        queryListTools,
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
        PQuerySearchBar,
        PBoxLayout,
        PTableCheckModal,
        PRow,
        PCol,
        PHr,
        PIconButton,
        PTag,
        PDictList,
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
                context.root.$router.push('/secret/credentials-group');
            },
        };
    },
};
</script>

<style lang="postcss" scoped>
    .back {
        color: #A5ACCE;
        cursor: pointer;
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
