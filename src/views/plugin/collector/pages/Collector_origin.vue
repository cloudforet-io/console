<template>
    <general-page-layout class="collector-page">
        <div class="page-navigation">
            <p-page-navigation :routes="route" />
        </div>
        <p-page-title :title="$t('WORD.COLLECTOR')"
                      use-total-count
                      :total-count="apiHandler.totalCount.value"
        />
        <p-horizontal-layout>
            <template #container="{ height }">
                <s-dynamic-layout v-bind="mainTableLayout" :toolset="apiHandler"
                                  :vbind="{
                                      showTitle: false,
                                      resourceType: 'inventory.Collector',
                                      width: '1020px'
                                  }"
                                  :style="{height: `${height}px`}"
                >
                    <template #toolbox-left>
                        <p-icon-text-button style-type="primary-dark"
                                            name="ic_plus_bold"
                                            @click="$router.push({path: '/plugin/collector/create/plugins'})"
                        >
                            {{ $t('BTN.CREATE') }}
                        </p-icon-text-button>
                        <p-dropdown-menu-btn class="left-toolbox-item"
                                             :menu="dropdown"
                                             @click-update="onClickUpdate"
                                             @click-enable="onClickEnable"
                                             @click-disable="onClickDisable"
                                             @click-delete="onClickDelete"
                                             @click-collectData="onClickCollectData"
                        >
                            {{ $t('BTN.ACTION') }}
                        </p-dropdown-menu-btn>
                    </template>
                    <template #col-name-format="data">
                        <p-lazy-img :img-url="getIcon(data)"
                                    width="1.5rem" height="1.5rem" class="mr-2"
                        />
                        {{ data.value }}
                    </template>
                </s-dynamic-layout>
            </template>
        </p-horizontal-layout>

        <p-tab v-if="apiHandler.tableTS.selectState.isSelectOne"
               :tabs="singleItemTab.state.tabs"
               :active-tab.sync="singleItemTab.syncState.activeTab"
        >
            <template #detail>
                <collector-detail :collector-id="apiHandler.tableTS.selectState.firstSelectItem.collector_id" />
            </template>
            <template #tag>
                <s-tags-panel :is-show="singleItemTab.syncState.activeTab==='tag'"
                              :resource-id="apiHandler.tableTS.selectState.firstSelectItem.collector_id"
                              tag-page-name="collectorTags"
                />
            </template>
            <template #credentials>
                <collector-credentials :collector-id="apiHandler.tableTS.selectState.firstSelectItem.collector_id" />
            </template>
            <template #schedules>
                <collector-schedules :collector-id="apiHandler.tableTS.selectState.firstSelectItem.collector_id" />
            </template>
        </p-tab>
        <p-tab v-else-if="apiHandler.tableTS.selectState.isSelectMulti"
               :tabs="multiItemTab.state.tabs" :active-tab.sync="multiItemTab.syncState.activeTab"
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
                            :collector-id="apiHandler.tableTS.selectState.firstSelectItem.collector_id"
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
                             @confirm="checkModalConfirm"
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
import PHorizontalLayout from '@/components/organisms/layouts/horizontal-layout/PHorizontalLayout.vue';
import SDynamicLayout from '@/views/common/dynamic-layout/SDynamicLayout.vue';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/PDropdownMenuBtn.vue';
import PLazyImg from '@/components/organisms/lazy-img/PLazyImg.vue';
import PIconTextButton from '@/components/molecules/buttons/icon-text-button/PIconTextButton.vue';
import PPageTitle from '@/components/organisms/title/page-title/PPageTitle.vue';

import { QuerySearchTableFluentAPI } from '@/lib/api/table';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';
import { ComponentInstance } from '@vue/composition-api/dist/component';
import { Component } from 'vue/types/umd';
import { showErrorMessage } from '@/lib/util';
import {
    TabBarState,
} from '@/components/molecules/tabs/tab-bar/PTabBar.toolset';
import {
    makeQueryStringComputed,
    makeQueryStringComputeds, queryStringToNumberArray,
    queryStringToQueryTags,
    queryTagsToQueryString, selectIndexAutoReplacer,
} from '@/lib/router-query-string';
import {
    makeQuerySearchHandlersWithSearchSchema,
} from '@/lib/component-utils/query-search';
import PPageNavigation from '@/components/molecules/page-navigation/PPageNavigation.vue';
import { QuerySearchTableProps } from '@/components/organisms/tables/query-search-table/type';

