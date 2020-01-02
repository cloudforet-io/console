<template>
    <div>
        <p-vertical-layout>
            <template #leftContainer="{width}">
                <div :style="{width: width}">
                    <plugin-filter :filters.sync="filterTools.filters"
                                   @goBack="goBack"
                                   @search="search"
                                   @repoChange="repoChange"
                    />
                </div>
            </template>
            <template #rightContainer>
                <p-toolbox-card-list
                    :items="plugins"
                    :mapper="pluginMapper"
                    title="Plugins"
                    :sort-menu="sortMenu"
                    :sort-by.sync="sortBy"
                    @pageChange="onPageChange"
                    @sortChange="onSortChange"
                    @filterChange="onFilterChange"
                >
                    <template #filters>
                        <p-filter-badge v-for="(filter, idx) in filterTools.filters" :key="`${idx}-${filter}`"
                                        :idx="idx"
                        >
                            {{ filter }}
                        </p-filter-badge>
                    </template>
                    <template #card-extra="{item}">
                        <p-row style="height: 100%;">
                            <p-col>
                                <template v-if="item.tags">
                                    <p-badge v-for="(tag, idx) in item.tags" :key="idx" style-type="gray3">
                                        {{ tag }}
                                    </p-badge>
                                </template>
                            </p-col>
                            <p-col :flex-grow="0" align-self="flex-end">
                                <p-row>
                                    <p-dropdown-menu-btn :menu="[]" style="margin-right: 1.25rem;">
                                        Version
                                    </p-dropdown-menu-btn>
                                    <p-button style-type="primary-dark">
                                        <p-i name="ic_plus" color="transparent inherit"
                                             width="1rem" height="1rem"
                                        />
                                        Create
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
import { toRefs, reactive } from '@vue/composition-api';
import CollectorEventBus from '@/views/inventory/collector/CollectorEventBus';

import PRow from '@/components/atoms/grid/row/Row';
import PCol from '@/components/atoms/grid/col/Col';
import PVerticalLayout from '@/components/organisms/layouts/vertical-layout/VerticalLayout';
import PToolboxCardList from '@/components/organisms/lists/toolbox-card-list/ToolboxCardList';
import PBadge from '@/components/atoms/badges/Badge';
import PButton from '@/components/atoms/buttons/Button';
import PI from '@/components/atoms/icons/PI';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/DropdownMenuBtn';
import PFilterBadge, { filterBadgeList } from '@/components/molecules/badges/filter-badge/FilterBadge';

import PluginFilter from '@/views/inventory/collector/modules/PluginFilter';

const setPluginList = (props, context) => {
    const state = reactive({
        plugins: [],
        pluginMapper: {
            key: 'id',
            icon: 'icon',
            title: 'name',
            contents: 'desc',
        },
        sortMenu: [
            { type: 'item', label: 'Name', name: 'Name' },
            { type: 'item', label: 'Recent', name: 'Recent' },
        ],
        sortBy: 'Name',
        filters: [],
    });

    const onPageChange = () => {};
    const onSortChange = () => {};
    const onFilterChange = () => {};

    const listPlugins = () => {
        CollectorEventBus.$emit('listPlugins');
    };
    listPlugins();

    return {
        ...toRefs(state),
        onPageChange,
        onSortChange,
        onFilterChange,
    };
};


const setFilters = (props, context, listState) => {
    const filterTools = filterBadgeList();

    return {
        filterTools,
        goBack: () => {},
        search: () => {},
        repoChange: (repo) => {
            console.log('repo', repo);
        },
    };
};

export const setup = (props, context) => {
    const pluginListState = setPluginList(props, context);
    const filterState = setFilters(props, context, pluginListState);
    return {
        ...filterState,
        ...pluginListState,
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
        PFilterBadge,
    },
    setup(props, context) {
        return setup(props, context);
    },
};
</script>

<style lang="scss" scoped>

</style>
