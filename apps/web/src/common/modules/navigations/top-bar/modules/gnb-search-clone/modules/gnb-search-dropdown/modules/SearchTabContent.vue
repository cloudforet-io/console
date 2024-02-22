<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import { PDivider, PContextMenu } from '@spaceone/design-system';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import type { MenuInfo } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import { useProxyValue } from '@/common/composables/proxy-state';
import type { SuggestionType, SuggestionItem } from '@/common/modules/navigations/top-bar/modules/gnb-search-clone/config';
import { SUGGESTION_TYPE } from '@/common/modules/navigations/top-bar/modules/gnb-search-clone/config';
import { createSearchRecent } from '@/common/modules/navigations/top-bar/modules/gnb-search-clone/helper';
import GNBSearchWorkspaceFilter
    from '@/common/modules/navigations/top-bar/modules/gnb-search-clone/modules/gnb-search-dropdown/modules/TopBarSearchWorkspaceFilter.vue';
import { useTopBarSearchStore } from '@/common/modules/navigations/top-bar/modules/gnb-search-clone/store';
import type { FocusingDirection } from '@/common/modules/navigations/top-bar/modules/gnb-search-clone/type';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';


interface Props {
    loading: boolean;
    searchLimit: number;
    isFocused: boolean;
    focusingDirection: string;
}

const props = withDefaults(defineProps<Props>(), {
    loading: true,
    searchLimit: 15,
    isFocused: false,
    focusingDirection: 'DOWNWARD',
});

const userWorkspaceStore = useUserWorkspaceStore();
const workspaceStoreGetter = userWorkspaceStore.getters;
const topBarSearchStore = useTopBarSearchStore();
const router = useRouter();

const emit = defineEmits<{(event: 'select', item: SuggestionItem, index: number): void;
    (event: 'close'): void;
    (event: 'move-focus-end'): void;
    (event: 'update:isFocused', value: boolean): void;
}>();


const state = reactive({
    inputText: computed(() => topBarSearchStore.getters.inputText),
    trimmedInputText: computed(() => topBarSearchStore.getters.trimmedInputText),
    searchMenuMap: computed(() => topBarSearchStore.state.searchMenuMap),
    refinedSearchMenu: computed(() => state.searchMenuMap),
    recentMenuList: computed(() => topBarSearchStore.state.recentMenuList),
    serviceMenuCount: computed(() => Object.keys(state.searchMenuMap).length),
    selectedWorkspaceList: computed(() => workspaceStoreGetter.workspaceList.filter((workspace) => topBarSearchStore.state.selectedWorkspaces.includes(workspace.workspace_id))),
    // focus
    proxyFocusingDirection: useProxyValue('focusingDirection', props, emit),
    focusingType: SUGGESTION_TYPE.MENU as SuggestionType,
});

const handleFocusEnd = (type: SuggestionType, direction: FocusingDirection) => {
    if (type === SUGGESTION_TYPE.MENU && direction === 'DOWNWARD') {
        state.proxyFocusingDirection = direction;
    }
    // TODO: need UPWARD case
    emit('move-focus-end');
};

const handleSelect = (item) => {
    const menuId = item.id;
    const menuInfo: MenuInfo = MENU_INFO_MAP[menuId];
    if (menuInfo && router.currentRoute.name !== menuId) {
        router.push({ name: menuInfo.routeName }).catch(() => {});
        if (!state.showRecent && workspaceStoreGetter.currentWorkspaceId) createSearchRecent(SUGGESTION_TYPE.MENU, menuId, workspaceStoreGetter.currentWorkspaceId);
    }
    topBarSearchStore.setIsActivated(false);
};

