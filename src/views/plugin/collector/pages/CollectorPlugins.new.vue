<template>
    <p-vertical-page-layout :min-width="200" :init-width="260">
        <template #sidebar="{width}">
            <div :style="{width: width}">
                <plugin-filter :filters.sync="filterTools.tags"
                               :repositories="repoState.repositories"
                               :selected-repo-id.sync="repoState.selectedRepoId"
                               @goBack="goBack"
                               @search="search"
                               @repoChange="listPlugins"
                               @filtersChange="listPlugins"
                />
            </div>
        </template>
        <template #default>
            <p-toolbox-card-list class="card-list"
                                 :items="cardListTS.state.items"
                                 :mapper="cardListTS.state.mapper"
                                 :loading="cardListTS.state.loading"
                                 :title="cardListTS.state.title"
                                 :sort-menu="cardListTS.state.sortMenu"
                                 :sort-by.sync="cardListTS.syncState.sortBy"
                                 :this-page.sync="cardListTS.syncState.thisPage"
                                 :page-size="cardListTS.state.pageSize"
                                 :total-count="cardListTS.state.totalCount"
                                 @pageChange="listPlugins"
                                 @sortChange="listPlugins"
            >
                <template #filters>
                    <p-tag v-for="(filter, idx) in filterTools.tags" :key="`${idx}-${filter}`"
                           @delete="onDeleteTag(idx)"
                    >
                        {{ filter }}
                    </p-tag>
                </template>
                <template #card-title="{item}">
                    <span class="plugin-name">{{ item.name }}</span><span class="beta">{{ isBeta(item) ? 'BETA': '' }}</span>
                </template>
                <template #card-extra="{item}">
                    <div class="flex h-full w-full">
                        <div v-if="item.labels" class="flex-grow">
                            <p-badge v-for="(label, idx) in item.labels" :key="idx" style-type="gray100"
                                     class="mr-2"
                            >
                                {{ label }}
                            </p-badge>
                        </div>
                        <div class="flex-grow-0 self-end">
                            <div class="flex">
                                <p-dropdown-menu-btn :menu="versionsMenu[item.plugin_id]"
                                                     class="mr-5"
                                                     :loading="versionsMenu[item.plugin_id] ? false : true"
                                                     @openMenu="listVersions(item.plugin_id)"
                                                     @clickMenuEvent="onSelectVersion(item.plugin_id, $event)"
                                >
                                    {{ selectedVersions[item.plugin_id] || 'Version' }}
                                </p-dropdown-menu-btn>
                                <p-button style-type="primary-dark" @click="onPluginCreate(item)">
                                    <p-i name="ic_plus" color="transparent inherit"
                                         width="1rem" height="1rem"
                                    />
                                    {{ $t('BTN.CREATE') }}
                                </p-button>
                            </div>
                        </div>
                    </div>
                </template>
            </p-toolbox-card-list>
        </template>
    </p-vertical-page-layout>
</template>

<script lang="ts">
import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import _ from 'lodash';

import PToolboxCardList from '@/components/organisms/lists/toolbox-card-list/PToolboxCardList.vue';
import PBadge from '@/components/atoms/badges/Badge.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
import PI from '@/components/atoms/icons/PI.vue';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/DropdownMenuBtn.vue';
import PTag from '@/components/molecules/tags/Tag.vue';
import { tagList } from '@/components/molecules/tags/toolset';

import PluginFilter from '@/views/plugin/collector/modules/PluginFilter.vue';
import PVerticalPageLayout from '@/views/containers/page-layout/VerticalPageLayout.vue';
import { ToolboxCardListToolSet } from '@/components/organisms/lists/toolbox-card-list/PToolboxCardList.toolset';
import { FilterItem, fluentApi } from '@/lib/fluent-api';
import { RepositoryModel } from '@/lib/fluent-api/repository/repository';

