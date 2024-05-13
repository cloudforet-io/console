<script setup lang="ts">
import Vue, { computed, reactive } from 'vue';
import type { Location } from 'vue-router';
import { useRouter } from 'vue-router/composables';

import {
    PSelectDropdown, PTooltip, PI, PButton, PDivider, PTextHighlighting, PEmpty,
} from '@spaceone/design-system';
import { CONTEXT_MENU_TYPE } from '@spaceone/design-system/src/inputs/context-menu/type';
import type { SelectDropdownMenuItem } from '@spaceone/design-system/src/inputs/dropdown/select-dropdown/type';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import { clone } from 'lodash';

import type { WorkspaceModel } from '@/schema/identity/workspace/model';
import { store } from '@/store';
import { i18n } from '@/translations';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import type { MenuId } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { gray, violet } from '@/styles/colors';

import { PREFERENCE_ROUTE } from '@/services/preference/routes/route-constant';

interface Props {
    isAdminMode: boolean;
    to: Location;
}

const props = withDefaults(defineProps<Props>(), {
    isAdminMode: false,
});
const appContextStore = useAppContextStore();
const userWorkspaceStore = useUserWorkspaceStore();
const workspaceStoreState = userWorkspaceStore.$state;

const router = useRouter();

const state = reactive({
    visibleDropdown: false,
    symbolImage: computed<string|undefined>(() => store.getters['domain/domainSymbolImage']),
    isDomainAdmin: computed(() => store.getters['user/isDomainAdmin']),
    workspaceList: computed<WorkspaceModel[]>(() => [...workspaceStoreState.getters.workspaceList]),
    selectedWorkspace: computed<WorkspaceModel|undefined>(() => workspaceStoreState.getters.currentWorkspace),
    workspaceMenuList: computed<SelectDropdownMenuItem[]>(() => {
        const menuList: SelectDropdownMenuItem[] = [
            // TODO: will be applied after API completion
            // { type: 'header', name: 'starred_header', label: i18n.t('COMMON.STARRED') } as SelectDropdownMenuItem,
            { type: 'header', name: 'workspace_header', label: `${i18n.t('COMMON.GNB.WORKSPACE.WORKSPACES')} (${state.workspaceList.length})` } as SelectDropdownMenuItem,
        ];
        state.workspaceList.forEach((_workspace) => {
            // TODO: will be applied after API completion
            // if (state.selectedWorkspace?.workspace_id === _workspace.workspace_id) {
            //     menuList.push({
            //         name: _workspace.workspace_id,
            //         label: _workspace.name,
            //         headerName: 'starred_header',
            //         tags: _workspace.tags,
            //     } as SelectDropdownMenuItem);
            // } else {
            //     menuList.push({
            //         name: _workspace.workspace_id,
            //         label: _workspace.name,
            //         headerName: 'workspace_header',
            //         tags: _workspace.tags,
            //     } as SelectDropdownMenuItem);
            // }
            menuList.push({
                name: _workspace.workspace_id,
                label: _workspace.name,
                headerName: 'workspace_header',
                tags: _workspace.tags,
            } as SelectDropdownMenuItem);
            return menuList;
        });
        return [...menuList];
    }),
    searchText: '',
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
    const result = menuItems.length > 0 ? [
        { type: CONTEXT_MENU_TYPE.header, name: 'workspace_header', label: `${i18n.t('COMMON.GNB.WORKSPACE.WORKSPACES')} (${state.workspaceList.length})` },
    ] : [] as MenuItem[];
    menuItems.forEach((d) => {
        result.push({
            ...d,
            type: CONTEXT_MENU_TYPE.item,
            name: d.workspace_id || '',
            label: d.name as string,
        });
    });
    return result;
};
const menuHandler = async (inputText: string) => {
    const _workspaceList = state.workspaceList.filter((w) => w.name.toLowerCase()?.includes(inputText.toLowerCase()));
    return {
        results: formatMenuItems(_workspaceList),
    };
};
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
                           :class="{'workspace-dropdown': true, 'is-domain-admin': state.isDomainAdmin}"
                           style-type="transparent"
                           :handler="menuHandler"
                           :search-text.sync="state.searchText"
                           is-filterable
                           hide-header-without-items
                           show-delete-all-button
                           :selected="state.selectedWorkspace?.workspace_id"
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
                <workspace-logo-icon :text="state.selectedWorkspace?.name || ''"
                                     :theme="state.selectedWorkspace?.tags?.theme"
                />
                <div>
                    <span class="selected-workspace">
                        {{ state.selectedWorkspace?.name }}
                    </span>
                    <span class="tablet-selected">
                        ...
                    </span>
                </div>
            </template>
            <template #menu-header>
                <p-tooltip class="menu-header-selected-workspace"
                           position="bottom"
                           :contents="state.selectedWorkspace?.name || ''"
                >
                    <div class="workspace-wrapper">
                        <workspace-logo-icon :text="state.selectedWorkspace?.name || ''"
                                             :theme="state.selectedWorkspace?.tags?.theme"
                                             size="xs"
                        />
                        <span class="workspace-name">{{ state.selectedWorkspace?.name }}</span>
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
                        <p-text-highlighting class="label-text"
                                             :text="item.label"
                                             :term="state.searchText"
                        />
                    </div>

                    <!--                    TODO: will be applied after API completion-->
                    <!--                    <favorite-button :item-id="item.name"-->
                    <!--                                     :favorite-type="FAVORITE_TYPE.MENU"-->
                    <!--                                     scale="0.875"-->
                    <!--                                     class="favorite-button"-->
                    <!--                    />-->
                </div>
            </template>
            <template v-if="state.isDomainAdmin"
                      #menu-bottom
            >
                <div class="workspace-toolbox-wrapper">
                    <p-divider />
                    <div class="workspace-toolbox">
                        <p-button style-type="substitutive"
                                  size="sm"
                                  class="create-new-button tool"
                                  icon-left="ic_plus_bold"
                                  @click="handleClickButton('true')"
                        >
                            {{ $t("COMMON.GNB.WORKSPACE.CREATE_WORKSPACE") }}
                        </p-button>
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
            <template #no-data-area>
                <div class="no-data-wrapper">
                    <p class="title-wrapper">
                        <span class="title">{{ $t('COMMON.GNB.WORKSPACE.WORKSPACES') }} </span>
                        <span>({{ state.workspaceList.length }})</span>
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
            @apply flex flex-col absolute bg-white;
            padding: 0.5rem 1rem;
            bottom: 0;
            left: 0;
            width: 100%;
            gap: 0.5rem;
            .workspace-toolbox {
                @apply relative flex flex-col;
                gap: 1.25rem;
                &::before {
                    @apply absolute;
                    content: "";
                    top: 50%;
                    left: -1rem;
                    width: calc(100% + 2rem);
                    border-bottom: 3px solid #dddddf;
                }
                .tool {
                    height: 1.5rem;
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

        /* custom design-system component - p-context-menu */
        :deep(.p-context-menu) {
            width: 20rem;
            margin-top: -0.125rem;
            margin-left: 0;
            .menu-container {
                padding-left: 0.5rem;
                padding-right: 0.5rem;
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
        }
        &.is-domain-admin {
            :deep(.p-context-menu) {
                .menu-container {
                    padding-bottom: 5.75rem;
                }
                .bottom-slot-area {
                    padding: 0;
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
