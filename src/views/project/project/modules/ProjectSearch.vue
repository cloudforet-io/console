<template>
    <div class="project-search">
        <p-autocomplete-search v-model="proxySearchText"
                               theme="secondary"
                               :placeholder="selectedProjectGroup ? 'project' : 'e.g. project/project group'"
                               :disable-icon="!!selectedProjectGroup"
                               :menu="menu"
                               :visible-menu.sync="visibleMenu"
                               :is-focused.sync="isFocused"
                               @delete="onDeleteAll"
                               @input="onInput"
                               @search="onSearch"
                               @menu:select="onMenuSelect"
                               @mousedown.stop="onInput()"
                               @menu:hide="hideMenu"
                               @keydown.delete="onDeletePrefix"
        >
            <template #search-left>
                <div v-if="selectedProjectGroup" class="prefix-tag"
                     :class="{active: isFocused || visibleMenu}"
                >
                    <span class="text">{{ selectedProjectGroup.name }}</span>
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
                    <span class="text">show more</span>
                </div>
            </template>
        </p-autocomplete-search>
    </div>
</template>

<script lang="ts">
import PAutocompleteSearch from '@/components/organisms/search/autocomplete-search/PAutocompleteSearch.vue';
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';
import { makeProxy } from '@/components/util/composition-helpers';
import { MenuItem as ContextMenuItem } from '@/components/organisms/context-menu/PContextMenu.toolset';
import { debounce } from 'lodash';
import PI from '@/components/atoms/icons/PI.vue';
import { fluentApi, ProjectGroupInfo } from '@/lib/fluent-api';
import { ProjectModel } from '@/lib/fluent-api/identity/project';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';
import PLottie from '@/components/molecules/lottie/PLottie.vue';
import {
    ProjectGroup, Props, DataType, SearchResult,
} from './ProjectSearch.toolset';

const LIMIT = Object.freeze(5);


interface MenuOption {
    title: string;
    items: any[];
    type: DataType;
    count: number;
    icon: string;
    showMore: boolean;
}

