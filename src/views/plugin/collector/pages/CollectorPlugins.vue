<template>
    <p-vertical-page-layout :min-width="200" :init-width="260">
        <template #sidebar="{width}">
            <div :style="{width: width}">
                <plugin-filter :repositories="repositories"
                               :selected-repo-id.sync="selectedRepositoryId"
                               :resource-type-search-tags.sync="resourceTypeSearchTags"
                               @search="onSearch"
                />
            </div>
        </template>
        <template #default>
            <div class="page-navigation">
                <p-page-navigation :routes="routes" />
            </div>
            <p-toolbox-grid-layout class="plugin-list"
                                   :items="plugins"
                                   :this-page.sync="thisPage"
                                   :page-size.sync="pageSize"
                                   :loading.sync="loading"
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
                    <p-page-title title="Plugins" use-total-count :total-count="totalCount"
                                  child @goBack="$router.go(-1)"
                    />
                </template>
                <template #page-size>
                    <p-select-dropdown v-model="sortBy" :items="sortMenu" @onSelected="getPlugins" />
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
                                 height="1rem" color="transparent inherit"
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
                    <div v-for="s in skeletons" :key="s" class="flex w-full mb-4">
                        <p-skeleton width="4rem" height="4rem" class="flex-shrink-0 mr-4" />
                        <div class="w-full">
                            <p-skeleton width="40%" height="1.5rem" class="mt-2 mb-2" />
                            <p-skeleton height="1rem" width="90%" />
                        </div>
                    </div>
                </template>
                <template #no-data>
                    <p-empty class="w-full h-full">
                        No Data
                    </p-empty>
                </template>
                <template #card="{item}">
                    <p-card-item :icon="item.tags.icon"
                                 :title="item.name"
                                 :contents="item.tags.description"
                    >
                        <template #title>
                            <span class="plugin-name">{{ item.name }}</span><span class="beta">{{ isBeta(item) ? 'BETA': '' }}</span>
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
                                        {{ $t('BTN.CREATE') }}
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

import { toRefs, reactive, watch } from '@vue/composition-api';

import PluginFilter from '@/views/plugin/collector/modules/PluginFilter.vue';
import PVerticalPageLayout from '@/views/containers/page-layout/VerticalPageLayout.vue';
import PToolboxGridLayout from '@/components/organisms/layouts/toolbox-grid-layout/PToolboxGridLayout.vue';
import PPageTitle from '@/components/organisms/title/page-title/PPageTitle.vue';
import PSelectDropdown from '@/components/organisms/dropdown/select-dropdown/PSelectDropdown.vue';
import PCardItem from '@/components/molecules/cards/PCardItem.vue';
import PPageNavigation from '@/components/molecules/page-navigation/PPageNavigation.vue';
import PIconTextButton from '@/components/molecules/buttons/icon-text-button/PIconTextButton.vue';
import PEmpty from '@/components/atoms/empty/PEmpty.vue';
import PSkeleton from '@/components/atoms/skeletons/PSkeleton.vue';
import PBadge from '@/components/atoms/badges/PBadge.vue';
import PI from '@/components/atoms/icons/PI.vue';

import { FILTER_OPERATOR, fluentApi } from '@/lib/fluent-api';
import { RepositoryModel } from '@/lib/fluent-api/repository/repository';
import { PluginModel } from '@/lib/fluent-api/repository/plugin';

export default {
    name: 'CollectorPlugins',
    components: {
        PVerticalPageLayout,
        PPageNavigation,
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
        const state = reactive({
            loading: false,
            totalCount: 0,
            keyword: '',
            thisPage: 1,
            pageSize: 24,
            sortMenu: [
                { type: 'item', label: 'Name', name: 'name' },
                { type: 'item', label: 'Recent', name: 'created_at' },
            ],
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
            routes: [{ name: 'Plugin', path: '/plugin' }, { name: 'Collector', path: '/plugin/collector' }, { name: 'Create collector', path: '/plugin/collector/create/plugins' }],
        });

        const getPlugins = async () => {
            state.loading = true;
            try {
                let api = fluentApi.repository().plugin().list().setServiceType('inventory.Collector')
                    .setRepositoryId(state.selectedRepositoryId)
                    .setSortBy(state.sortBy)
                    .setSortDesc(state.sortBy !== 'name')
                    .setKeyword(state.keyword);
                if (state.resourceTypeSearchTags.length) {
                    api = api.setFilter({ key: 'labels', value: state.resourceTypeSearchTags, operator: FILTER_OPERATOR.in });
                }
                const res = await api.execute();
                state.plugins = res.data.results;
                state.totalCount = res.data.total_count;
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        };
        const getRepositories = async () => {
            try {
                const res = await fluentApi.repository().repository().list()
                    .setSortBy('repository_type')
                    .execute();
                state.repositories = res.data.results;
                state.selectedRepositoryId = res.data.results[0].repository_id;
            } catch (e) {
                console.error(e);
            }
        };

        const onPluginCreate = (item) => {
            root.$router.push({ path: `./collector-creator/${item.plugin_id}` });
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