// /* Watcher */
// TODO: for focusing
// watch(() => props.isFocused, (isFocused) => {
//     if (isFocused) {
//         if (props.focusingDirection === 'DOWNWARD') {
//             if (state.inputText.length === 0) {
//                 state.focusingType = SUGGESTION_TYPE.MENU;
//         } else {
//             state.focusingType = props.items[props.items.length - 1].itemType;
//         }
//     }
// });
</script>
<template>
    <div class="g-n-b-search-service-tab">
        <div v-if="state.inputText.length === 0"
             class="service-item-list"
        />
        <div v-else
             class="service-item-list"
        >
            <div v-for="workspace in state.selectedWorkspaceList"
                 :key="workspace.workspace_id"
            >
                <p-context-menu class="search-list-context"
                                :menu="state.refinedSearchMenu[workspace.workspace_id]"
                                no-select-indication
                                @keyup:up:end="handleFocusEnd(SUGGESTION_TYPE.MENU, 'UPWARD')"
                                @keyup:down:end="handleFocusEnd(SUGGESTION_TYPE.MENU, 'DOWNWARD')"
                                @keyup:esc="emit('close')"
                                @focus="emit('update:isFocused', true)"
                                @blur="emit('update:isFocused', false)"
                                @select="handleSelect"
                >
                    <template #header>
                        <div class="context-header">
                            <workspace-logo-icon :text="workspace.name"
                                                 :theme="workspace.tags?.theme"
                                                 size="xs"
                            /><span class="label"> {{ workspace.name }}</span>
                        </div>
                    </template>
                    <template #item--format="{ item }">
                        <slot name="item-format"
                              v-bind="item"
                        />
                    </template>
                </p-context-menu>
                <div v-if="state.inputText && state.serviceMenuCount > props.searchLimit"
                     class="too-many-results-wrapper"
                >
                    <div class="dim-wrapper" />
                    <p>{{ $t('COMMON.GNB.SEARCH.TOO_MANY_RESULTS') }} <br> {{ $t('COMMON.GNB.SEARCH.TRY_SEARCH_AGAIN') }}</p>
                </div>
            </div>
        </div>
        <p-divider vertical />
        <g-n-b-search-workspace-filter class="filter" />
    </div>
</template>

<style scoped lang="postcss">
.g-n-b-search-service-tab {
    @apply flex gap-3 h-full;
    padding: 1rem 0;
    height: 100%;

    .service-item-list {
        height: 100%;
        width: 100%;
        overflow-y: auto;

        .search-list-context {
            @apply bg-white border-none;
            padding-left: 0.75rem;
            padding-right: 0.75rem;
            padding-bottom: 0.125rem;
            max-height: unset;

            /* custom design-system component - p-context-menu */
            :deep() {
                .context-header {
                    @apply inline-flex items-center gap-1;
                    margin-top: 0;
                    margin-bottom: 0.25rem;
                    padding-left: 0.5rem;
                    padding-right: 0.5rem;

                    .label {
                        @apply text-label-md font-bold text-gray-700;
                    }

                }

                .p-context-menu-item {
                    justify-content: flex-start;
                    line-height: 1.75;
                    padding: 0.25rem 0.5rem;
                    .label-wrapper {
                        overflow: visible;
                    }

                    &:focus {
                        @apply border border-blue-400 rounded-xs;
                        box-shadow: 0 0 0 0.125rem rgba(73, 167, 247, 0.2);
                        outline: none;

                        &:not(:hover):not(.disabled):not(.empty) {
                            @apply bg-white;
                        }
                    }
                }

                .context-divider {
                    margin: 0.875rem 0 1rem;
                }

                .matched-character {
                    @apply text-blue-700 bg-blue-200;
                }
            }
        }
    }

    .too-many-results-wrapper {
        @apply text-gray-400;
        font-size: 0.75rem;
        line-height: 1.5;
        text-align: center;
        padding: 1rem 0.75rem;

        .dim-wrapper {
            position: relative;
            background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, white 100%);
            height: 2rem;
            pointer-events: none;
            margin-top: -3rem;
            margin-bottom: 1rem;
        }
    }

    .filter {
        width: 13.25rem;
    }
}
</style>
