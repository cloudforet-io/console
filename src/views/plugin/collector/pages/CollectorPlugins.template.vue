<template>
    <p-vertical-page-layout2 :min-width="200" :init-width="260">
        <template #sidebar="{width}">
            <div :style="{width: width}">
                <plugin-filter :filters.sync="filterTools.tags"
                               :repositories="repositories"
                               :selected-repo-id.sync="selectedRepoId"
                               @goBack="goBack"
                               @search="search"
                               @repoChange="listPlugins"
                               @filtersChange="listPlugins"
                />
            </div>
        </template>
        <template #default>
            <p-toolbox-card-list class="card-list"
                                 :items="plugins"
                                 :mapper="pluginMapper"
                                 :loading="loading"
                                 title="Plugins"
                                 :sort-menu="sortMenu"
                                 :sort-by-idx.sync="sortByIdx"
                                 :this-page.sync="thisPage"
                                 :page-size="pageSize"
                                 :total-count="totalCount"
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
                    <p-row style="height: 100%;">
                        <p-col>
                            <template v-if="item.labels">
                                <p-badge v-for="(label, idx) in item.labels" :key="idx" style-type="gray100"
                                         style="margin-right: .5rem;"
                                >
                                    {{ label }}
                                </p-badge>
                            </template>
                        </p-col>
                        <p-col :flex-grow="0" align-self="flex-end">
                            <p-row>
                                <p-dropdown-menu-btn :menu="versionsMenu[item.plugin_id]"
                                                     style="margin-right: 1.25rem;"
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
                            </p-row>
                        </p-col>
                    </p-row>
                </template>
            </p-toolbox-card-list>
        </template>
    </p-vertical-page-layout2>
</template>

<script>
import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import CollectorEventBus from '@/views/plugin/collector/CollectorEventBus';
import { SearchQuery } from '@/components/organisms/search/query-search-bar/autocompleteHandler';

import PRow from '@/components/atoms/grid/row/Row.vue';
import PCol from '@/components/atoms/grid/col/Col.vue';
import PToolboxCardList from '@/components/organisms/lists/toolbox-card-list/PToolboxCardList.vue';
import PBadge from '@/components/atoms/badges/Badge.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
import PI from '@/components/atoms/icons/PI.vue';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/DropdownMenuBtn.vue';
import PTag from '@/components/molecules/tags/Tag.vue';
import { tagList } from '@/components/molecules/tags/toolset';

import PluginFilter from '@/views/plugin/collector/modules/PluginFilter.vue';
import PVerticalPageLayout2 from '@/views/containers/page-layout/VerticalPageLayout2.vue';
import {defaultQuery} from "@/lib/api/query";

const repoState = reactive({
    repositories: [],
    selectedRepoId: undefined,
});

const setPluginList = (router) => {
    const state = reactive({
        plugins: [],
        loading: true,
        pluginMapper: {
            key: 'plugin_id',
            icon: 'tags.icon',
            title: 'name',
            contents: 'tags.description',
        },
        totalCount: 0,
        thisPage: 1,
        pageSize: 10,
        sortMenu: [
            { type: 'item', label: 'Name', name: 'name' },
            { type: 'item', label: 'Recent', name: 'created_at' },
        ],
        sortByIdx: 0,
        sortBy: undefined,
        versions: {},
        selectedVersions: {},
    });

    const isBeta = item => _.get(item, 'tags.beta', '');

    const makeVersionMenu = v => (typeof v === 'object' ? v : { type: 'item', label: v, name: v });
    const versionsMenu = computed(() => {
        const res = {};
        _.forEach(state.versions, (vlist, pid) => {
            res[pid] = vlist.map(v => makeVersionMenu(v));
        });
        return res;
    });

    const listPlugins = () => {
        CollectorEventBus.$emit('listPlugins');
    };

    const onPluginCreate = (item) => {
        let path = `./collector-creator/${item.plugin_id}`;
        if (state.selectedVersions[item.plugin_id]) path += `?version=${state.selectedVersions[item.plugin_id]}`;

        router.push({ path });
    };

    const listVersions = (pluginId) => {
        if (state.versions[pluginId]) return;
        CollectorEventBus.$emit('listVersions', pluginId);
    };

    const onSelectVersion = (pluginId, e) => {
        state.selectedVersions = { ...state.selectedVersions, [pluginId]: e };
    };

    CollectorEventBus.$emit('listPluginsInit');

    return {
        ...toRefs(state),
        isBeta,
        versionsMenu,
        listPlugins,
        onPluginCreate,
        listVersions,
        onSelectVersion,
    };
};


const setFilters = (pluginListState, router) => {
    const filterTools = tagList();
    const searchText = ref('');

    return {
        filterTools,
        searchText,
        goBack: () => {
            router.push('/plugin/collector');
        },
        search: (val) => {
            searchText.value = val;
            pluginListState.listPlugins();
        },
        onDeleteTag: (idx) => {
            filterTools.deleteTag(idx);
            pluginListState.listPlugins();
        },
    };
};

const setQueryState = (state) => {
    const queryState = reactive({
        query: computed(() => (defaultQuery(
            state.thisPage, state.pageSize,
            state.sortBy, true,
            state.searchText, queryState.searchQueries,
        ))),
        searchQueries: computed(() => state.filterTools.tags.map(filter => new SearchQuery('labels', '=', filter))),
        sortBy: computed(() => state.sortMenu[state.sortByIdx].name),
    });

    return queryState;
};

export const setup = (props, { root }) => {
    const pluginListState = setPluginList(root.$router);
    const filterState = setFilters(pluginListState, root.$router);

    const allState = reactive({
        ...filterState,
        ...pluginListState,
    });

    const queryState = setQueryState(allState);

    return {
        ...toRefs(allState),
        ...toRefs(queryState),
        ...toRefs(repoState),

    };
};

export default {
    name: 'CollectorPluginsTemplate',
    components: {
        PVerticalPageLayout2,
        PRow,
        PCol,
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
        font-size: .5rem;
        font-weight: bold;
        vertical-align: super;
        margin-left: .2rem;
    }
}
</style>
