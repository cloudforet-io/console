<template>
    <div class="project-search">
        <p-autocomplete-search v-model="searchText"
                               theme="secondary"
                               :placeholder="groupId ? $t('PROJECT.LANDING.PLACE_HOLDER_PROJECT') : $t('PROJECT.LANDING.PLACE_HOLDER_EXAMPLE')"
                               :disable-icon="!!groupId"
                               :menu="menu"
                               :loading="loading"
                               :visible-menu.sync="visibleMenu"
                               :is-focused.sync="isFocused"
                               disable-handler
                               :exact-mode="false"
                               @delete="onDeleteAll"
                               @input="onInput"
                               @search="onSearch"
                               @select-menu="onMenuSelect"
                               @mousedown.stop="onInput()"
                               @hide-menu="hideMenu"
                               @keydown.delete="onDeletePrefix"
        >
            <template #search-left>
                <div v-if="groupId" class="prefix-tag"
                     :class="{active: isFocused || visibleMenu}"
                >
                    <span class="text">{{ groupName }}</span>
                </div>
            </template>
            <template #menu-item--format="{item}">
                <div class="menu-item">
                    <p-i :name="item.icon" height="1rem" width="1rem"
                         class="mr-1"
                    />
                    <div class="ellipsis">
                        <template v-if="trimmedValue">
                            <span v-for="(text, i) in item.label.split(regex)" :key="i">
                                <strong v-if="i !== 0">{{ getMatchText(item.label) }}</strong>
                                <span class="font-normal">{{ text }}</span>
                            </span>
                        </template>
                        <template v-else>
                            <span>{{ item.label }}</span>
                        </template>
                    </div>
                </div>
            </template>
            <template #menu-header-more="{item}">
                <div class="show-more" @click.stop="onShowMore(item)">
                    <p-i name="ic_search" color="inherit" height="1rem"
                         width="1rem"
                    />
                    <span class="text">{{ $t('PROJECT.LANDING.PLACE_HOLDER_SHOW_MORE') }}</span>
                </div>
            </template>
        </p-autocomplete-search>
    </div>
</template>

