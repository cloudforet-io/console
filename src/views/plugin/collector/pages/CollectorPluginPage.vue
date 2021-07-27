<template>
    <p-vertical-page-layout>
        <template #sidebar="{width}">
            <div :style="{width: width}">
                <plugin-filter :repositories="repositories"
                               :selected-repo-id.sync="selectedRepositoryId"
                               :resource-type-search-tags.sync="resourceTypeSearchTags"
                               @search="onSearch"
                               @delete="onSearch('')"
                />
            </div>
        </template>
        <template #default>
            <div class="page-navigation">
                <p-breadcrumbs :routes="routes" />
            </div>
            <p-toolbox-grid-layout class="plugin-list"
                                   :items="loading ? [] : plugins"
                                   :this-page.sync="thisPage"
                                   :page-size.sync="pageSize"
                                   :loading="loading"
                                   :card-class="cardClass"
                                   :card-height="cardHeight"
                                   :card-min-width="cardMinWidth"
                                   :fix-column="fixColumn"
                                   :column-gap="columnGap"
                                   @changePageNumber="getPlugins"
                                   @changePageSize="getPlugins"
                                   @clickRefresh="getPlugins"
            >
                <template #toolbox-left>
                    <p-page-title :title="$t('PLUGIN.COLLECTOR.PLUGINS.TITLE')" use-total-count :total-count="totalCount"
                                  child @goBack="$router.go(-1)"
                    />
                </template>
                <template #page-size>
                    <p-select-dropdown v-model="sortBy" :items="sortMenu" @select="getPlugins" />
                </template>
                <template #toolbox-bottom>
                    <p v-if="resourceTypeSearchTags.length > 0" class="mb-4">
                        <p-badge v-for="(tag, idx) in resourceTypeSearchTags" :key="idx"
                                 style-type="primary"
                                 :outline="true"
                                 class="filter-tag"
                        >
                            <span>{{ tag }}</span>
                            <p-i name="ic_delete" width="1rem"
                                 height="1rem" color="inherit"
                                 class="cursor-pointer"
                                 @click="onDeleteResourceSearchTag(idx)"
                            />
                        </p-badge>
                    </p>
                    <p v-if="keyword" class="mb-2 text-sm">
                        {{ totalCount }} plugins for <strong>[{{ keyword }}]</strong>
                    </p>
                </template>
                <template #loading>
                    <div>
                        <div v-for="s in skeletons" :key="s" class="flex w-full mb-4">
                            <p-skeleton width="4rem" height="4rem" class="flex-shrink-0 mr-4" />
                            <div class="w-full">
                                <p-skeleton width="40%" height="1.5rem" class="mt-2 mb-2" />
                                <p-skeleton height="1rem" width="90%" />
                            </div>
                        </div>
                    </div>
                </template>
                <template #no-data>
                    <p-empty v-if="!loading" class="w-full h-full">
                        No Data
                    </p-empty>
                </template>
                <template #card="{item}">
                    <p-card-item :icon="item.icon"
                                 :title="item.name"
                                 :contents="item.tags.description"
                    >
                        <template #title>
                            <span class="plugin-name">{{ item.name }}</span><span class="beta">{{ isBeta(item) ? $t('PLUGIN.COLLECTOR.PLUGINS.BETA'): '' }}</span>
                        </template>
                        <template #extra>
                            <div class="card-bottom">
                                <div v-if="item.labels">
                                    <p-badge v-for="(label, idx) in item.labels" :key="idx" style-type="gray"
                                             :outline="true"
                                             class="mr-2 mb-2"
                                    >
                                        {{ label }}
                                    </p-badge>
                                </div>
                                <div class="btns">
                                    <p-icon-text-button style-type="primary-dark"
                                                        name="ic_plus_bold"
                                                        @click="onPluginCreate(item)"
                                    >
                                        {{ $t('PLUGIN.COLLECTOR.PLUGINS.CREATE') }}
                                    </p-icon-text-button>
                                </div>
                            </div>
                        </template>
                    </p-card-item>
                </template>
            </p-toolbox-grid-layout>
        </template>
    </p-vertical-page-layout>
</template>

<script lang="ts">
import { get, range } from 'lodash';

import {
    toRefs, reactive, watch, computed, getCurrentInstance, ComponentRenderProxy,
} from '@vue/composition-api';

import {
    PToolboxGridLayout, PPageTitle, PSelectDropdown, PCardItem, PBreadcrumbs,
    PIconTextButton, PEmpty, PSkeleton, PBadge, PI,
} from '@spaceone/design-system';

import PluginFilter from '@/views/plugin/collector/modules/PluginFilter.vue';
import PVerticalPageLayout from '@/common/components/layouts/VerticalPageLayout.vue';

import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import { getPageStart } from '@spaceone/console-core-lib/component-util/pagination';
import { TimeStamp } from '@/models';
import { assetUrlConverter } from '@/lib/helper/asset-helper';
import { PLUGIN_ROUTE } from '@/routes/plugin/plugin-route';


enum PLUGIN_STATE {
    enabled = 'ENABLED',
    disabled = 'DISABLED'
}


