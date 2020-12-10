<template>
    <div class="project-search">
        <p-autocomplete-search v-model="searchText"
                               theme="secondary"
                               :placeholder="groupId ? $t('PROJECT.LANDING.PLACE_HOLDER_PROJECT') : $t('PROJECT.LANDING.PLACE_HOLDER_EXAMPLE')"
                               :disable-icon="!!groupId"
                               :menu="menu"
                               :visible-menu.sync="visibleMenu"
                               :is-focused.sync="isFocused"
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
            <template #menu-no-data>
                <div class="text-center">
                    <!--                    <p class="no-data-text">-->
                    <!--                        No results match your search.<br>-->
                    <!--                        Try again with a different term.-->
                    <!--                    </p>-->
                    <!--                    <img src="@/assets/images/illust_satellite.svg" class="no-data-img">-->
                </div>
            </template>
            <template #menu-item--format="{item}">
                <div class="menu-item">
                    <p-i :name="item.icon" height="1rem" width="1rem"
                         class="mr-1"
                    />
                    <template v-if="trimmedValue">
                        <span v-for="(text, i) in item.label.split(regex)" :key="i">
                            <strong v-if="i !== 0">{{ getMatchText(item.label) }}</strong>
                            <span class="font-normal">{{ text }}</span>
                        </span>
                    </template>
                    <template v-else>
                        <span>{{ item.label }}</span>
                    </template>
                    <!--                    <template v-if="item.dataType === 'PROJECT'">-->
                    <!--                        <span class="link-icon"><p-i name="ic_external-link" height="0.875rem" width="0.875rem" /></span>-->
                    <!--                    </template>-->
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
import PAutocompleteSearch from '@/components/organisms/search/autocomplete-search/PAutocompleteSearch.vue';
import {
    ComponentRenderProxy,
    computed, getCurrentInstance, reactive, toRefs, UnwrapRef, watch,
} from '@vue/composition-api';
import { MenuItem as ContextMenuItem } from '@/components/organisms/context-menu/type';
import { debounce } from 'lodash';
import PI from '@/components/atoms/icons/PI.vue';
import { ItemType } from '@/views/project/project/type';
import { ApiQueryHelper, SpaceConnector } from '@/lib/space-connector';

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
    props: {
        groupId: {
            type: String,
            default: undefined,
        },
        groupName: {
            type: String,
            default: undefined,
        },
    },
    setup(props: Props, { emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            searchText: vm.$route.query.search as string,
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
            menu: computed<MenuItem[]>(() => {
                const menuOptions: MenuOption[] = [];
                if (!props.groupId) {
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
                projectGroupQuery.setApiFilter({ k: 'name', v: state.searchText, o: 'contain' });
            } else {
                projectGroupQuery.setApiFilter();
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
            if (props.groupId) {
                api = SpaceConnector.client.identity.projectGroup.listProjects;
                param.recursive = true;
                param.project_group_id = props.groupId;
            } else {
                api = SpaceConnector.client.identity.project.list;
            }

            if (state.searchText) {
                projectQuery.setApiFilter({ k: 'name', v: state.searchText, o: 'contain' });
            } else {
                projectQuery.setApiFilter();
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
            try {
                await Promise.all([listProjectGroups(), listProjects()]);
            } catch (e) {
                console.error(e);
                state.projectItems = [];
                state.projectGroupItems = [];
            }
        };

        const showMenu = () => { state.visibleMenu = true; };
        const hideMenu = () => { state.visibleMenu = false; };

        const onInput = debounce(async (e?) => {
            if (!state.visibleMenu) showMenu();
            await listItems();
        }, 300);

        watch(() => props.groupId, async () => {
            if (state.visibleMenu) await listItems();
        }, { immediate: true });


        const emitSearch = (groupId?: string, searchText?: string, hide = true) => {
            let val = searchText;
            if (typeof searchText === 'string') val = searchText.trim();
            if (!val) val = '';
            emit('search', groupId, val);
            if (hide) hideMenu();
            state.isFocused = false;
        };

        const onSearch = () => {
            emitSearch(props.groupId, state.searchText);
        };

        const onMenuSelect = (value: string, idx: number) => {
            const item = state.menu[idx];
            if (item.dataType === 'PROJECT_GROUP') {
                state.searchText = '';
                emitSearch(item.name, value, false);
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
                emitSearch();
            }
        };

        const onDeleteAll = () => {
            emitSearch();
        };


        return {
            ...toRefs(state),
            onInput,
            onSearch,
            emitSearch,
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
        }
        .menu-container {
            @apply pr-4;
            .p-context-menu {
                /*min-height: 2rem;*/
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
        @apply text-gray-900 cursor-pointer truncate;
        display: flex;
        align-items: center;
        line-height: 1.2;
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
