<template>
    <general-page-layout class="collector-page">
        <p-horizontal-layout :line="false">
            <template #container="{ height }">
                <p-toolbox-table :items="items" :fields="fields"
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
                                 :responsive-style="{'height': height+'px', 'overflow-y':'auto', 'overflow-x':'auto'}"
                                 :setting-visible="false"
                                 :loading="loading"
                                 :use-cursor-loading="true"
                                 @changePageSize="getCollectors"
                                 @changePageNumber="getCollectors"
                                 @clickRefresh="getCollectors"
                                 @changeSort="getCollectors"
                >
                    <template slot="toolbox-left">
                        <PIconTextButton style-type="primary-dark"
                                         name="ic_plus_bold"
                                         @click="$router.push({path: '/plugin/collector/create/plugins'})"
                        >
                            {{ $t('BTN.CREATE') }}
                        </PIconTextButton>
                        <PDropdownMenuBtn class="left-toolbox-item"
                                          :menu="dropdown"
                                          @click-update="onClickUpdate"
                                          @click-enable="onClickEnable"
                                          @click-disable="onClickDisable"
                                          @click-delete="onClickDelete"
                                          @click-collectData="onClickCollectData"
                        >
                            {{ $t('BTN.ACTION') }}
                        </PDropdownMenuBtn>
                        <div class="left-toolbox-item">
                            <p-query-search-bar :search-text.sync="searchText"
                                                :autocomplete-handler="AcHandler"
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
                    <template #col-name-format="data">
                        <span class="name">
                            <p-lazy-img :img-url="getIcon(data)"
                                        width="1.5rem" height="1.5rem"
                            />
                            {{ data.value }}
                        </span>
                    </template>
                    <template #col-state-format="{value}">
                        <p-status v-bind="collectorStateFormatter(value)" />
                    </template>
                    <template #col-last_collected_at-format="{value}">
                        {{ value ? timestampFormatter(value) : '' }}
                    </template>
                    <template #col-created_at-format="{value}">
                        {{ timestampFormatter(value) }}
                    </template>
                    <template #col-plugin_info-format="{value}">
                        <template v-if="value.options && value.options.supported_resource_type">
                            <div v-for="(d, i) in value.options.supported_resource_type" :key="i">
                                {{ d }}
                            </div>
                        </template>
                        <span v-else />
                    </template>
                </p-toolbox-table>
            </template>
        </p-horizontal-layout>

        <p-tab v-if="selectIndex.length === 1"
               :tabs="tabs"
               :active-tab.sync="activeTab"
        >
            <template #detail>
                <collector-detail :item="selectedItem" />
            </template>
            <template #tag>
                <s-tags-panel :is-show="activeTab==='tag'"
                              :resource-id="selectedItem.collector_id"
                              tag-page-name="collectorTags"
                />
            </template>
            <template #credentials>
                <collector-credentials :collector="selectedItem"
                                       @collectData="collectByCredential"
                />
            </template>
            <template #schedules>
                <collector-schedules :collector="selectedItem"
                                     :items="scheduleState.items"
                                     :total-count="scheduleState.totalCount"
                                     :loading="scheduleState.loading"
                                     :edit-visible.sync="scheduleState.editVisible"
                                     :delete-visible.sync="scheduleState.deleteVisible"
                                     :select-index.sync="scheduleState.selectIndex"
                />
            </template>
        </p-tab>
        <p-tab v-else-if="selectIndex.length > 1" :tabs="multiTabs" :active-tab.sync="multiActiveTab">
            <template #selected>
                <p-data-table
                    :fields="multiFields"
                    :sortable="false"
                    :selectable="false"
                    :items="multiItems"
                    col-copy
                >
                    <template #col-name-format="data">
                        <span class="name">
                            <p-lazy-img :img-url="getIcon(data)"
                                        width="1.5rem" height="1.5rem"
                            />
                            {{ data.value }}
                        </span>
                    </template>
                    <template #col-state-format="{value}">
                        <p-status v-bind="collectorStateFormatter(value)" />
                    </template>
                </p-data-table>
            </template>
        </p-tab>

        <collector-update-modal v-if="updateModalState.visible"
                                :visible.sync="updateModalState.visible"
                                :loading="updateModalState.loading"
                                :collector="selectedItem"
                                :plugin="updateModalState.plugin"
                                :versions="updateModalState.versions"
        />

        <collect-data-modal v-if="collectDataState.modalVisible"
                            :visible.sync="collectDataState.modalVisible"
                            :collector="selectedItem"
        />

        <p-table-check-modal v-if="checkModalState.mode"
                             :visible.sync="checkModalState.visible"
                             :header-title="checkModalState.title"
                             :sub-title="checkModalState.subTitle"
                             :theme-color="checkModalState.themeColor"
                             :fields="multiFields"
                             size="lg"
                             centered
                             :selectable="false"
                             :items="multiItems"
                             @confirm="checkModalState.checkModalConfirm"
        />
    </general-page-layout>