interface PluginTemplateModel {
    [key: string]: {
        schema: object;
    };
}

interface PluginModel {
    plugin_id: string;
    name: string;
    state: PLUGIN_STATE;
    image: string;
    service_type: string;
    provider: string;
    template: PluginTemplateModel;
    project_id: string;
    labels: string[];
    created_at: TimeStamp;
    tags: object[];
    icon?: string;
}

interface RepositoryModel {
    repository_id: string;
    name: string;
    endpoint: string;
    version: string;
    secret_id: string;
    created_at: TimeStamp;
}

export default {
    name: 'CollectorPluginPage',
    components: {
        PVerticalPageLayout,
        PBreadcrumbs,
        PSkeleton,
        PEmpty,
        PCardItem,
        PSelectDropdown,
        PPageTitle,
        PToolboxGridLayout,
        PBadge,
        PI,
        PluginFilter,
        PIconTextButton,
    },
    setup(props, { root }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            loading: false,
            totalCount: 0,
            keyword: '',
            thisPage: 1,
            pageSize: 24,
            sortMenu: computed(() => [
                { type: 'item', label: vm.$t('PLUGIN.COLLECTOR.PLUGINS.NAME'), name: 'name' },
                { type: 'item', label: vm.$t('PLUGIN.COLLECTOR.PLUGINS.RECENT'), name: 'created_at' },
            ]),
            sortBy: 'name',
            resourceTypeSearchTags: [],
            //
            plugins: [] as PluginModel[],
            cardClass: () => [],
            cardHeight: 'auto',
            cardMinWidth: '23.75rem',
            fixColumn: 1,
            columnGap: '1rem',
            //
            repositories: [] as unknown as RepositoryModel[],
            selectedRepositoryId: undefined as unknown as string,
        });
        const routeState = reactive({
            routes: computed(() => ([
                { name: vm.$t('MENU.PLUGIN.PLUGIN'), path: '/plugin' },
                { name: vm.$t('MENU.PLUGIN.COLLECTOR'), path: '/plugin/collector' },
                { name: vm.$t('MENU.PLUGIN.CREATE_COLLECTOR') },
            ])),
        });


        const pluginApiQuery = new ApiQueryHelper();
        const getPlugins = async () => {
            state.loading = true;
            try {
                pluginApiQuery.setPage(getPageStart(state.thisPage, state.pageSize), state.pageSize)
                    .setSort(state.sortBy, state.sortBy !== 'name')
                    .setFilters([{ v: state.keyword }]);


                if (state.resourceTypeSearchTags.length) {
                    pluginApiQuery.setFilters([{
                        k: 'labels',
                        v: state.resourceTypeSearchTags,
                        o: '=',
                    }]);
                }
                const params = {
                    service_type: 'inventory.Collector',
                    repository_id: state.selectedRepositoryId,
                    query: pluginApiQuery.data,
                };
                const res = await SpaceConnector.client.repository.plugin.list(params);
                state.plugins = [
                    ...res.results.map(d => ({
                        icon: assetUrlConverter(d.tags?.icon),
                        ...d,
                    })),
                ];
                state.totalCount = res.total_count;
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        };


        const repoApiQuery = new ApiQueryHelper();
        const getRepositories = async () => {
            try {
                repoApiQuery.setSort('repository_type', true);
                const res = await SpaceConnector.client.repository.repository.list({
                    query: repoApiQuery.data,
                });
                state.repositories = res.results;
                state.selectedRepositoryId = res.results[0].repository_id;
            } catch (e) {
                console.error(e);
            }
        };

        const onPluginCreate = (item) => {
            vm.$router.push({ name: PLUGIN_ROUTE.COLLECTOR.CREATE.STEPS._NAME, params: { pluginId: item.plugin_id } });
        };
        const onSearch = (val) => {
            state.keyword = val;
            getPlugins();
        };
        const onDeleteResourceSearchTag = (idx) => {
            state.resourceTypeSearchTags.splice(idx, 1);
        };

        const init = async () => {
            state.loading = true;
            await getRepositories();
            await getPlugins();
            state.loading = false;
        };
        init();

        watch(() => state.selectedRepositoryId, () => {
            getPlugins();
        }, {
            immediate: false,
        });
        watch(() => state.resourceTypeSearchTags, () => {
            getPlugins();
        }, {
            immediate: false,
        });

        return {
            ...toRefs(state),
            ...toRefs(routeState),
            skeletons: range(5),
            getPlugins,
            onPluginCreate,
            onSearch,
            onDeleteResourceSearchTag,
            isBeta: item => get(item, 'tags.beta', ''),
        };
    },
};
</script>

<style lang="postcss" scoped>
.filter-tag::v-deep {
    @apply inline-flex items-center mb-2 mr-2;
}
.plugin-list {
    max-width: 1280px;
    margin: auto;
}
.beta {
    @apply text-coral;
    font-size: 0.5rem;
    font-weight: bold;
    vertical-align: super;
    margin-left: 0.2rem;
}
.card-bottom {
    @apply flex w-full mt-4 overflow-hidden flex-wrap justify-between;
}
.btns {
    @apply flex-grow inline-flex justify-end;
}
</style>