const PTab = (): Component => import('@/components/organisms/tabs/tab/PTab.vue') as Component;
const PTableCheckModal = (): Component => import('@/components/organisms/modals/table-modal/PTableCheckModal.vue') as Component;
const STagsPanel = (): Component => import('@/views/common/tags/tag-panel/TagsPanel.vue') as Component;
const CollectorUpdateModal = (): Component => import('@/views/plugin/collector/modules/CollectorUpdateModal.vue') as Component;
const CollectDataModal = (): Component => import('@/views/plugin/collector/modules/CollectDataModal.vue') as Component;
const CollectorDetail = (): Component => import('@/views/plugin/collector/modules/CollectorDetail.vue') as Component;
const CollectorCredentials = (): Component => import('@/views/plugin/collector/modules/CollectorCredentials.vue') as Component;
const CollectorSchedules = (): Component => import('@/views/plugin/collector/modules/CollectorSchedules.vue') as Component;

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
        PPageNavigation,
    },
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    setup(props, context) {
        const vm = getCurrentInstance() as ComponentInstance;
        const collectorApi = fluentApi.inventory().collector();

        const handlers = makeQuerySearchHandlersWithSearchSchema({
            title: 'Properties',
            items: [
                { key: 'collector_id', name: 'Collector ID' },
                { key: 'name', name: 'Name' },
                { key: 'state', name: 'State', enums: ['ENABLED', 'DISABLED'] },
                // { key: 'priority', name: 'Priority', data_type: 'integer' },
                { key: 'plugin_info.options.supported_resource_type', name: 'Resource Type' },
                { key: 'plugin_info.plugin_id', name: 'Plugin ID' },
                { key: 'plugin_info.version', name: 'Plugin Version' },
                { key: 'provider', name: 'Provider' },
                // { key: 'created_at', name: 'Created', data_type: 'datetime' },
                // { key: 'last_collected_at', name: 'Last Collected', data_type: 'datetime' },
            ],
        }, 'inventory.Collector');

        const apiHandler = new QuerySearchTableFluentAPI(
            collectorApi.list(),
            {
                selectable: true,
                sortable: true,
                hover: true,
                settingVisible: false,
                useCursorLoading: true,
                excelVisible: true,
            },
            undefined,
            handlers,
            // {
            //     keyItems: makeKeyItems(args.keys),
            //     valueHandlerMap: {
            //         ...makeValueHandlerMapWithReference([
            //             ['collector_id', 'ID'],
            //             ['name', 'Name']],
            //         'inventory.Collector'),
            //         state: getEnumValueHandler(['ENABLED', 'DISABLED']),
            //         'plugin_info.options.supported_resource_type': getEnumValueHandler(['SERVER', 'NETWORK', 'SUBNET', 'IP_ADDRESS']),
            //     },
            // },
        );

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

        const singleItemTab = new TabBarState(
            {
                tabs: computed(() => makeTrItems([
                    ['detail', 'PANEL.DETAILS', { keepAlive: true }],
                    ['tag', 'TAB.TAG', { keepAlive: true }],
                    ['credentials', 'PANEL.CREDENTIAL', { keepAlive: true }],
                    ['schedules', 'PANEL.SCHEDULE', { keepAlive: true }],
                ],
                context.parent)),
            },
            {
                activeTab: 'detail',
            },
        );

        const multiItemTab = new TabBarState(
            {
                tabs: makeTrItems([
                    ['data', 'TAB.SELECTED_DATA', { keepAlive: true }],
                ], context.parent),
            },
            {
                activeTab: 'data',
            },
        );

        const state = reactive({
            dropdown: computed(() => (
                makeTrItems([
                    ['update', 'BTN.UPDATE', { disabled: apiHandler.tableTS.selectState.isSelectMulti || apiHandler.tableTS.selectState.isNotSelected }],
                    [null, null, { type: 'divider' }],
                    ['enable', 'BTN.ENABLE', { disabled: apiHandler.tableTS.selectState.isNotSelected }],
                    ['disable', 'BTN.DISABLE', { disabled: apiHandler.tableTS.selectState.isNotSelected }],
                    ['delete', 'BTN.DELETE', { disabled: apiHandler.tableTS.selectState.isNotSelected }],
                    [null, null, { type: 'divider' }],
                    ['collectData', 'BTN.COLLECT_DATA', { disabled: apiHandler.tableTS.selectState.isSelectMulti || apiHandler.tableTS.selectState.isNotSelected }],
                ], null, { type: 'item' }))),
            mainTableLayout: computed(() => ({
                name: vm.$t('WORD.COLLECTOR'),
                type: 'query-search-table',
                options: {
                    fields: [
                        { key: 'name', name: vm.$t('COMMON.NAME'), options: { width: '14rem' } },
                        {
                            key: 'state',
                            name: vm.$t('COMMON.STATE'),
                            type: 'enum',
                            options: {
                                ENABLED: { type: 'state', options: { icon: { color: 'safe' } } },
                                DISABLED: { type: 'state', options: { icon: { color: 'alert' } } },
                                width: '7rem',
                            },
                        },
                        { key: 'priority', name: vm.$t('COMMON.PRIORITY'), options: { width: '5.5rem' } },
                        {
                            key: 'last_collected_at.seconds',
                            name: vm.$t('COMMON.LAST_COL'),
                            type: 'datetime',
                            options: {
                                // eslint-disable-next-line camelcase
                                source_type: 'timestamp',
                                // eslint-disable-next-line camelcase
                                source_format: 'seconds',
                                width: '9rem',
                            },
                        },
                        {
                            key: 'created_at.seconds',
                            name: vm.$t('COMMON.CREATED'),
                            width: '9rem',
                            type: 'datetime',
                            options: {
                                // eslint-disable-next-line camelcase
                                source_type: 'timestamp',
                                // eslint-disable-next-line camelcase
                                source_format: 'seconds',
                                width: '9rem',
                            },
                        },
                    ],
                },
            })),
            multiDataLayout: computed(() => ({
                name: vm.$t('TAB.SELECTED_DATA'),
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

        const mainTable: Partial<QuerySearchTableProps> = reactive({
            fields: [
                { name: 'name', label: 'Name', width: '14rem' },
                { name: 'state', label: 'State', width: '7rem' },
                { name: 'priority', label: 'Priority', width: '14rem' },
                { name: 'last_collected_at.seconds', label: 'Last Collected', width: '9rem' },
                { name: 'created_at.seconds', label: 'Created', width: '9rem' },
            ],
            items: [],
            loading: true,

        });

        const routeState = reactive({
            route: [{ name: 'Plugin', path: '/plugin' }, { name: 'Collector', path: '/plugin/collector' }],
        });

        const onClickUpdate = (): void => {
            updateModalState.visible = true;
        };

        const checkModalConfirm = async (): Promise<void> => {
            try {
                await checkModalState.api.execute();
                context.root.$notify({
                    group: 'noticeTopRight',
                    type: 'success',
                    title: 'success',
                    text: checkModalState.title,
                    duration: 2000,
                    speed: 1000,
                });
            } catch (e) {
                console.error(e);
                showErrorMessage(`Fail to ${checkModalState.title}`, e, context.root);
            } finally {
                checkModalState.visible = false;
                await apiHandler.getData();
            }
        };

        const onClickEnable = (): void => {
            checkModalState.mode = 'enable';
            checkModalState.api = collectorApi.enable()
                .setIds(apiHandler.tableTS.selectState.selectItems.map(d => d.collector_id));
            checkModalState.title = 'Enable Collector';
            checkModalState.subTitle = 'Are you sure you want to ENABLE Selected Collector(s)?';
            checkModalState.themeColor = 'primary';
            checkModalState.visible = true;
        };
        const onClickDisable = (): void => {
            checkModalState.mode = 'disable';
            checkModalState.api = collectorApi.disable()
                .setIds(apiHandler.tableTS.selectState.selectItems.map(d => d.collector_id));
            checkModalState.title = 'Disable Collector';
            checkModalState.subTitle = 'Are you sure you want to DISABLE Selected Collector(s)?';
            checkModalState.themeColor = 'primary';
            checkModalState.visible = true;
        };
        const onClickDelete = (): void => {
            checkModalState.mode = 'delete';
            checkModalState.api = collectorApi.delete()
                .setIds(apiHandler.tableTS.selectState.selectItems.map(d => d.collector_id));
            checkModalState.title = 'Delete Collector';
            checkModalState.subTitle = 'Are you sure you want to DELETE Selected Collector(s)?';
            checkModalState.themeColor = 'alert';
            checkModalState.visible = true;
        };

        const onClickCollectData = (): void => {
            collectDataState.visible = true;
        };

        const queryRefs = {
            f: makeQueryStringComputed(apiHandler.tableTS.querySearch.tags,
                {
                    key: 'f',
                    setter: queryStringToQueryTags,
                    getter: queryTagsToQueryString,
                }),
            ...makeQueryStringComputeds(apiHandler.tableTS.syncState, {
                pageSize: { key: 'ps', setter: Number },
                thisPage: { key: 'p', setter: Number },
                sortBy: { key: 'sb' },
                sortDesc: { key: 'sd', setter: Boolean },
                selectIndex: {
                    key: 'sl',
                    setter: queryStringToNumberArray,
                    autoReplacer: selectIndexAutoReplacer,
                },
            }),
            ...makeQueryStringComputeds(multiItemTab.syncState, {
                activeTab: { key: 'mt' },
            }),
            ...makeQueryStringComputeds(singleItemTab.syncState, {
                activeTab: { key: 'st' },
            }),
        };

        return {
            ...toRefs(state),
            mainTable,
            handlers,
            ...toRefs(routeState),
            singleItemTab,
            multiItemTab,
            updateModalState,
            collectDataState,
            checkModalState,
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

    ul {
        list-style-type: disc;
    }
    li {
        display: list-item;
    }
</style>
