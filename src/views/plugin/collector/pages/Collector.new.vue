<template>
    <general-page-layout class="collector-page">
        <p-page-title :title="$t('WORD.COLLECTOR')"
                      class="ml-4"
                      use-total-count use-selected-count
                      :total-count="apiHandler.totalCount.value"
                      :selected-count="apiHandler.tableTS.selectState.selectItems.length"
        />
        <p-horizontal-layout>
            <template #container="{ height }">
                <s-dynamic-layout v-bind="mainTableLayout" :toolset="apiHandler"
                                  :vbind="{responsiveStyle: { height: `${height}px`, overflow: 'auto' }, showTitle: false}"
                >
                    <template #toolbox-left>
                        <p-icon-text-button style-type="primary-dark"
                                            name="ic_plus_bold"
                                            @click="$router.push({path: '/plugin/collector/create/plugins'})"
                        >
                            {{ $t('BTN.CREATE') }}
                        </p-icon-text-button>
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
                    </template>
                    <template #col-name-format="data">
                        <span class="name">
                            <p-lazy-img :img-url="getIcon(data)"
                                        width="1.5rem" height="1.5rem"
                            />
                            {{ data.value }}
                        </span>
                    </template>
                </s-dynamic-layout>
            </template>
        </p-horizontal-layout>

        <p-tab v-if="apiHandler.tableTS.selectState.isSelectOne"
               :tabs="tabState.tabs"
               :active-tab.sync="tabState.activeTab"
        >
            <template #detail>
                <collector-detail :collector-id="apiHandler.tableTS.selectState.firstSelectItem.collector_id" />
            </template>
            <template #tag>
                <s-tags-panel :is-show="tabState.activeTab==='tag'"
                              :resource-id="apiHandler.tableTS.selectState.firstSelectItem.collector_id"
                              tag-page-name="collectorTags"
                />
            </template>
            <template #credentials>
                <collector-credentials :collector="apiHandler.tableTS.selectState.firstSelectItem" />
            </template>
            <template #schedules>
                <collector-schedules :collector-id="apiHandler.tableTS.selectState.firstSelectItem.collector_id" />
            </template>
        </p-tab>
        <p-tab v-else-if="apiHandler.tableTS.selectState.isSelectMulti"
               :tabs="tabState.multiTabs" :active-tab.sync="tabState.multiActiveTab"
        >
            <template #data>
                <s-dynamic-layout v-bind="multiDataLayout"
                                  :data="apiHandler.tableTS.selectState.selectItems"
                                  :vbind="{colCopy: true}"
                />
            </template>
        </p-tab>

        <collector-update-modal v-if="updateModalState.visible"
                                :visible.sync="updateModalState.visible"
                                :collector-id="apiHandler.tableTS.selectState.firstSelectItem.collector_id"
        />

        <collect-data-modal v-if="collectDataState.visible"
                            :visible.sync="collectDataState.visible"
                            :collector="apiHandler.tableTS.selectState.firstSelectItem"
        />

        <p-table-check-modal v-if="checkModalState.visible"
                             :visible.sync="checkModalState.visible"
                             :header-title="checkModalState.title"
                             :sub-title="checkModalState.subTitle"
                             :theme-color="checkModalState.themeColor"
                             :fields="checkModalState.tableCheckFields"
                             size="lg"
                             centered
                             :selectable="false"
                             :items="apiHandler.tableTS.selectState.selectItems"
                             @confirm="checkModalState.checkModalConfirm"
        />
    </general-page-layout>
</template>

<script lang="ts">
/* eslint-disable class-methods-use-this */

import {
    reactive, toRefs, computed, getCurrentInstance,
} from '@vue/composition-api';
import { makeTrItems } from '@/lib/view-helper';
import { ActionAPIInterface, fluentApi } from '@/lib/fluent-api';
import _ from 'lodash';

import GeneralPageLayout from '@/views/containers/page-layout/GeneralPageLayout.vue';
import PHorizontalLayout from '@/components/organisms/layouts/horizontal-layout/HorizontalLayout.vue';
import SDynamicLayout from '@/components/organisms/dynamic-view/dynamic-layout/SDynamicLayout.vue';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/DropdownMenuBtn.vue';
import PLazyImg from '@/components/organisms/lazy-img/PLazyImg.vue';
import PIconTextButton from '@/components/molecules/buttons/IconTextButton.vue';
import PPageTitle from '@/components/organisms/title/page-title/PageTitle.vue';

import { QuerySearchTableFluentAPI } from '@/lib/api/table';
import {
    getEnumValues, makeValuesFetchHandler,
} from '@/components/organisms/search/query-search-bar/autocompleteHandler';
import { QSTableACHandlerArgs, QuerySearchTableACHandler } from '@/lib/api/auto-complete';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';
import { VueFileImport } from '@/lib/type';
import { dateTimeViewType } from '@/lib/data-source';

