<template>
    <general-page-layout class="collector-page">
        <div class="page-navigation">
            <p-page-navigation :routes="routes" />
        </div>
        <p-page-title :title="$t('WORD.COLLECTOR')"
                      use-total-count
                      :total-count="totalCount"
        />
        <p-horizontal-layout>
            <template #container="{ height }">
                <p-query-search-table
                    :fields="fields"
                    :items="items"
                    :key-items="querySearchHandlers.keyItems"
                    :value-handler-map="querySearchHandlers.valueHandlerMap"
                    :loading="loading"
                    :total-count="totalCount"
                    :query-tags="searchTags"
                    :sort-by.sync="sortBy"
                    :sort-desc.sync="sortDesc"
                    :this-page.sync="thisPage"
                    :page-size.sync="pageSize"
                    @select="onSelect"
                    @change="onChange"
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
                    <template #col-state-format="data">
                        <p-status :text="data.value" :theme="data.value" />
                    </template>
                    <template #col-last_collected_at-format="{ value }">
                        {{ value ? timestampFormatter(value) : '' }}
                    </template>
                    <template #col-created_at-format="{ value }">
                        {{ timestampFormatter(value) }}
                    </template>
                </p-query-search-table>
            </template>
        </p-horizontal-layout>

        <p-tab v-if="selectedItems.length === 1"
               :tabs="singleItemTab.state.tabs"
               :active-tab.sync="singleItemTab.syncState.activeTab"
        >
            <template #detail>
                <collector-detail :collector-id="selectedItems[0].collector_id" />
            </template>
            <template #tag>
                <s-tags-panel :is-show="singleItemTab.syncState.activeTab==='tag'"
                              :resource-id="selectedItems[0].collector_id"
                              tag-page-name="collectorTags"
                />
            </template>
            <template #credentials>
                <collector-credentials :collector-id="selectedItems[0].collector_id" />
            </template>
            <template #schedules>
                <collector-schedules :collector-id="selectedItems[0].collector_id" />
            </template>
        </p-tab>
        <p-tab v-else-if="selectedItems.length > 1"
               :tabs="multiItemTab.state.tabs" :active-tab.sync="multiItemTab.syncState.activeTab"
        >
            <template #data>
                <div>
                    <p-panel-top :use-total-count="true" :total-count="selectedItems.length">
                        <span>{{ $t('TAB.SELECTED_DATA') }}</span>
                    </p-panel-top>
                    <p-data-table
                        :fields="selectedDataFields"
                        :items="selectedItems"
                        :sortable="false"
                        :selectable="false"
                        :col-copy="true"
                    >
                        <template #col-state-format="data">
                            <p-status :text="data.value" :theme="data.value" />
                        </template>
                    </p-data-table>
                </div>
            </template>
        </p-tab>

        <collector-update-modal v-if="updateModalVisible"
                                :visible.sync="updateModalVisible"
                                :collector-id="selectedItems[0].collector_id"
        />

        <collect-data-modal v-if="collectDataModalVisible"
                            :visible.sync="collectDataModalVisible"
                            :collector-id="selectedItems[0].collector_id"
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
                             :items="selectedItems"
                             @confirm="checkModalConfirm"
        />
    </general-page-layout>
</template>

<script lang="ts">
import { get } from 'lodash';
import router from '@/routes';

import GeneralPageLayout from '@/views/containers/page-layout/GeneralPageLayout.vue';
import PHorizontalLayout from '@/components/organisms/layouts/horizontal-layout/PHorizontalLayout.vue';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/PDropdownMenuBtn.vue';
import PLazyImg from '@/components/organisms/lazy-img/PLazyImg.vue';
import PIconTextButton from '@/components/molecules/buttons/icon-text-button/PIconTextButton.vue';
import PPageTitle from '@/components/organisms/title/page-title/PPageTitle.vue';
import PPanelTop from '@/components/molecules/panel/panel-top/PPanelTop.vue';
import PDataTable from '@/components/organisms/tables/data-table/PDataTable.vue';
import PQuerySearchTable from '@/components/organisms/tables/query-search-table/PQuerySearchTable.vue';
import PStatus from '@/components/molecules/status/PStatus.vue';
import PTab from '@/components/organisms/tabs/tab/PTab.vue';
import PTableCheckModal from '@/components/organisms/modals/table-modal/PTableCheckModal.vue';
import PPageNavigation from '@/components/molecules/page-navigation/PPageNavigation.vue';

import { TabBarState } from '@/components/molecules/tabs/tab-bar/PTabBar.toolset';
import { QueryTag } from '@/components/organisms/search/query-search-tags/PQuerySearchTags.toolset';

import { Component } from 'vue/types/umd';
import {
    reactive, toRefs, computed, watch, getCurrentInstance,
} from '@vue/composition-api';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';
import { ComponentInstance } from '@vue/composition-api/dist/component';

