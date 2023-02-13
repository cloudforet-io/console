<template>
    <div class="collector-plugins-page">
        <p-page-title :title="$t('PLUGIN.COLLECTOR.PLUGINS.TITLE')"
                      use-total-count
                      :total-count="totalCount"
                      child
                      @goBack="$router.go(-1)"
        />
        <p-divider class="divider" />
        <collector-plugins-toolbox class="collector-plugin-toolbox"
                                   @update-toolbox="handleToolbox"
        >
            <template #filters>
                <plugin-filter :repositories="repositories"
                               :selected-repo-id.sync="selectedRepositoryId"
                               :resource-type-search-tags.sync="resourceTypeSearchTags"
                               @search="handleToolbox"
                               @delete="handleToolbox('')"
                />
            </template>
        </collector-plugins-toolbox>
        <p v-if="resourceTypeSearchTags.length > 0"
           class="mb-4"
        >
            <p-badge v-for="(tag, idx) in resourceTypeSearchTags"
                     :key="idx"
                     style-type="primary"
                     badge-type="solid-outline"
                     class="filter-tag"
            >
                <span>{{ tag }}</span>
                <p-i name="ic_delete"
                     width="1rem"
                     height="1rem"
                     color="inherit"
                     class="cursor-pointer"
                     @click="handleDeleteResourceSearchTag(idx)"
                />
            </p-badge>
        </p>
        <p v-if="keyword"
           class="mb-2 text-sm"
        >
            {{ totalCount }} plugins for <strong>[{{ keyword }}]</strong>
        </p>
        <p-data-loader :data="plugins"
                       :loading="loading"
                       :loader-backdrop-color="BACKGROUND_COLOR"
        >
            <ul class="plugin-card-list">
                <li v-for="item in plugins"
                    :key="item.name"
                >
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
                                    <p-badge v-for="(label, idx) in item.labels"
                                             :key="`${label}-${idx}`"
                                             style-type="gray500"
                                             badge-type="solid-outline"
                                             class="mr-2 mb-2"
                                    >
                                        {{ label }}
                                    </p-badge>
                                </div>
                                <div class="btns">
                                    <p-button style-type="primary"
                                              icon-left="ic_plus_bold"
                                              @click="handlePluginCreate(item)"
                                    >
                                        {{ $t('PLUGIN.COLLECTOR.PLUGINS.CREATE') }}
                                    </p-button>
                                </div>
                            </div>
                        </template>
                    </p-card-item>
                </li>
            </ul>
        </p-data-loader>
    </div>
</template>

<script lang="ts">

import {
    toRefs, reactive, watch, computed, getCurrentInstance,
} from 'vue';
import type { Vue } from 'vue/types/vue';

import {
    PPageTitle, PCardItem,
    PButton, PBadge, PI, PDivider, PDataLoader,
} from '@spaceone/design-system';
import type { ToolboxOptions } from '@spaceone/design-system/types/navigation/toolbox/type';
import { get, range } from 'lodash';

import { getPageStart } from '@cloudforet/core-lib/component-util/pagination';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { TimeStamp } from '@/models';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { BACKGROUND_COLOR } from '@/styles/colorsets';

import CollectorPluginsToolbox from '@/services/asset-inventory/collector/collector-plugins/modules/CollectorPluginsToolbox.vue';
import PluginFilter from '@/services/asset-inventory/collector/collector-plugins/modules/PluginFilter.vue';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';

enum PLUGIN_STATE {
    enabled = 'ENABLED',
    disabled = 'DISABLED'
}

interface PluginTemplateModel {
    [key: string]: {
        schema: any;
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
    tags: any[];
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
        PCardItem,
        PPageTitle,
        PBadge,
        PI,
        PluginFilter,
        PButton,
        PDivider,
        PDataLoader,
        CollectorPluginsToolbox,
    },
    setup() {
        const vm = getCurrentInstance()?.proxy as Vue;
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
                    ...res.results.map((d) => ({
                        icon: assetUrlConverter(d.tags?.icon),
                        ...d,
                    })),
                ];
                state.totalCount = res.total_count;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.plugins = [];
                state.totalCount = 0;
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
                ErrorHandler.handleError(e);
                state.repositories = [];
                state.selectedRepositoryId = '';
            }
        };

        const handlePluginCreate = (item) => {
            vm.$router.push({ name: ASSET_INVENTORY_ROUTE.COLLECTOR.CREATE.STEPS._NAME, params: { pluginId: item.plugin_id } });
        };
        const handleToolbox = (options: ToolboxOptions) => {
            state.keyword = options.searchText ? options.searchText : '';
            state.sortBy = options.sortBy ? options.sortBy : 'name';
            getPlugins();
        };
        const handleDeleteResourceSearchTag = (idx) => {
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
            skeletons: range(5),
            getPlugins,
            handlePluginCreate,
            handleToolbox,
            handleDeleteResourceSearchTag,
            isBeta: (item) => get(item, 'tags.beta', ''),
            BACKGROUND_COLOR,
        };
    },
};
</script>

<style lang="postcss" scoped>
/* custom design-system component - p-badge */
:deep(.filter-tag) {
    @apply inline-flex items-center mb-2 mr-2;
}
.divider {
    @apply mb-6;
}
.plugin-card-list {
    @apply flex flex-col flex-wrap gap-4;
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
