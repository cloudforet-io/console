<template>
    <p-vertical-page-layout :min-width="200" :init-width="260">
        <template #sidebar="{width}">
            <div :style="{width: width}">
                <plugin-filter :query-tag-tool="apiHandler.gridTS.querySearch"
                               :repositories="repoState.repositories"
                               :selected-repo-id.sync="repoState.selectedRepoId"
                               @search="search"
                />
            </div>
        </template>
        <template #default>
            <div class="page-navigation">
                <p-page-navigation :routes="route" />
            </div>
            <p-toolbox-grid-layout v-bind="apiHandler.gridTS.state"
                                   :this-page.sync="apiHandler.gridTS.syncState.thisPage"
                                   :page-size.sync="apiHandler.gridTS.syncState.pageSize"
                                   :loading.sync="apiHandler.gridTS.syncState.loading"
                                   class="plugin-list"
                                   @changePageNumber="listPlugins"
                                   @changePageSize="listPlugins"
                                   @clickRefresh="listPlugins"
            >
                <template #toolbox-left>
                    <p-page-title title="Plugins" use-total-count :total-count="apiHandler.totalCount.value" />
                </template>
                <template #page-size>
                    <p-select-dropdown v-model="sortBy" :items="sortMenu" @onSelected="listPlugins" />
                </template>
                <template #toolbox-bottom>
                    <p v-if="apiHandler.gridTS.querySearch.tags.value.length > 0" class="mb-4">
                        <p-badge v-for="(tag, idx) in apiHandler.gridTS.querySearch.tags.value" :key="idx"
                                 style-type="primary"
                                 :outline="true"
                                 class="filter-tag"
                        >
                            <span>{{ tag.value }}</span>
                            <p-i name="ic_delete" width="1rem"
                                 height="1rem" color="transparent inherit"
                                 class="cursor-pointer"
                                 @click="onDeleteTag(idx)"
                            />
                        </p-badge>
                    </p>
                    <p v-if="keyword" class="mb-2 text-sm">
                        {{ apiHandler.totalCount.value }} plugins for <strong>[{{ keyword }}]</strong>
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
import {
    toRefs, reactive, watch, onMounted, ref,
} from '@vue/composition-api';
import _ from 'lodash';

import PBadge from '@/components/atoms/badges/PBadge.vue';
import PI from '@/components/atoms/icons/PI.vue';

import PluginFilter from '@/views/plugin/collector/modules/PluginFilter.vue';
import PVerticalPageLayout from '@/views/containers/page-layout/VerticalPageLayout.vue';
import PPageNavigation from '@/components/molecules/page-navigation/PPageNavigation.vue';
import { fluentApi } from '@/lib/fluent-api';
import { RepositoryModel } from '@/lib/fluent-api/repository/repository';
import PToolboxGridLayout from '@/components/organisms/layouts/toolbox-grid-layout/PToolboxGridLayout.vue';
import { QuerySearchGridFluentAPI } from '@/lib/api/grid';
import PPageTitle from '@/components/organisms/title/page-title/PPageTitle.vue';
import PSelectDropdown from '@/components/organisms/dropdown/select-dropdown/PSelectDropdown.vue';
import PCardItem from '@/components/molecules/cards/PCardItem.vue';
import PEmpty from '@/components/atoms/empty/PEmpty.vue';
import PSkeleton from '@/components/atoms/skeletons/PSkeleton.vue';
import PIconTextButton from '@/components/molecules/buttons/icon-text-button/PIconTextButton.vue';
import { makeKeyItems, makeValueHandlerWithReference } from '@/lib/component-utils/query-search';

const repoState = reactive({
    repositories: [] as unknown as RepositoryModel[],
    selectedRepoId: undefined as unknown as string,
});


export const setup = (props, { root }) => {
    const state = reactive({
        keyword: '',
        sortMenu: [
            { type: 'item', label: 'Name', name: 'name' },
            { type: 'item', label: 'Recent', name: 'created_at' },
        ],
        sortBy: 'name',
    });

    const routeState = reactive({
        route: [{ name: 'Plugin', path: '/plugin' }, { name: 'Collector', path: '/plugin/collector' }, { name: 'Create collector', path: '/plugin/collector/create/plugins' }],
    });

    const listApi = fluentApi.repository().plugin().list().setServiceType('inventory.Collector');

    const apiHandler = new QuerySearchGridFluentAPI(
        listApi,
        {
            cardClass: () => [],
            fixColumn: 1,
            cardMinWidth: '23.75rem',
            cardHeight: 'auto',
        },
        undefined,
        {
            keyItems: makeKeyItems(['labels']),
            valueHandlerMap: {
                label: makeValueHandlerWithReference('repository.Plugin'),
            },
        },
    );

    const listPlugins = _.debounce(async () => {
        apiHandler.action = apiHandler.action
            .setRepositoryId(repoState.selectedRepoId)
            .setSortBy(state.sortBy)
            .setSortDesc(state.sortBy !== 'name');
        await apiHandler.getData();
    }, 100);

    const listRepositories = async () => {
        try {
            const res = await fluentApi.repository().repository().list()
                .setSortBy('repository_type')
                .execute();
            repoState.repositories = res.data.results;
            repoState.selectedRepoId = res.data.results[0].repository_id;
            await listPlugins();
        } catch (e) {
            console.error(e);
        }
    };

    const onPluginCreate = (item) => {
        root.$router.push({ path: `./collector-creator/${item.plugin_id}` });
    };

    listRepositories();

    watch(() => repoState.selectedRepoId, (repoId, _repoId) => {
        if (repoId && repoId !== _repoId) {
            listPlugins();
        }
    });


    return {
        apiHandler,
        ...toRefs(state),
        ...toRefs(routeState),
        repoState,
        listPlugins,
        onPluginCreate,
        goBack: () => {
            root.$router.push('/plugin/collector');
        },
        search: (val) => {
            state.keyword = val;
            apiHandler.action = apiHandler.action.setKeyword(val);
            listPlugins();
        },
        onDeleteTag: (idx) => {
            apiHandler.gridTS.querySearch.deleteTag(idx);
            listPlugins();
        },
        isBeta: item => _.get(item, 'tags.beta', ''),
        skeletons: _.range(5),
    };
};

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
    setup(props, context) {
        return setup(props, context);
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