</template>

<script>
import {
    reactive, toRefs, computed, ref,
} from '@vue/composition-api';
import { timestampFormatter, collectorStateFormatter } from '@/lib/util';
import { makeTrItems } from '@/lib/view-helper';
import collectorEventBus from '@/views/plugin/collector/CollectorEventBus';
import { fluentApi } from '@/lib/fluent-api';

import GeneralPageLayout from '@/views/containers/page-layout/GeneralPageLayout.vue';
import PI from '@/components/atoms/icons/PI.vue';
import PStatus from '@/components/molecules/status/Status.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
import config from '@/lib/config';
import PTag, { tagList } from '@/components/molecules/tags/Tag.vue';
import PRow from '@/components/atoms/grid/row/Row.vue';
import PCol from '@/components/atoms/grid/col/Col.vue';
import PHr from '@/components/atoms/hr/Hr.vue';
import PIconButton from '@/components/molecules/buttons/IconButton.vue';
import PLazyImg from '@/components/organisms/lazy-img/LazyImg.vue';
import PIconTextButton from '@/components/molecules/buttons/IconTextButton.vue';
import STagsPanel from '@/components/organisms/panels/tag-panel/STagsPanel.vue';


const PTab = () => import('@/components/organisms/tabs/tab/Tab');
const PHorizontalLayout = () => import('@/components/organisms/layouts/horizontal-layout/HorizontalLayout');
const PToolboxTable = () => import('@/components/organisms/tables/toolbox-table/ToolboxTable');
const PDataTable = () => import('@/components/organisms/tables/data-table/DataTable.vue');
const PDropdownMenuBtn = () => import('@/components/organisms/dropdown/dropdown-menu-btn/DropdownMenuBtn');
const PQuerySearchBar = () => import('@/components/organisms/search/query-search-bar/QuerySearchBar.vue');
const PTableCheckModal = () => import('@/components/organisms/modals/action-modal/ActionConfirmModal.vue');

const CollectorUpdateModal = () => import('@/views/plugin/collector/modules/CollectorUpdateModal.vue');
const CollectDataModal = () => import('@/views/plugin/collector/modules/CollectDataModal.vue');
const CollectorDetail = () => import('@/views/plugin/collector/modules/CollectorDetail');
const CollectorCredentials = () => import('@/views/plugin/collector/modules/CollectorCredentials');
const CollectorSchedules = () => import('@/views/plugin/collector/modules/CollectorSchedules');

const collectorState = reactive({
    selectIndex: [],
    items: [],
    sortSelectIndex: computed(() => {
        const idxs = [...collectorState.selectIndex];
        idxs.sort((a, b) => a - b);
        return idxs;
    }),
    multiItems: computed(() => collectorState.sortSelectIndex.map(idx => collectorState.items[idx])),
    loading: false,
    getCollectors: () => {
        collectorEventBus.$emit('getCollectorList');
    },
    selectedItem: computed(() => collectorState.items[collectorState.selectIndex[0]]),
});

const setTableData = (props, context) => {
    const state = reactive({
        sortBy: '',
        sortDesc: true,
        pageSize: 15,
        allPage: 1,
        thisPage: 1,
        searchText: '',
        fields: makeTrItems([
            ['name', 'COMMON.NAME'],
            ['state', 'COMMON.STATE'],
            ['priority', 'COMMON.PRIORITY'],
            ['plugin_info', 'COMMON.RESOURCE'],
            ['last_collected_at', 'COMMON.LAST_COL'],
            ['created_at', 'COMMON.CREATED'],
        ],
        context.parent),
        multiFields: makeTrItems([
            ['name', 'COMMON.NAME'],
            ['state', 'COMMON.STATE'],
            ['priority', 'COMMON.PRIORITY'],
        ], context.parent),
        timestampFormatter,
        collectorStateFormatter,
        defaultImg: config.get('COLLECTOR_IMG'),
        getIcon: data => _.get(data, 'item.tags.icon', config.get('COLLECTOR_IMG')),
        queryListTools: tagList(ref([]), true, collectorEventBus, 'getCollectorList'),
    });

    const nothingSelected = computed(() => collectorState.selectIndex.length === 0);
    const onlyOneSelected = computed(() => collectorState.selectIndex.length !== 1);
    const dropdown = reactive({
        ...makeTrItems([
            ['update', 'BTN.UPDATE', { disabled: onlyOneSelected }],
            [null, null, { type: 'divider' }],
            ['enable', 'BTN.ENABLE', { disabled: nothingSelected }],
            ['disable', 'BTN.DISABLE', { disabled: nothingSelected }],
            ['delete', 'BTN.DELETE', { disabled: nothingSelected }],
            [null, null, { type: 'divider' }],
            ['collectData', 'BTN.COLLECT_DATA', { disabled: onlyOneSelected }],
        ],
        context.parent,
        { type: 'item' }),
    });

    return {
        ...toRefs(state),
        dropdown,
    };
};

