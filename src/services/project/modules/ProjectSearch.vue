<template>
    <div v-click-outside="hideMenu"
         class="project-search"
    >
        <p-search v-model="searchText"
                  :placeholder="groupId ? $t('PROJECT.LANDING.PLACE_HOLDER_PROJECT') : $t('PROJECT.LANDING.PLACE_HOLDER_EXAMPLE')"
                  :disable-icon="!!groupId"
                  @delete="onDeleteAll"
                  @input="onInput"
                  @search="onSearch"
                  @keydown.delete.native="onDeletePrefix"
                  @mousedown.stop.native="handleMousedownSearch"
                  @keydown.esc.native="hideMenu"
                  @keydown.down.native="focusMenu"
        >
            <template #left>
                <div v-if="groupId"
                     class="prefix-tag"
                     :class="{active: isFocused || visibleMenu}"
                >
                    <span class="text">{{ groupName }}</span>
                </div>
            </template>
        </p-search>
        <p-context-menu v-show="visibleMenu"
                        ref="menuRef"
                        :menu="menu"
                        :selected="selected"
                        :loading="loading"
                        :is-focused.sync="isFocused"
                        @select="onMenuSelect"
        >
            <template #item--format="{item}">
                <p-text-highlighting :text="item.label"
                                     :term="trimmedValue"
                                     style-type="secondary"
                />
            </template>
            <template #header-more="{item}">
                <div class="show-more"
                     @click.stop="onShowMore(item)"
                >
                    <p-i name="ic_search"
                         color="inherit"
                         height="1rem"
                         width="1rem"
                    />
                    <span class="text">{{ $t('PROJECT.LANDING.PLACE_HOLDER_SHOW_MORE') }}</span>
                </div>
            </template>
        </p-context-menu>
    </div>
</template>

<script lang="ts">

import { vOnClickOutside } from '@vueuse/components';
import type { DirectiveFunction } from 'vue';
import {
    computed, getCurrentInstance, reactive, toRefs, watch,
} from 'vue';
import type { Vue } from 'vue/types/vue';

import {
    PContextMenu, PI, PSearch, PTextHighlighting,
} from '@spaceone/design-system';
import type { MenuItem as ContextMenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import { debounce } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useProjectPageStore } from '@/services/project/store/project-page-store';
import type { ItemType } from '@/services/project/type';

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
                target: d.type === 'PROJECT' ? '_blank' : undefined,
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

export default {
    name: 'ProjectSearch',
    components: {
        PContextMenu,
        PSearch,
        PI,
        PTextHighlighting,
    },
    directives: {
        clickOutside: vOnClickOutside as DirectiveFunction,
    },
    setup() {
        const vm = getCurrentInstance()?.proxy as Vue;
        const projectPageStore = useProjectPageStore();
        const state = reactive({
            menuRef: null as null|Vue,
            groupId: computed(() => projectPageStore.groupId),
            groupName: computed(() => projectPageStore.groupName),
            searchText: '' as string,
            trimmedValue: computed<string>(() => (typeof state.searchText === 'string' ? state.searchText.trim() : '')),
            regex: computed(() => {
                if (state.trimmedValue) {
                    return RegExp(state.trimmedValue, 'i');
                }
                // eslint-disable-next-line prefer-regex-literals
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
                        icon: 'ic_folder-filled',
                    });
                }
                menuOptions.push({
                    title: 'Project',
                    items: state.projectItems,
                    type: 'PROJECT',
                    count: state.projectTotalCount,
                    showMore: state.projectTotalCount >= state.projectStart + LIMIT,
                    icon: 'ic_document-filled',
                });
                return makeMenuItems(...menuOptions);
            }),
            selected: computed(() => {
                if (!state.groupId) return [];
                return [{ name: state.groupId }];
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
                ErrorHandler.handleError(e);
                state.projectItems = [];
                state.projectGroupItems = [];
            } finally {
                state.loading = false;
            }
        };

        const showMenu = () => { state.visibleMenu = true; };
        const hideMenu = () => { state.visibleMenu = false; };

        const onInput = debounce(async () => {
            await listItems();
        }, 300);

        watch(() => state.groupId, async () => {
            if (state.visibleMenu) await listItems();
        });

        const commitSearchContext = (groupId?: string, searchText?: string) => {
            let val = searchText;
            if (typeof searchText === 'string') val = searchText.trim();
            if (!val) val = '';
            if (state.groupId !== groupId) {
                projectPageStore.selectNode(groupId);
            }
            if (projectPageStore.searchText !== val) {
                projectPageStore.searchText = val;
            }
        };

        const onSearch = (text: string) => {
            commitSearchContext(state.groupId, text);
            hideMenu();
            state.isFocused = false;
        };

        const onMenuSelect = (item: MenuItem) => {
            if (item.dataType === 'PROJECT_GROUP') {
                state.searchText = '';
                commitSearchContext(item.name, '');
                state.isFocused = false;
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
            onInput();
        };

        if (vm.$route.query.search) {
            state.searchText = vm.$route.query.search as string;
            projectPageStore.searchText = vm.$route.query.search as string;
        }

        const focusMenu = () => {
            if (state.menuRef) state.menuRef.focus();
        };

        const handleMousedownSearch = () => {
            if (!state.visibleMenu) {
                showMenu();
                onInput();
            }
        };

        return {
            ...toRefs(state),
            onInput,
            onSearch,
            commitSearchContext,
            hideMenu,
            onMenuSelect,
            getMatchText,
            onShowMore,
            onDeletePrefix,
            onDeleteAll,
            focusMenu,
            handleMousedownSearch,
        };
    },
};
</script>

<style lang="postcss" scoped>
.project-search {
    @apply w-full;
    padding: 0 0.75rem;
    position: relative;

    /* custom design-system component - p-search */
    :deep(.p-search) {
        .p-search {
            overflow-x: hidden;
            overflow-y: hidden;
            input {
                min-width: 0;
            }
        }
    }
    .p-context-menu {
        @apply font-normal;
        position: absolute;
        margin-top: -1px;
        z-index: 1000;
        min-width: calc(100% - 1.5rem);
        width: calc(100% - 1.5rem);
    }
    .prefix-tag {
        @apply bg-gray-200 rounded-xs px-2 text-xs mr-2 inline-flex items-center flex-shrink-0;
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