<script lang="ts">
import {
    ComponentRenderProxy,
    computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PAutocompleteSearch, PI,
} from '@spaceone/design-system';
import { MenuItem as ContextMenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';

import { debounce } from 'lodash';
import { ItemType } from '@/views/project/project/type';
import { SpaceConnector } from '@/lib/space-connector';
import { ApiQueryHelper } from '@/lib/space-connector/helper';
import { store } from '@/store';

const LIMIT = 5;

interface MenuOption {
    title: string;
    items: any[];
    type: ItemType;
    count: number;
    icon: string;
    showMore: boolean;
}

interface MenuItem extends ContextMenuItem {
    icon?: string;
    dataType?: ItemType;
}

const makeMenuItems = (...args: MenuOption[]): MenuItem[] => {
    const items = args.reduce((res: MenuItem[], d, i) => {
        if (i > 0) res.push({ type: 'divider' });
        res.push({
            type: 'header',
            label: `${d.title} (${d.count})`,
            name: d.type,
        });
        d.items.forEach((item) => {
            res.push({
                type: 'item',
                label: item.name,
                name: d.type === 'PROJECT' ? item.project_id : item.project_group_id,
                icon: d.icon,
                link: d.type === 'PROJECT' ? `/project/${item.project_id}` : undefined,
                dataType: d.type,
            });
        });
        if (d.showMore) {
            res.push({
                type: 'header',
                label: 'Show More',
                name: 'more',
                dataType: d.type,
            });
        }
        return res;
    }, []);
    return items;
};

interface Props {
    groupId?: string;
    groupName?: string;
}


export default {
    name: 'ProjectSearch',
    components: {
        PI,
        PAutocompleteSearch,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
            groupId: computed(() => store.getters['projectPage/groupId']),
            groupName: computed(() => store.getters['projectPage/groupName']),
            searchText: '' as string,
            trimmedValue: computed<string>(() => (typeof state.searchText === 'string' ? state.searchText.trim() : '')),
            regex: computed(() => {
                if (state.trimmedValue) {
                    return RegExp(state.trimmedValue, 'i');
                }
                return RegExp(/./);
            }),
            projectGroupItems: [],
            projectItems: [],
            projectGroupTotalCount: 0,
            projectTotalCount: 0,
            projectGroupStart: 1,
            projectStart: 1,
            loading: true,
            menu: computed<MenuItem[]>(() => {
                const menuOptions: MenuOption[] = [];
                if (!state.groupId) {
                    menuOptions.push({
                        title: 'Project group',
                        items: state.projectGroupItems,
                        type: 'PROJECT_GROUP',
                        count: state.projectGroupTotalCount,
                        showMore: state.projectGroupTotalCount >= state.projectGroupStart + LIMIT,
                        icon: 'ic_tree_project-group',
                    });
                }
                menuOptions.push({
                    title: 'Project',
                    items: state.projectItems,
                    type: 'PROJECT',
                    count: state.projectTotalCount,
                    showMore: state.projectTotalCount >= state.projectStart + LIMIT,
                    icon: 'ic_tree_project',
                });
                return makeMenuItems(...menuOptions);
            }),
            visibleMenu: false,
            isFocused: true,
        });


        const getMatchText = (text: string): string => {
            const res = state.regex.exec(text);
            if (res) return res[0];
            return '';
        };

        const projectGroupQuery = new ApiQueryHelper().setOnly('project_group_id', 'name').setPageLimit(LIMIT);
        const projectQuery = new ApiQueryHelper().setOnly('project_id', 'name').setPageLimit(LIMIT);


        const listProjectGroups = async () => {
            if (state.searchText) {
                projectGroupQuery.setFilters([{ k: 'name', v: state.searchText, o: '' }]);
            } else {
                projectGroupQuery.setFilters([]);
            }

            const res = await SpaceConnector.client.identity.projectGroup.list({
                query: projectGroupQuery.setPageStart(state.projectGroupStart).data,
            });
            if (state.projectGroupStart === 1) state.projectGroupItems = res.results;
            else state.projectGroupItems = [...state.projectGroupItems, ...res.results];
            state.projectGroupTotalCount = res.total_count;
        };

        const listProjects = async () => {
            const param = {} as any;
            let api;
            if (state.groupId) {
                api = SpaceConnector.client.identity.projectGroup.listProjects;
                param.recursive = true;
                param.project_group_id = state.groupId;
            } else {
                api = SpaceConnector.client.identity.project.list;
            }

            if (state.searchText) {
                projectQuery.setFilters([{ k: 'name', v: state.searchText, o: '' }]);
            } else {
                projectQuery.setFilters([]);
            }

            param.query = projectQuery.setPageStart(state.projectStart).data;

            const res = await api(param);

            if (state.projectStart === 1) state.projectItems = res.results;
            else state.projectItems = [...state.projectItems, ...res.results];
            state.projectTotalCount = res.total_count;
        };

        const listItems = async () => {
            state.projectStart = 1;
            state.projectGroupStart = 1;
            state.loading = true;
            try {
                await Promise.all([listProjectGroups(), listProjects()]);
            } catch (e) {
                console.error(e);
                state.projectItems = [];
                state.projectGroupItems = [];
            } finally {
                state.loading = false;
            }
        };

        const showMenu = () => { state.visibleMenu = true; };
        const hideMenu = () => { state.visibleMenu = false; };

        const onInput = debounce(async (e?) => {
            if (!state.visibleMenu) showMenu();
            await listItems();
        }, 300);

        watch(() => state.groupId, async () => {
            if (state.visibleMenu) await listItems();
        });


        const commitSearchContext = (groupId?: string, searchText?: string, hide = true) => {
            let val = searchText;
            if (typeof searchText === 'string') val = searchText.trim();
            if (!val) val = '';

            if (state.groupId !== groupId) {
                store.dispatch('projectPage/selectNode', groupId);
            }

            if (store.state['projectPage/searchText'] !== val) {
                store.commit('projectPage/setSearchText', val);
            }

            if (hide) hideMenu();
            state.isFocused = false;
        };

        const onSearch = (text: string) => {
            commitSearchContext(state.groupId, text);
        };

        const onMenuSelect = (item: MenuItem) => {
            if (item.dataType === 'PROJECT_GROUP') {
                state.searchText = '';
                commitSearchContext(item.name, '', false);
                state.projectGroupStart = 1;
                listProjectGroups();
                state.isFocused = true;
            } else {
                state.searchText = '';
            }
        };

        const onShowMore = async (item: MenuItem) => {
            if (item.dataType === 'PROJECT') {
                state.projectStart += LIMIT;
                await listProjects();
            } else {
                state.projectGroupStart += LIMIT;
                await listProjectGroups();
            }
        };

        const onDeletePrefix = (e: KeyboardEvent) => {
            if (!(e.target as HTMLInputElement).value) {
                commitSearchContext();
            }
        };

        const onDeleteAll = () => {
            // commitSearchContext();
        };

        if (vm.$route.query.search) {
            state.searchText = vm.$route.query.search as string;
            store.commit('projectPage/setSearchText', vm.$route.query.search as string);
        }


        return {
            ...toRefs(state),
            onInput,
            onSearch,
            commitSearchContext,
            showMenu,
            hideMenu,
            onMenuSelect,
            getMatchText,
            onShowMore,
            onDeletePrefix,
            onDeleteAll,
        };
    },
};
</script>

<style lang="postcss" scoped>
.project-search {
    @apply w-full;
    .p-autocomplete-search::v-deep {
        @apply px-3;
        .p-search {
            overflow-x: hidden;
            overflow-y: hidden;
            input {
                min-width: 0;
            }
        }
        .menu-container {
            @apply pr-4;
            .p-context-menu {
                min-width: 100%;
            }
            .context-item {
                padding-top: 0.41rem;
                padding-bottom: 0.41rem;
            }
        }
    }
    .prefix-tag {
        @apply bg-gray-200 rounded-sm px-2 text-xs mr-2 inline-flex items-center flex-shrink-0;
        max-width: 7rem;
        height: 1.125rem;
        line-height: 1.125rem;
        &.active {
            @apply bg-blue-300;
        }
        .text {
            @apply truncate;
        }
    }
    .menu-item {
        @apply text-gray-900 cursor-pointer;
        display: flex;
        align-items: center;
        .p-i-icon {
            flex-shrink: 0;
        }
        .ellipsis {
            @apply truncate;
            line-height: 1.4;
        }
        .link-icon {
            @apply self-start ml-1 text-gray-500;
            line-height: 0.8;
        }
    }
    .no-data-text {
        @apply text-gray-500;
        margin-top: 2.25rem;
        margin-bottom: 2.25rem;
        font-size: 0.875rem;
        line-height: 1.2;
    }
    .no-data-img {
        display: inline-block;
        height: 6rem;
    }
    .show-more {
        @apply text-xs text-gray-500 p-2 cursor-pointer;
        &:hover {
            @apply bg-blue-200;
        }
        .text {
            @apply ml-1;
        }
    }
}
</style>