import { makeTrItems } from '@/lib/view-helper';
import { showErrorMessage, showSuccessMessage, timestampFormatter } from '@/lib/util';
import { makeQuerySearchHandlersWithSearchSchema } from '@/lib/component-utils/query-search';
import { ActionAPIInterface, FILTER_OPERATOR, fluentApi } from '@/lib/fluent-api';
import { CollectorModel } from '@/lib/fluent-api/inventory/collector.type';
import { makeQueryStringComputeds } from '@/lib/router-query-string';
import { parseTag } from '@/lib/api/query-search';

const STagsPanel = (): Component => import('@/views/common/tags/tag-panel/TagsPanel.vue') as Component;
const CollectorUpdateModal = (): Component => import('@/views/plugin/collector/modules/CollectorUpdateModal.vue') as Component;
const CollectDataModal = (): Component => import('@/views/plugin/collector/modules/CollectDataModal.vue') as Component;
const CollectorDetail = (): Component => import('@/views/plugin/collector/modules/CollectorDetail.vue') as Component;
const CollectorCredentials = (): Component => import('@/views/plugin/collector/modules/CollectorCredentials.vue') as Component;
const CollectorSchedules = (): Component => import('@/views/plugin/collector/modules/CollectorSchedules.vue') as Component;

export type UrlQueryString = string | (string | null)[] | null | undefined;