const setTabData = (props, context) => {
    const state = reactive({
        activeTab: 'detail',
        tabs: makeTrItems([
            ['detail', 'PANEL.DETAILS', { keepAlive: true }],
            ['tag', 'TAB.TAG'],
            ['credentials', 'PANEL.CREDENTIAL', { keepAlive: true }],
            ['schedules', 'PANEL.SCHEDULE', { keepAlive: true }],
        ], context.parent),
        multiActiveTab: 'selected',
        multiTabs: makeTrItems([
            ['selected', 'PANEL.SELECTED', { keepAlive: true }],
        ], context.parent),
    });

    return {
        ...toRefs(state),
    };
};

const crdState = reactive({
    items: [],
    totalCount: 0,
    loading: true,
    query: undefined,
    selectIndex: [],
    verifyModalVisible: false,
    sortSelectIndex: computed(() => {
        const idxs = [...crdState.selectIndex];
        idxs.sort((a, b) => a - b);
        return idxs;
    }),
    selectedItems: computed(() => crdState.sortSelectIndex.map(idx => crdState.items[idx])),
});

const collectDataState = reactive({
    loading: false,
    credentials: [],
    modalVisible: false,
});

const crdVerifyState = reactive({});

const checkModalState = reactive({
    visible: false,
    mode: '',
    item: null,
    confirmEventName: '',
    title: '',
    subTitle: '',
    themeColor: '',
    checkModalConfirm: () => {
        collectorEventBus.$emit(checkModalState.confirmEventName);
    },
});

const updateModalState = reactive({
    visible: false,
    loading: false,
    versions: [],
    plugin: {},
});

const scheduleState = reactive({
    items: [],
    selectIndex: [],
    totalCount: 0,
    collector: null,
    loading: true,
    editLoading: true,
    editVisible: false,
    deleteVisible: false,
});

export const collectorSetup = (props, context, AcHandler) => {
    const state = reactive({
        ...setTableData(props, context),
        ...setTabData(props, context),
        ...toRefs(collectorState),
        crdState,
        collectDataState,
        crdVerifyState,
        checkModalState,
        updateModalState,
        scheduleState,
        AcHandler,
    });

    const onClickUpdate = () => {
        state.updateModalState.visible = true;
    };
    const onClickEnable = () => {
        state.checkModalState.mode = 'enable';
        state.checkModalState.confirmEventName = 'enableCollectors';
        /**
             * TODO: translation
             */
        state.checkModalState.title = 'Enable Collector';
        state.checkModalState.subTitle = 'Are you sure you want to ENABLE Selected Collector(s)?';
        state.checkModalState.themeColor = 'primary';
        state.checkModalState.visible = true;
    };
    const onClickDisable = () => {
        state.checkModalState.mode = 'disable';
        state.checkModalState.confirmEventName = 'disableCollectors';
        /**
             * TODO: translation
             */
        state.checkModalState.title = 'Disable Collector';
        state.checkModalState.subTitle = 'Are you sure you want to DISABLE Selected Collector(s)?';
        state.checkModalState.themeColor = 'primary';
        state.checkModalState.visible = true;
    };
    const onClickDelete = () => {
        state.checkModalState.mode = 'delete';
        state.checkModalState.confirmEventName = 'deleteCollectors';
        /**
             * TODO: translation
             */
        state.checkModalState.title = 'Delete Collector';
        state.checkModalState.subTitle = 'Are you sure you want to DELETE Selected Collector(s)?';
        state.checkModalState.themeColor = 'alert';
        state.checkModalState.visible = true;
    };

    const onClickCollectData = () => {
        collectDataState.credentials = [];
        collectDataState.modalVisible = true;
    };

    const collectByCredential = (crd) => {
        collectDataState.credentials = [crd];
        collectDataState.modalVisible = true;
    };

    return {
        ...toRefs(state),
        onClickUpdate,
        onClickEnable,
        onClickDisable,
        onClickDelete,
        onClickCollectData,
        collectByCredential,
    };
};

export default {
    name: 'Collector',
    components: {
        GeneralPageLayout,
        PStatus,
        PLazyImg,
        PHorizontalLayout,
        PToolboxTable,
        PDataTable,
        PIconTextButton,
        PTag,
        PRow,
        PCol,
        PHr,
        PIconButton,
        PDropdownMenuBtn,
        PTab,
        PQuerySearchBar,
        CollectorUpdateModal,
        PTableCheckModal,
        CollectDataModal,
        CollectorDetail,
        CollectorCredentials,
        CollectorSchedules,
        STagsPanel,
    },
    setup(props, context) {
        return collectorSetup(props, context);
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

    .name {
        .icon {
            margin-right: 0.5rem;
        }
    }

    ul {
        list-style-type: disc;
    }
    li {
        display: list-item;
    }
</style>
