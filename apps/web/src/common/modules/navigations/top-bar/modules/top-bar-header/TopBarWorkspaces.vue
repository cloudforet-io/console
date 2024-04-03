<script setup lang="ts">
import Vue, {
    computed, onMounted, reactive, watch,
} from 'vue';
import type { Location } from 'vue-router';
import { useRouter } from 'vue-router/composables';

import {
    PSelectDropdown, PTooltip, PI, PButton, PDivider,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/src/inputs/context-menu/type';
import { CONTEXT_MENU_TYPE } from '@spaceone/design-system/src/inputs/context-menu/type';
import { clone, sortBy } from 'lodash';

import type { WorkspaceModel } from '@/schema/identity/workspace/model';
import { store } from '@/store';
import { i18n } from '@/translations';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import type { MenuId } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import { useFavoriteStore } from '@/common/modules/favorites/favorite-button/store/favorite-store';
import type { FavoriteItem } from '@/common/modules/favorites/favorite-button/type';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import { useRecentStore } from '@/common/modules/navigations/stores/recent-store';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';
import { RECENT_TYPE } from '@/common/modules/navigations/type';

import { gray, violet } from '@/styles/colors';

import { LANDING_ROUTE } from '@/services/landing/routes/route-constant';
import { PREFERENCE_ROUTE } from '@/services/preference/routes/route-constant';

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

const router = useRouter();

const storeState = reactive({
    isDomainAdmin: computed(() => store.getters['user/isDomainAdmin']),
    workspaceList: computed<WorkspaceModel[]>(() => workspaceStoreGetters.workspaceList),
    selectedWorkspace: computed<WorkspaceModel|undefined>(() => workspaceStoreGetters.currentWorkspace),
    favoriteItems: computed(() => sortBy(favoriteGetters.workspaceItems, 'label')),
});
const state = reactive({
    workspaceMenuList: computed<MenuItem[]>(() => [
        ...filterStarredItems(storeState.favoriteItems),
        ...formatMenuItems(storeState.workspaceList),
    ]),
});

const selectWorkspace = (name: string): void => {
    const workspaceId = name;
    if (!workspaceId || workspaceId === userWorkspaceStore.getters.currentWorkspaceId) return;

    appContextStore.setGlobalGrantLoading(true);
    const reversedMatched = clone(router.currentRoute.matched).reverse();
    const closestRoute = reversedMatched.find((d) => d.meta?.menuId !== undefined);
    const targetMenuId: MenuId = closestRoute?.meta?.menuId || MENU_ID.HOME_DASHBOARD;
    userWorkspaceStore.setCurrentWorkspace(workspaceId);
    router.push({ name: MENU_INFO_MAP[targetMenuId].routeName, params: { workspaceId } });
};
const handleClickButton = (hasNoWorkspace?: string) => {
    appContextStore.enterAdminMode();
    router.push({
        name: makeAdminRouteName(PREFERENCE_ROUTE.WORKSPACES._NAME),
        query: {
            hasNoWorkpspace: hasNoWorkspace,
        },
    });
    Vue.notify({
        group: 'toastTopCenter',
        type: 'info',
        title: i18n.t('COMMON.GNB.ADMIN.SWITCH_ADMIN') as string,
        duration: 2000,
        speed: 1,
    });
};
const formatMenuItems = (menuItems: WorkspaceModel[] = []): MenuItem[] => {
    const result = [
        { type: CONTEXT_MENU_TYPE.header, name: 'workspace_header', label: `${i18n.t('COMMON.GNB.WORKSPACE.WORKSPACES')} (${storeState.workspaceList.length})` },
    ] as MenuItem[];
    menuItems.forEach((d) => {
        result.push({
            ...d,
            type: CONTEXT_MENU_TYPE.item,
            name: d.workspace_id || '',
            label: d.name as string,
        });
    });
    return result.slice(0, PAGE_SIZE);
};
const filterStarredItems = (menuItems: FavoriteItem[] = []): MenuItem[] => {
    if (storeState.favoriteItems.length === 0) return [];
    const result: MenuItem[] = [
        { type: CONTEXT_MENU_TYPE.header, name: 'starred_header', label: i18n.t('COMMON.STARRED') },
    ];
    menuItems.forEach((d) => {
        const item = storeState.workspaceList.find((w) => w.workspace_id === d.itemId);
        if (item) {
            result.push({
                ...item,
                type: CONTEXT_MENU_TYPE.item,
                name: d.itemId || '',
                label: d.label as string,
            });
        }
    });
    return result;
};
const handleClickAllWorkspaceButton = () => {
    router.push({
        name: LANDING_ROUTE._NAME,
    });
};

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
                           :class="{'workspace-dropdown': true, 'is-domain-admin': storeState.isDomainAdmin}"
                           style-type="transparent"
                           :menu="state.workspaceMenuList"
                           hide-header-without-items
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
                <div class="menu-item-wrapper">
                    <div class="label">
                        <workspace-logo-icon :text="item?.label || ''"
                                             :theme="item?.tags?.theme"
                                             size="xs"
                        />
                        <span class="label-text">{{ item.label }}</span>
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
                    <div v-if="storeState.isDomainAdmin"
                         class="workspace-toolbox"
                    >
                        <p-divider />
                        <p-button style-type="substitutive"
                                  size="sm"
                                  class="create-new-button tool"
                                  icon-left="ic_plus_bold"
                                  @click="handleClickButton('true')"
                        >
                            {{ $t("COMMON.GNB.WORKSPACE.CREATE_WORKSPACE") }}
                        </p-button>
                        <p-divider class="tools-divider" />
                        <p-button style-type="tertiary"
                                  size="sm"
                                  class="manage-button tool"
                                  icon-left="ic_settings"
                                  @click="handleClickButton()"
                        >
                            {{ $t("COMMON.GNB.WORKSPACE.MANAGE_WORKSPACE") }}
                        </p-button>
                    </div>
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
                @screen mobile {
                    @apply hidden;
                }
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
            @apply relative flex items-center justify-between text-label-md font-medium;
            margin: 0.875rem 1rem;
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

            .label {
                @apply flex items-center gap-2;
            }
            .label-text {
                @apply truncate;
                max-width: 16.25rem;
            }
        }

        .workspace-toolbox-wrapper {
            @apply absolute flex flex-col bg-white;
            padding: 0.25rem 1rem 0.5rem;
            bottom: 0;
            left: 0;
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

        /* custom design-system component - p-context-menu */
        :deep(.p-context-menu) {
            width: 20rem;
            margin-top: -0.125rem;
            margin-left: 0;
            .menu-container {
                padding-left: 0.5rem;
                padding-right: 0.5rem;
                padding-bottom: 2.75rem;
                max-height: calc(100vh - $top-bar-height - 4.35rem) !important;
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

        &.is-domain-admin {
            .workspace-toolbox-wrapper {
                padding-bottom: 1rem;
            }

            /* custom design-system component - p-context-menu */
            :deep(.p-context-menu) {
                .menu-container {
                    padding-bottom: 8.35rem;
                }
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

            @screen tablet {
                @apply hidden;
            }
        }
        .tablet-selected {
            @apply hidden text-label-lg text-gray-800;
            padding-left: 0.75rem;

            @screen tablet {
                @apply inline-block;
            }
        }
    }
}
</style>
