<template>
    <div>
        <p-vertical-layout :min-left-width="260">
            <template #leftContainer="{width}">
                <div :style="{width: width}">
                    <plugin-filter :filters="resourceFilters"
                                   :repositories="repositories"
                                   :selected-repo-id.sync="selectedRepoId"
                                   @goBack="goBack"
                                   @search="search"
                                   @repoChange="listPlugins"
                                   @resourceChange="onResourceChange"
                    />
                </div>
            </template>
            <template #rightContainer="{height}">
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
                                     :style="{height}"
                                     @pageChange="listPlugins"
                                     @sortChange="listPlugins"
                >
                    <template #filters>
                        <p-tag v-for="(filter, idx) in filterTools.tags" :key="`${idx}-${filter.name}`"
                               @delete="onDeleteTag(filter, idx)"
                        >
                            {{ filter.name }}
                        </p-tag>
                    </template>
                    <template #card-extra="{item}">
                        <p-row style="height: 100%;">
                            <p-col>
                                <template v-if="item.labels">
                                    <p-badge v-for="(label, idx) in item.labels" :key="idx" style-type="gray3"
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
                                        {{ tr('COMMON.BTN_CRT') }}
                                    </p-button>
                                </p-row>
                            </p-col>
                        </p-row>
                    </template>
                </p-toolbox-card-list>
            </template>
        </p-vertical-layout>
    </div>
</template>

<script>
import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import CollectorEventBus from '@/views/inventory/collector/CollectorEventBus';
import { defaultQuery } from '@/lib/api';
import { SearchQuery } from '@/components/organisms/search/query-search-bar/autocompleteHandler';

import PRow from '@/components/atoms/grid/row/Row.vue';
import PCol from '@/components/atoms/grid/col/Col.vue';
import PVerticalLayout from '@/components/organisms/layouts/vertical-layout/VerticalLayout.vue';
import PToolboxCardList from '@/components/organisms/lists/toolbox-card-list/ToolboxCardList.vue';
import PBadge from '@/components/atoms/badges/Badge.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
import PI from '@/components/atoms/icons/PI.vue';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/DropdownMenuBtn.vue';
import PTag, { tagList } from '@/components/molecules/tags/Tag.vue';

import PluginFilter from '@/views/inventory/collector/modules/PluginFilter.vue';

class FilterItem {
    constructor(type, name, idx) {
        this.type = type;
        this.name = name;
    }
}


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
    const resourceFilters = computed(() => {
        const res = [];
        filterTools.tags.forEach((filter) => {
            if (filter.type === 'resource') res.push(filter.name);
        });
        return res;
    });
    const deleteFilter = (name) => {
        filterTools.deleteTag(_.findIndex(filterTools.tags, { name }));
    };
    const searchPrefix = 'search: ';

    return {
        filterTools,
        searchText,
        resourceFilters,
        searchPrefix,
        goBack: () => {
            router.push('/inventory/collector');
        },
        search: (val) => {
            searchText.value = '';
            filterTools.addTag(new FilterItem('search', `${searchPrefix}${val}`));
            pluginListState.listPlugins();
        },
        onDeleteTag: (filter, idx) => {
            filterTools.deleteTag(idx);
            pluginListState.listPlugins();
        },
        onResourceChange: (resource, items, isUnchecked) => {
            if (isUnchecked) deleteFilter(resource);
            else filterTools.addTag(new FilterItem('resource', resource));
            pluginListState.listPlugins();
        },
    };
};

const setQueryState = (state) => {
    const keywordKeys = ['tags.description', 'name', 'labels'];
    const setKeywordQueries = (queries, filter) => {
        const keyword = _.split(filter.name, state.searchPrefix, 2)[1];
        keywordKeys.forEach((key) => {
            queries.push({ k: key, o: 'contain_in', v: [keyword] });
        });
    };

    const queryState = reactive({
        defaultQuery: computed(() => (defaultQuery(
            state.thisPage, state.pageSize,
            state.sortBy, true,
        ))),
        query: computed(() => {
            const and = [];
            const or = [];
            state.filterTools.tags.forEach((filter) => {
                if (filter.type === 'resource') and.push({ k: 'labels', o: 'in', v: [filter.name] });
                else setKeywordQueries(or, filter);
            });

            queryState.defaultQuery.filter = and;
            // eslint-disable-next-line camelcase
            queryState.defaultQuery.filter_or = or;
            return queryState.defaultQuery;
        }),
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
        PRow,
        PCol,
        PVerticalLayout,
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

<style lang="scss" scoped>
.card-list {
    height: 100%;
    padding-top: 1.625rem;
    padding-bottom: 2.25rem;
}
</style>