const PTab = (): VueFileImport => import('@/components/organisms/tabs/tab/Tab.vue');
const PTableCheckModal = (): VueFileImport => import('@/components/organisms/modals/table-modal/TableCheckModal.vue');
const STagsPanel = (): VueFileImport => import('@/components/organisms/panels/tag-panel/STagsPanel.vue');
const CollectorUpdateModal = (): VueFileImport => import('@/views/plugin/collector/modules/CollectorUpdateModal.vue');
const CollectDataModal = (): VueFileImport => import('@/views/plugin/collector/modules/CollectDataModal.vue');
const CollectorDetail = (): VueFileImport => import('@/views/plugin/collector/modules/CollectorDetail.vue');
const CollectorCredentials = (): VueFileImport => import('@/views/plugin/collector/modules/CollectorCredentials.vue');
const CollectorSchedules = (): VueFileImport => import('@/views/plugin/collector/modules/CollectorSchedules.vue');

const collectorApi = fluentApi.inventory().collector();

const checkModalState: UnwrapRef<{
    visible: boolean; mode: string; title: string; subTitle: string; themeColor: string; api: ActionAPIInterface;
}> = reactive({
    visible: false,
    mode: '',
    title: '',
    subTitle: '',
    themeColor: '',
    api: collectorApi.enable(),
    tableCheckFields: computed(() => makeTrItems([
        ['name', 'COMMON.NAME'],
        ['state', 'COMMON.STATE'],
        ['priority', 'COMMON.PRIORITY'],
    ])),
});

const updateModalState = reactive({
    visible: false,
});

const collectDataState = reactive({
    visible: false,
});

