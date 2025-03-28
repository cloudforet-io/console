<script setup lang="ts">
import {
    computed, onMounted, reactive, ref, watch,
} from 'vue';
import type { Location } from 'vue-router';
import { useRouter } from 'vue-router/composables';

import { sortBy } from 'lodash';

import {
    PSelectDropdown, PTooltip, PI, PButton, PTextHighlighting, PEmpty,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import type { ReferenceData } from '@/lib/helper/config-data-helper';
import { convertWorkspaceConfigToReferenceData } from '@/lib/helper/config-data-helper';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import { useCurrentMenuId } from '@/common/composables/current-menu-id';
import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import { useFavoriteStore } from '@/common/modules/favorites/favorite-button/store/favorite-store';
import type { FavoriteItem } from '@/common/modules/favorites/favorite-button/type';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import { useRecentStore } from '@/common/modules/navigations/stores/recent-store';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';
import { RECENT_TYPE } from '@/common/modules/navigations/type';

import { gray, violet } from '@/styles/colors';

import { LANDING_ROUTE } from '@/services/landing/routes/route-constant';

const PAGE_SIZE = 9;

interface Props {
    isAdminMode: boolean;
    to: Location;
}

const props = withDefaults(defineProps<Props>(), {
    isAdminMode: false,
});
const appContextStore = useAppContextStore();
const userWorkspaceStore = useUserWorkspaceStore();
const workspaceStoreGetters = userWorkspaceStore.getters;
const favoriteStore = useFavoriteStore();
const favoriteGetters = favoriteStore.getters;
const recentStore = useRecentStore();

const { currentMenuId } = useCurrentMenuId();

const router = useRouter();

const selectDropdownRef = ref<PSelectDropdown|null>(null);

const storeState = reactive({
    workspaceList: computed<WorkspaceModel[]>(() => workspaceStoreGetters.workspaceList),
    selectedWorkspace: computed<WorkspaceModel|undefined>(() => workspaceStoreGetters.currentWorkspace),
    currentWorkspaceId: computed<string|undefined>(() => userWorkspaceStore.getters.currentWorkspaceId),
    favoriteItems: computed<ReferenceData[]>(() => {
        const sortedList = sortBy(favoriteGetters.workspaceItems, 'label');
        return convertWorkspaceConfigToReferenceData(
            sortedList ?? [],
            storeState.workspaceList,
        );
    }),
});
const state = reactive({
    visibleSelectDropdown: false,
    searchText: '',
});

const selectWorkspace = (name: string): void => {
    const workspaceId = name;
    if (!workspaceId || workspaceId === storeState.currentWorkspaceId) return;

    appContextStore.setGlobalGrantLoading(true);
    userWorkspaceStore.setCurrentWorkspace(workspaceId);
    router.push({ name: MENU_INFO_MAP[currentMenuId.value].routeName, params: { workspaceId } }).catch(() => {});
};
const formatMenuItems = (menuItems: WorkspaceModel[] = []): MenuItem[] => {
    const result = menuItems.length > 0 ? [
        { type: 'header', name: 'workspace_header', label: `${i18n.t('COMMON.GNB.WORKSPACE.WORKSPACES')} (${storeState.workspaceList.length})` },
    ] : [] as MenuItem[];
    menuItems.forEach((d) => {
        result.push({
            ...d,
            type: 'item',
            name: d.workspace_id || '',
            label: d.name as string,
        });
    });
    return result.slice(0, PAGE_SIZE);
};
const filterStarredItems = (menuItems: FavoriteItem[] = []): MenuItem[] => {
    if (storeState.favoriteItems.length === 0) return [];
    const result: MenuItem[] = [
        { type: 'header', name: 'starred_header', label: i18n.t('COMMON.STARRED') },
    ];
    menuItems.forEach((d) => {
        const item = storeState.workspaceList.find((w) => w.workspace_id === d.itemId);
        if (item) {
            result.push({
                ...item,
                type: 'item',
                name: d.itemId || '',
                label: d.label as string,
            });
        }
    });
    return result;
};
const handleClickAllWorkspaceButton = () => {
    router.push({
        name: LANDING_ROUTE.WORKSPACE._NAME,
    });
};
const checkFavoriteItem = (id: string) => {
    const item = storeState.favoriteItems.find((i) => i.name === id);
    return !!item;
};
const menuHandler = async (inputText: string) => {
    const _workspaceList = storeState.workspaceList.filter((w) => w.name.toLowerCase()?.includes(inputText.toLowerCase()) && !w.is_dormant);
    return {
        results: inputText ? formatMenuItems(_workspaceList) : [
            ...filterStarredItems(storeState.favoriteItems),
            ...formatMenuItems(_workspaceList),
        ],
    };
};

watch(() => storeState.favoriteItems, async () => {
    if (!selectDropdownRef.value) return;
    await selectDropdownRef.value?.reloadMenu();
});
watch(() => storeState.selectedWorkspace, (selectedWorkspace) => {
    if (!selectedWorkspace) return;
    recentStore.createRecent({
        type: RECENT_TYPE.WORKSPACE,
        workspaceId: selectedWorkspace?.workspace_id || '',
        id: selectedWorkspace?.workspace_id || '',
    });
}, { immediate: true });

onMounted(() => {
    favoriteStore.fetchWorkspaceFavorite();
});
</script>

<template>
    <div :class="{'top-bar-header': true, 'admin-mode': props.isAdminMode}"
         data-gtm="gtm-top-bar-logo"
    >
        <div v-if="props.isAdminMode"
             class="admin-header"
        >
            <div class="admin-icon">
                <p-i name="ic_admin-icon"
                     width="1.75rem"
                     height="1.75rem"
                />
            </div>
            <span class="admin-title">
                Admin <span class="omitable-text">Center</span>
            </span>
        </div>
        <p-select-dropdown v-if="!props.isAdminMode"
                           ref="selectDropdownRef"
                           :class="{'workspace-dropdown': true}"
                           style-type="transparent"
                           menu-width="20rem"
                           :visible-menu.sync="state.visibleSelectDropdown"
                           :handler="menuHandler"
                           :search-text.sync="state.searchText"
                           is-filterable
                           hide-header-without-items
                           show-delete-all-button
                           use-fixed-menu-style
                           :selected="storeState.selectedWorkspace?.workspace_id"
                           @select="selectWorkspace"
        >
            <template #dropdown-button-icon>
                <p-i name="ic_chevron-sort"
                     width="1rem"
                     height="1rem"
                     :color="gray[800]"
                />
            </template>
            <template #dropdown-button>
                <workspace-logo-icon :text="storeState.selectedWorkspace?.name || ''"
                                     :theme="storeState.selectedWorkspace?.tags?.theme"
                />
                <div>
                    <span class="selected-workspace">
                        {{ storeState.selectedWorkspace?.name }}
                    </span>
                    <span class="tablet-selected">
                        ...
                    </span>
                </div>
            </template>
            <template #menu-header>
                <p-tooltip class="menu-header-selected-workspace"
                           position="bottom"
                           :contents="storeState.selectedWorkspace?.name || ''"
                >
                    <div class="workspace-wrapper">
                        <workspace-logo-icon :text="storeState.selectedWorkspace?.name || ''"
                                             :theme="storeState.selectedWorkspace?.tags?.theme"
                                             size="xs"
                        />
                        <span class="workspace-name">{{ storeState.selectedWorkspace?.name }}</span>
                    </div>
                    <p-i name="ic_check"
                         :color="violet[600]"
                         width="1rem"
                         height="1rem"
                    />
                </p-tooltip>
            </template>
            <template #menu-item--format="{item}">
                <div class="menu-item-wrapper"
                     :class="{ 'is-starred': checkFavoriteItem(item.name)}"
                >
                    <div class="label">
                        <workspace-logo-icon :text="item?.label || ''"
                                             :theme="item?.tags?.theme"
                                             size="xs"
                        />
                        <p-text-highlighting class="label-text"
                                             :text="item.label"
                                             :term="state.searchText"
                        />
                    </div>
                    <favorite-button :item-id="item.name"
                                     :favorite-type="FAVORITE_TYPE.WORKSPACE"
                                     scale="0.875"
                                     class="favorite-button"
                    />
                </div>
            </template>
            <template #menu-bottom>
                <div class="workspace-toolbox-wrapper">
                    <p-button style-type="transparent"
                              size="md"
                              class="view-all-workspace-button tool"
                              icon-right="ic_arrow-right"
                              @click="handleClickAllWorkspaceButton"
                    >
                        {{ $t("COMMON.GNB.WORKSPACE.VIEW_WORKSPACES") }}
                    </p-button>
                </div>
            </template>
            <template #no-data-area>
                <div class="no-data-wrapper">
                    <p class="title-wrapper">
                        <span class="title">{{ $t('COMMON.GNB.WORKSPACE.WORKSPACES') }} </span>
                        <span>({{ storeState.workspaceList.length }})</span>
                    </p>
                    <p-empty class="empty">
                        {{ $t('COMMON.GNB.WORKSPACE.NO_RESULTS_FOUND') }}
                    </p-empty>
                </div>
            </template>
        </p-select-dropdown>
    </div>
</template>

<style scoped lang="postcss">
.top-bar-header {
    @apply inline-flex items-center w-full h-full;
    max-width: 20rem;
    width: 20rem;
    height: 1.75rem;
    margin-left: 1.25rem;

    &.admin-mode {
        width: 100%;
        max-width: initial;

        @screen mobile {
            box-shadow: none;
        }
    }

    @screen tablet {
        width: 8.75rem;
    }

    @screen mobile {
        width: 16.25rem;
        box-shadow: none;
    }

    .admin-header {
        @apply flex items-center;
        gap: 0.75rem;

        .admin-title {
            @apply flex text-label-lg text-violet-100 w-full;
            gap: 0.25rem;

            .omitable-text {
                @apply mobile:hidden;
            }
        }

        @screen tablet {
            gap: 0.5rem;
        }
    }
    .workspace-dropdown {
        @apply inline-flex;

        @screen tablet {
            width: 3.625rem;
        }

        .menu-header-selected-workspace {
            @apply flex items-center justify-between text-label-md font-medium;
            padding: 0.875rem 1rem;
            .workspace-wrapper {
                @apply flex items-center;
                flex: 1;
                gap: 0.75rem;
                .workspace-name {
                    flex: 1;
                    max-width: 13.25rem;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                }
            }
            &::before {
                @apply absolute;
                content: "";
                width: calc(100% + 2rem);
                bottom: -0.875rem;
                left: -1rem;
                border-bottom: 3px solid #dddddf;
            }
        }

        .menu-item-wrapper {
            @apply flex justify-between;
            max-width: 18rem;
            &.is-starred {
                .label-text {
                    max-width: 14rem;
                }
            }
            &:hover {
                .label-text {
                    max-width: 14rem;
                }
            }
            .label {
                @apply flex items-center gap-2;
            }
            .label-text {
                @apply truncate;
                max-width: 15.25rem;
            }
        }

        .workspace-toolbox-wrapper {
            @apply flex flex-col bg-white;
            padding: 0.25rem 1rem 0.5rem;
            width: 100%;
            gap: 0.625rem;
            .workspace-toolbox {
                @apply relative flex flex-col;
                gap: 0.5rem;
                .tool {
                    height: 1.5rem;
                }
                .tools-divider {
                    width: calc(100% + 2rem);
                    height: 0.125rem;
                    margin-left: -1rem;
                }
            }
        }

        .no-data-wrapper {
            .title-wrapper {
                @apply text-paragraph-sm text-gray-500;
                .title {
                    @apply font-bold;
                }
            }
            .empty {
                padding-top: 0.75rem;
                padding-bottom: 1.5rem;
            }
        }

        /* custom design-system component - p-select-dropdown */

        /* custom design-system component - p-context-menu */
        :deep(.p-context-menu) {
            .menu-container {
                padding-left: 0.5rem;
                padding-right: 0.5rem;
            }
            .p-context-menu-item {
                .favorite-button {
                    &:not(.active) {
                        @apply hidden;
                    }
                    transform: scale(1);
                }
                &:hover {
                    .favorite-button {
                        @apply block;
                    }
                }
            }
            .bottom-slot-area {
                padding: 0;
            }
        }

        .selected-workspace {
            @apply text-label-lg text-gray-800 inline-block font-medium;
            max-width: 16rem;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            vertical-align: bottom;
            padding-left: 0.5rem;

            @apply tablet:hidden;
        }
        .tablet-selected {
            @apply hidden text-label-lg text-gray-800;
            padding-left: 0.75rem;

            @apply tablet:inline-block;
        }
    }
}
</style>