interface MenuItem extends ContextMenuItem {
    icon?: string;
    dataType?: DataType;
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


interface State {
    proxySearchText?: string;
    trimmedValue: string;
    regex: RegExp;
    selectedProjectGroup: null|ProjectGroup;
    projectGroupItems: ProjectGroupInfo[];
    projectItems: ProjectModel[];
    projectGroupTotalCount: number;
    projectTotalCount: number;
    projectGroupStart: number;
    projectStart: number;
    menu: Readonly<MenuItem[]>;
    visibleMenu: boolean;
    isFocused: boolean;
}

export default {
    name: 'ProjectSearch',
    components: {
        PLottie,
        PI,
        PAutocompleteSearch,
    },
    props: {
        searchText: {
            type: String,
            default: '',
        },
        projectGroup: {
            type: Object,
            default: null,
            validator(pg) {
                if (pg === null) return true;
                if (pg) return pg.name && pg.id;
                return false;
            },
        },
    },
    setup(props: Props, { emit }) {
        const state: UnwrapRef<State> = reactive({
            proxySearchText: makeProxy('searchText', props, emit),
            trimmedValue: computed<string>(() => (typeof state.proxySearchText === 'string' ? state.proxySearchText.trim() : '')),
            regex: computed(() => {
                if (state.trimmedValue) {
                    return RegExp(state.trimmedValue, 'i');
                }
                return RegExp(/./);
            }),
            selectedProjectGroup: null,
            projectGroupItems: [],
            projectItems: [],
            projectGroupTotalCount: 0,
            projectTotalCount: 0,
            projectGroupStart: 1,
            projectStart: 1,
            menu: computed<MenuItem[]>(() => {
                const menuOptions: MenuOption[] = [];
                if (state.selectedProjectGroup === null) {
                    menuOptions.push({
                        title: 'Project group',
                        items: state.projectGroupItems,
                        type: 'PROJECT_GROUP',
                        count: state.projectGroupTotalCount,
                        showMore: state.projectGroupTotalCount > state.projectGroupStart * LIMIT,
                        icon: 'ic_tree_project-group',
                    });
                }
                menuOptions.push({
                    title: 'Project',
                    items: state.projectItems,
                    type: 'PROJECT',
                    count: state.projectTotalCount,
                    showMore: state.projectTotalCount > state.projectStart * LIMIT,
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

        // const projectGroupApi = fluentApi.identity().projectGroup().get();
        const projectGroupListApi = fluentApi.identity().projectGroup().list()
            .setPageSize(LIMIT)
            .setOnly('project_group_id', 'name');
        const scopedProjectListApi = fluentApi.identity().projectGroup()
            .listProjects().setRecursive(true)
            .setPageSize(LIMIT);
        const projectListApi = fluentApi.identity().project().list()
            .setPageSize(LIMIT);

        // const getProjectGroup = async (): Promise<ProjectGroupInfo> => {
        //     const res = await projectGroupApi.setId(props.projectGroupId).execute();
        //     return res.data;
        // };

        const listProjectGroups = async () => {
            let api = projectGroupListApi;
            if (state.proxySearchText) {
                api = projectGroupListApi.setFilter({
                    key: 'name',
                    value: state.proxySearchText,
                    operator: '',
                });
            }
            const res = await api.setThisPage(state.projectGroupStart).execute();
            if (state.projectGroupStart === 1) state.projectGroupItems = res.data.results;
            else state.projectGroupItems = [...state.projectGroupItems, ...res.data.results];
            state.projectGroupTotalCount = res.data.total_count;
        };

        const listProjects = async () => {
            let api = props.projectGroup
                ? scopedProjectListApi.setProjectGroupId(props.projectGroup.id)
                : projectListApi;
            if (state.proxySearchText) {
                api = api.setFilter({
                    key: 'name',
                    value: state.proxySearchText,
                    operator: '',
                });
            }
            const res = await api.setThisPage(state.projectStart).execute();
            if (state.projectStart === 1) state.projectItems = res.data.results;
            else state.projectItems = [...state.projectItems, ...res.data.results];
            state.projectTotalCount = res.data.total_count;
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

        watch(() => props.projectGroup, async (pg) => {
            if (pg) {
                state.selectedProjectGroup = pg;
            } else state.selectedProjectGroup = null;
            if (state.visibleMenu) await listItems();
        });


        const emitSearch = (value?: string, projectGroup: ProjectGroup|null = null, hide = true) => {
            let val = value;
            if (typeof value === 'string') val = value.trim();
            if (!val) val = '';
            const res: SearchResult = {
                projectGroup: projectGroup || null,
                value: val,
            };
            emit('search', res);
            if (hide) hideMenu();
            state.isFocused = false;
        };

        const onSearch = (e) => {
            emitSearch(state.proxySearchText, props.projectGroup);
        };

        const onMenuSelect = (value: string, idx: number) => {
            const item = state.menu[idx];
            if (item.dataType === 'PROJECT_GROUP') {
                const projectGroup = {
                    id: item.name as string,
                    name: item.label as string,
                };
                state.proxySearchText = '';
                emitSearch(value, projectGroup, false);
                state.projectGroupStart = 1;
                listProjectGroups();
                state.isFocused = true;
            } else {
                state.proxySearchText = '';
            }
        };

        const onShowMore = async (item: MenuItem) => {
            if (item.dataType === 'PROJECT') {
                state.projectStart += 1;
                await listProjects();
            } else {
                state.projectGroupStart += 1;
                await listProjectGroups();
            }
        };

        const onDeletePrefix = (e: KeyboardEvent) => {
            if (!(e.target as HTMLInputElement).value) {
                emitSearch('');
            }
        };

        const onDeleteAll = () => {
            emitSearch('');
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