export default {
    name: 'Collector',
    components: {
        PPageTitle,
        GeneralPageLayout,
        PLazyImg,
        PHorizontalLayout,
        PIconTextButton,
        PDropdownMenuBtn,
        PTab,
        CollectorUpdateModal,
        PTableCheckModal,
        CollectDataModal,
        CollectorDetail,
        CollectorCredentials,
        CollectorSchedules,
        STagsPanel,
        SDynamicLayout,
    },
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    setup(props, context) {
        const vm: any = getCurrentInstance();
        class ACHandler extends QuerySearchTableACHandler {
            get valuesFetchUrl(): string { return '/inventory/collector/list'; }

            get valuesFetchKeys(): string[] { return ['collector_id', 'name']; }

            constructor(args: QSTableACHandlerArgs) {
                super(args);
                this.handlerMap.value = [
                    ...makeValuesFetchHandler(
                        context.parent,
                        '/inventory/collector/list',
                        ['collector_id', 'name'],
                    ),
                    getEnumValues('state', ['ENABLED', 'DISABLED']),
                    getEnumValues('plugin_info.options.supported_resource_type', ['SERVER', 'NETWORK', 'SUBNET', 'IP_ADDRESS']),
                ];
            }
        }
        const apiHandler = new QuerySearchTableFluentAPI(
            collectorApi.list(),
            {
                selectable: true,
                sortable: true,
                dragable: true,
                hover: true,
                responsive: true,
                settingVisible: false,
                useCursorLoading: true,
                excelVisible: true,
            },
            undefined,
            {
                handlerClass: ACHandler,
                args: {
                    keys: ['collector_id', 'name', 'state', 'priority', 'plugin_info.options.supported_resource_type'],
                    suggestKeys: ['collector_id', 'name'],
                },
            },
        );


        const tabState = reactive({
            activeTab: 'detail',
            tabs: computed(() => makeTrItems([
                ['detail', 'PANEL.DETAILS', { keepAlive: true }],
                ['tag', 'TAB.TAG', { keepAlive: true }],
                ['credentials', 'PANEL.CREDENTIAL', { keepAlive: true }],
                ['schedules', 'PANEL.SCHEDULE', { keepAlive: true }],
            ])),
            multiActiveTab: 'data',
            multiTabs: computed(() => makeTrItems([
                ['data', 'TAB.DATA', { keepAlive: true }],
            ])),
        });
        const state = reactive({
            dropdown: computed(() => (
                makeTrItems([
                    ['update', 'BTN.UPDATE', { disabled: apiHandler.tableTS.selectState.isSelectMulti }],
                    [null, null, { type: 'divider' }],
                    ['enable', 'BTN.ENABLE', { disabled: apiHandler.tableTS.selectState.isNotSelected }],
                    ['disable', 'BTN.DISABLE', { disabled: apiHandler.tableTS.selectState.isNotSelected }],
                    ['delete', 'BTN.DELETE', { disabled: apiHandler.tableTS.selectState.isNotSelected }],
                    [null, null, { type: 'divider' }],
                    ['collectData', 'BTN.COLLECT_DATA', { disabled: apiHandler.tableTS.selectState.isSelectMulti }],
                ], null, { type: 'item' }))),
            mainTableLayout: computed<any>(() => ({
                name: vm.$t('WORD.COLLECTOR'),
                type: 'query-search-table',
                options: {
                    fields: [
                        { key: 'name', name: vm.$t('COMMON.NAME') },
                        {
                            key: 'state',
                            name: vm.$t('COMMON.STATE'),
                            type: 'enum',
                            options: {
                                ENABLED: { type: 'state', options: { icon: { color: 'safe' } } },
                                DISABLED: { type: 'state', options: { icon: { color: 'alert' } } },
                            },
                        },
                        { key: 'priority', name: vm.$t('COMMON.PRIORITY') },
                        {
                            key: 'plugin_info.options.supported_resource_type',
                            name: vm.$t('COMMON.RESOURCE'),
                            type: 'list',
                            options: {
                                item: { type: 'badge' }, delimiter: ', ',
                            },
                        },
                        { key: 'last_collected_at.seconds', name: vm.$t('COMMON.LAST_COL'), ...dateTimeViewType },
                        { key: 'created_at.seconds', name: vm.$t('COMMON.CREATED'), ...dateTimeViewType },
                    ],
                },
            })),
            multiDataLayout: computed<any>(() => ({
                name: vm.$t('TAB.DATA'),
                type: 'simple-table',
                options: {
                    fields: [
                        { key: 'name', name: vm.$t('COMMON.NAME') },
                        {
                            key: 'state',
                            name: vm.$t('COMMON.STATE'),
                            type: 'enum',
                            options: {
                                ENABLED: { type: 'state', options: { icon: { color: 'safe' } } },
                                DISABLED: { type: 'state', options: { icon: { color: 'alert' } } },
                            },
                        },
                        { key: 'priority', name: vm.$t('COMMON.PRIORITY') },
                    ],
                },
            })),
        });

        const onClickUpdate = (): void => {
            updateModalState.visible = true;
        };

        const checkModalConfirm = async (): Promise<void> => {
            try {
                await checkModalState.api.execute();
                context.root.$notify({
                    group: 'noticeBottomRight',
                    type: 'success',
                    title: 'success',
                    text: checkModalState.title,
                    duration: 2000,
                    speed: 1000,
                });
            } catch (e) {
                console.error(e);
                context.root.$notify({
                    group: 'noticeBottomRight',
                    type: 'alert',
                    title: 'Fail',
                    text: e.message,
                    duration: 2000,
                    speed: 1000,
                });
            } finally {
                checkModalState.visible = false;
            }
        };

        const onClickEnable = (): void => {
            checkModalState.mode = 'enable';
            checkModalState.api = collectorApi.enable()
                .setId(apiHandler.tableTS.selectState.firstSelectItem.collector_id);
            checkModalState.title = 'Enable Collector';
            checkModalState.subTitle = 'Are you sure you want to ENABLE Selected Collector(s)?';
            checkModalState.themeColor = 'primary';
            checkModalState.visible = true;
        };
        const onClickDisable = (): void => {
            checkModalState.mode = 'disable';
            checkModalState.api = collectorApi.disable()
                .setId(apiHandler.tableTS.selectState.firstSelectItem.collector_id);
            checkModalState.title = 'Disable Collector';
            checkModalState.subTitle = 'Are you sure you want to DISABLE Selected Collector(s)?';
            checkModalState.themeColor = 'primary';
            checkModalState.visible = true;
        };
        const onClickDelete = (): void => {
            checkModalState.mode = 'delete';
            checkModalState.api = collectorApi.delete()
                .setId(apiHandler.tableTS.selectState.firstSelectItem.collector_id);
            checkModalState.title = 'Delete Collector';
            checkModalState.subTitle = 'Are you sure you want to DELETE Selected Collector(s)?';
            checkModalState.themeColor = 'alert';
            checkModalState.visible = true;
        };

        const onClickCollectData = (): void => {
            collectDataState.visible = true;
        };


        return {
            ...toRefs(state),
            tabState,
            updateModalState,
            collectDataState,
            checkModalState,
            ACHandler,
            apiHandler,
            getIcon: (data): void => _.get(data, 'item.tags.icon', ''),
            onClickUpdate,
            onClickEnable,
            onClickDisable,
            onClickDelete,
            onClickCollectData,
            checkModalConfirm,
        };
    },
};
</script>

<style lang="postcss" scoped>
    .left-toolbox-item {
        @apply mx-4;
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