const repoState = reactive({
    repositories: [] as unknown as RepositoryModel[],
    selectedRepoId: undefined as unknown as string,
});

const makeVersionMenu = v => (typeof v === 'object' ? v : { type: 'item', label: v, name: v });


export const setup = (props, { root }) => {
    const filterTools = tagList();

    const state = reactive({
        versions: {},
        selectedVersions: {},
        versionsMenu: computed(() => {
            const res = {};
            _.forEach(state.versions, (versionList: string[], pid) => {
                res[pid] = versionList.map(v => makeVersionMenu(v));
            });
            return res;
        }),
        searchText: '',
        searchQueries: computed<FilterItem[]>(() => filterTools.tags.map(filter => ({ key: 'labels', operator: '=', value: filter }))),
    });

    const cardListTS = new ToolboxCardListToolSet({
        sortMenu: [
            { type: 'item', label: 'Name', name: 'name' },
            { type: 'item', label: 'Recent', name: 'created_at' },
        ],
        mapper: {
            key: 'plugin_id',
            icon: 'tags.icon',
            title: 'name',
            contents: 'tags.description',
        },
        title: 'Plugins',
    }, {
        sortBy: 'name',
    });

    const pluginApi = fluentApi.repository().plugin();

    const listPlugins = async () => {
        cardListTS.state.loading = true;
        try {
            const res = await pluginApi.list()
                .setRepositoryId(repoState.selectedRepoId)
                .setServiceType('inventory.Collector')
                .setSortBy(cardListTS.syncState.sortBy as string)
                .setPageSize(cardListTS.state.pageSize)
                .setThisPage(cardListTS.syncState.thisPage)
                .setKeyword(state.searchText)
                .setFilter(...state.searchQueries as unknown as FilterItem[])
                .execute();

            cardListTS.state.items = res.data.results;
            cardListTS.state.totalCount = res.data.total_count;
            state.versions = {};
            state.selectedVersions = {};
        } catch (e) {
            console.error(e);
        } finally {
            cardListTS.state.loading = false;
        }
    };

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
        let path = `./collector-creator/${item.plugin_id}`;
        if (state.selectedVersions[item.plugin_id]) path += `?version=${state.selectedVersions[item.plugin_id]}`;

        root.$router.push({ path });
    };

    const listVersions = async (pluginId: string) => {
        if (state.versions[pluginId]) return;
        try {
            const res = await pluginApi.getVersions()
                .setId(pluginId)
                .execute();
            state.versions = { ...state.versions, [pluginId]: res.data.results };
        } catch (e) {
            console.error(e);
        }
    };

    const onSelectVersion = (pluginId, e) => {
        state.selectedVersions = { ...state.selectedVersions, [pluginId]: e };
    };

    listRepositories();

    return {
        ...toRefs(state),
        repoState,
        listPlugins,
        onPluginCreate,
        listVersions,
        onSelectVersion,
        cardListTS,
        filterTools,
        goBack: () => {
            root.$router.push('/plugin/collector');
        },
        search: (val) => {
            state.searchText = val;
            listPlugins();
        },
        onDeleteTag: (idx) => {
            filterTools.deleteTag(idx);
            listPlugins();
        },
        isBeta: item => _.get(item, 'tags.beta', ''),
    };
};

export default {
    name: 'CollectorPlugins',
    components: {
        PVerticalPageLayout,
        PToolboxCardList,
        PBadge,
        PButton,
        PI,
        PDropdownMenuBtn,
        PluginFilter,
        PTag,
    },
    setup(props, context) {
        return setup(props, context);
    },
};
</script>

<style lang="postcss" scoped>
.card-list {
    height: 100%;
    padding-top: 1.625rem;
    padding-bottom: 2.25rem;
    .beta {
        @apply text-coral;
        font-size: 0.5rem;
        font-weight: bold;
        vertical-align: super;
        margin-left: 0.2rem;
    }
}
</style>