export default {
    name: 'Collector',
    components: {
        PPageTitle,
        GeneralPageLayout,
        PLazyImg,
        PHorizontalLayout,
        PIconTextButton,
        PDropdownMenuBtn,
        PDataTable,
        PPanelTop,
        PQuerySearchTable,
        PStatus,
        PTab,
        PTableCheckModal,
        PPageNavigation,
        CollectorUpdateModal,
        CollectDataModal,
        CollectorDetail,
        CollectorCredentials,
        CollectorSchedules,
        STagsPanel,
    },
    setup(props, context) {
        const vm = getCurrentInstance() as ComponentInstance;
        const state = reactive({
            fields: [
                { name: 'name', label: 'Name', options: { width: '14rem' } },
                {
                    name: 'state',
                    label: 'State',
                    type: 'enum',
                    options: {
                        ENABLED: { type: 'state', options: { icon: { color: 'safe' } } },
                        DISABLED: { type: 'state', options: { icon: { color: 'alert' } } },
                        width: '7rem',
                    },
                },
                { name: 'priority', label: 'Priority', options: { width: '5.5rem' } },
                {
                    name: 'last_collected_at',
                    label: 'Last Collected',
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
                    name: 'created_at',
                    label: 'Created',
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
            items: [] as CollectorModel[],
            totalCount: 0,
            // selected
            selectedIndexes: [],
            selectedItems: computed(() => {
                const items = [] as CollectorModel[];
                state.selectedIndexes.map(d => items.push(state.items[d]));
                return items;
            }),
            selectedDataFields: [
                { name: 'name', label: 'Name' },
                {
                    name: 'state',
                    label: 'State',
                    type: 'enum',
                    options: {
                        ENABLED: { type: 'state', options: { icon: { color: 'safe' } } },
                        DISABLED: { type: 'state', options: { icon: { color: 'alert' } } },
                    },
                },
                { name: 'priority', label: 'Priority' },
            ],
            // query
            querySearchHandlers: makeQuerySearchHandlersWithSearchSchema({
                title: 'Properties',
                items: [
                    { key: 'collector_id', name: 'Collector ID' },
                    { key: 'name', name: 'Name' },
                    { key: 'state', name: 'State', enums: ['ENABLED', 'DISABLED'] },
                    { key: 'plugin_info.options.supported_resource_type', name: 'Resource Type' },
                    { key: 'plugin_info.plugin_id', name: 'Plugin ID' },
                    { key: 'plugin_info.version', name: 'Plugin Version' },
                    { key: 'provider', name: 'Provider' },
                ],
            }, 'inventory.Collector'),
            loading: false,
            searchTags: [],
            pageSize: 15,
            thisPage: 1,
            sortBy: null,
            sortDesc: true,
            // dropdown action
            dropdown: computed(() => (makeTrItems([
                ['update', 'BTN.UPDATE', { disabled: state.selectedIndexes.length > 1 || state.selectedIndexes.length === 0 }],
                [null, null, { type: 'divider' }],
                ['enable', 'BTN.ENABLE', { disabled: state.selectedIndexes.length === 0 }],
                ['disable', 'BTN.DISABLE', { disabled: state.selectedIndexes.length === 0 }],
                ['delete', 'BTN.DELETE', { disabled: state.selectedIndexes.length === 0 }],
                [null, null, { type: 'divider' }],
                ['collectData', 'BTN.COLLECT_DATA', { disabled: state.selectedIndexes.length > 1 || state.selectedIndexes.length === 0 }],
            ], null, { type: 'item' }))),
            updateModalVisible: false,
            collectDataModalVisible: false,
            //
            routes: [{ name: 'Plugin', path: '/plugin' }, { name: 'Collector', path: '/plugin/collector' }],
        });
        const checkModalState: UnwrapRef<{
                visible: boolean; mode: string; title: string; subTitle: string; themeColor: string; api: ActionAPIInterface;
            }> = reactive({
                visible: false,
                mode: '',
                title: '',
                subTitle: '',
                themeColor: '',
                api: fluentApi.inventory().collector().enable(),
                tableCheckFields: computed(() => makeTrItems([
                    ['name', 'COMMON.NAME'],
                    ['state', 'COMMON.STATE'],
                    ['priority', 'COMMON.PRIORITY'],
                ])),
            });

        // Tab
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

        // Url query
        const searchTagsToUrlQueryString = (tags: QueryTag[]): UrlQueryString => {
            if (Array.isArray(tags)) {
                return tags.map((tag) => {
                    let item;
                    if (tag.key) item = `${tag.key.name}:${tag.operator}${tag.value?.name}`;
                    else item = `${tag.value?.name}`;
                    return item;
                });
            }
            return null;
        };
        const urlQueryStringToSearchTags = (urlQueryString: UrlQueryString): QueryTag[] => {
            if (!urlQueryString) return [];
            if (Array.isArray(urlQueryString)) {
                return urlQueryString.reduce((res, qs) => {
                    if (qs) res.push(parseTag(qs));
                    return res;
                }, [] as QueryTag[]);
            }
            return [parseTag(urlQueryString as string)];
        };
        const setSearchTags = () => {
            state.searchTags = urlQueryStringToSearchTags(vm.$route.query.f);
        };

        // Table
        const listCollector = async () => {
            state.loading = true;
            try {
                const res = await fluentApi.inventory().collector().list()
                    .setFilter(...state.searchTags.map(v => ({ key: v.key.name, value: v.value.name, operator: FILTER_OPERATOR.in })))
                    .setSortBy(state.sortBy)
                    .setSortDesc(state.sortDesc)
                    .setThisPage(state.thisPage)
                    .setPageSize(state.pageSize)
                    .execute();
                state.items = res.data.results;
                state.totalCount = res.data.total_count || 0;
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        };
        const onSelect = (index) => {
            state.selectedIndexes = index;
        };
        const onChange = async (item) => {
            state.selectedIndexes = [];
            state.searchTags = item.queryTags;
            const urlQueryString = searchTagsToUrlQueryString(item.queryTags);
            // eslint-disable-next-line no-empty-function
            await vm.$router.replace({ query: { ...router.currentRoute.query, f: urlQueryString } }).catch(() => {});
            try {
                await listCollector();
            } catch (e) {
                console.error(e);
            }
        };

        // Action events
        const checkModalConfirm = async (): Promise<void> => {
            try {
                await checkModalState.api.execute();
                showSuccessMessage('success', checkModalState.title, context.root);
            } catch (e) {
                console.error(e);
                showErrorMessage(`Fail to ${checkModalState.title}`, e, context.root);
            } finally {
                if (checkModalState.mode === 'delete') state.selectedIndexes = [];
                checkModalState.visible = false;
                await listCollector();
            }
        };
        const onClickUpdate = (): void => {
            state.updateModalVisible = true;
        };
        const onClickEnable = (): void => {
            checkModalState.mode = 'enable';
            checkModalState.api = fluentApi.inventory().collector().enable()
                .setIds(state.selectedItems.map(d => d.collector_id));
            checkModalState.title = 'Enable Collector';
            checkModalState.subTitle = 'Are you sure you want to ENABLE Selected Collector(s)?';
            checkModalState.themeColor = 'primary';
            checkModalState.visible = true;
        };
        const onClickDisable = (): void => {
            checkModalState.mode = 'disable';
            checkModalState.api = fluentApi.inventory().collector().disable()
                .setIds(state.selectedItems.map(d => d.collector_id));
            checkModalState.title = 'Disable Collector';
            checkModalState.subTitle = 'Are you sure you want to DISABLE Selected Collector(s)?';
            checkModalState.themeColor = 'primary';
            checkModalState.visible = true;
        };
        const onClickDelete = (): void => {
            checkModalState.mode = 'delete';
            checkModalState.api = fluentApi.inventory().collector().delete()
                .setIds(state.selectedItems.map(d => d.collector_id));
            checkModalState.title = 'Delete Collector';
            checkModalState.subTitle = 'Are you sure you want to DELETE Selected Collector(s)?';
            checkModalState.themeColor = 'alert';
            checkModalState.visible = true;
        };
        const onClickCollectData = (): void => {
            state.collectDataModalVisible = true;
        };

        const init = async () => {
            await setSearchTags();
            await listCollector();
        };
        init();

        watch(() => state.updateModalVisible, (val) => {
            if (!val) {
                listCollector();
            }
        });

        const queryRefs = {
            ...makeQueryStringComputeds(state, {
                pageSize: { key: 'ps', setter: Number },
                thisPage: { key: 'p', setter: Number },
                sortBy: { key: 'sb' },
                sortDesc: { key: 'sd', setter: Boolean },
            }),
        };

        return {
            ...toRefs(state),
            singleItemTab,
            multiItemTab,
            checkModalState,
            getIcon: (data): void => get(data, 'item.tags.icon', ''),
            onSelect,
            onChange,
            onClickUpdate,
            onClickEnable,
            onClickDisable,
            onClickDelete,
            onClickCollectData,
            checkModalConfirm,
            timestampFormatter,
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
