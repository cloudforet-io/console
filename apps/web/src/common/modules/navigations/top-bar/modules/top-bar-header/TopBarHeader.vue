<script setup lang="ts">
import Vue, { computed, reactive } from 'vue';
import type { Location } from 'vue-router';
import { useRouter } from 'vue-router/composables';

import {
    PSelectDropdown, PTooltip, PI, PButton, PDivider,
} from '@spaceone/design-system';
import type { SelectDropdownMenuItem } from '@spaceone/design-system/src/inputs/dropdown/select-dropdown/type';
import { clone } from 'lodash';

import type { WorkspaceModel } from '@/schema/identity/workspace/model';
import { store } from '@/store';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { FAVORITE_TYPE } from '@/store/modules/favorite/type';

import type { MenuId } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { violet } from '@/styles/colors';

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
const { getProperRouteLocation } = useProperRouteLocation();

const state = reactive({
    symbolImage: computed<string|undefined>(() => store.getters['domain/domainSymbolImage']),
    isDomainAdmin: computed(() => store.getters['user/isDomainAdmin']),
    workspaceList: computed<WorkspaceModel[]>(() => [...workspaceStoreState.getters.workspaceList]),
    selectedWorkspace: computed<WorkspaceModel|undefined>(() => workspaceStoreState.getters.currentWorkspace),
    workspaceMenuList: computed<SelectDropdownMenuItem[]>(() => {
        const menuList: SelectDropdownMenuItem[] = [
            { type: 'header', name: 'starred_header', label: i18n.t('COMMON.STARRED') } as SelectDropdownMenuItem,
            { type: 'header', name: 'workspace_header', label: i18n.t('COMMON.GNB.WORKSPACE.WORKSPACES') } as SelectDropdownMenuItem,
        ];
        state.workspaceList.forEach((_workspace) => {
            if (state.selectedWorkspace?.workspace_id === _workspace.workspace_id) {
                menuList.push({
                    name: _workspace.workspace_id,
                    label: _workspace.name,
                    headerName: 'starred_header',
                    tags: _workspace.tags,
                } as SelectDropdownMenuItem);
            } else {
                menuList.push({
                    name: _workspace.workspace_id,
                    label: _workspace.name,
                    headerName: 'workspace_header',
                    tags: _workspace.tags,
                } as SelectDropdownMenuItem);
            }
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
    if (name === 'all_workspaces') {
        appContextStore.enterAdminMode();
        router.push(getProperRouteLocation({ name: PREFERENCE_ROUTE.WORKSPACES._NAME }));
        Vue.notify({
            group: 'toastTopCenter',
            type: 'info',
            title: i18n.t('COMMON.GNB.ADMIN.SWITCH_ADMIN') as string,
            duration: 2000,
            speed: 1,
        });
        return;
    }
    const reversedMatched = clone(router.currentRoute.matched).reverse();
    const closestRoute = reversedMatched.find((d) => d.meta?.menuId !== undefined);
    const targetMenuId: MenuId = closestRoute?.meta?.menuId || MENU_ID.HOME_DASHBOARD;
    userWorkspaceStore.setCurrentWorkspace(workspaceId);
    router.push({ name: MENU_INFO_MAP[targetMenuId].routeName, params: { workspaceId } });
};
</script>

<template>
    <div :class="{'top-bar-header': true, 'admin-mode': props.isAdminMode}"
         data-gtm="gtm-top-bar-logo"
    >
        <component :is="props.to ? 'router-link' : 'div'"
                   class="title-wrapper"
                   :to="props.to"
        >
            <div v-if="props.isAdminMode"
                 class="admin-header"
            >
                <div class="admin-icon">
                    <p-i name="ic_admin-icon"
                         width="2rem"
                         height="2rem"
                    />
                </div>
                <span class="admin-title">
                    Admin <span class="omitable-text">Center</span>
                </span>
            </div>
            <workspace-logo-icon v-else
                                 :text="state.selectedWorkspace?.name || ''"
                                 :theme="state.selectedWorkspace?.tags?.theme"
            />
        </component>
        <p-select-dropdown v-if="!props.isAdminMode"
                           :class="{'workspace-dropdown': true, 'is-domain-admin': state.isDomainAdmin}"
                           style-type="transparent"
                           :menu="state.workspaceMenuList"
                           hide-header-without-items
                           :selected="state.selectedWorkspace?.workspace_id"
                           @select="selectWorkspace"
        >
            <template #dropdown-button>
                <p-tooltip position="bottom"
                           :contents="state.selectedWorkspace?.name ?? ''"
                >
                    <span class="selected-workspace">
                        {{ state.selectedWorkspace?.name }}
                    </span>
                    <span class="tablet-selected">
                        ...
                    </span>
                </p-tooltip>
            </template>
            <template #menu-header>
                <div class="menu-header-selected-workspace">
                    <div class="workspace-wrapper">
                        <workspace-logo-icon :text="state.selectedWorkspace?.name || ''"
                                             :theme="state.selectedWorkspace?.tags?.theme"
                                             size="xs"
                        />
                        <span>{{ state.selectedWorkspace?.name }}</span>
                    </div>
                    <p-i name="ic_check"
                         :color="violet[600]"
                         width="1rem"
                         height="1rem"
                    />
                </div>
            </template>
            <template #menu-item--format="{item}">
                <div class="menu-item-wrapper">
                    <div class="label">
                        <workspace-logo-icon :text="item?.label || ''"
                                             :theme="item?.tags?.theme"
                                             size="xs"
                        />
                        <span>{{ item.label }}</span>
                    </div>
                    <favorite-button :item-id="item.name"
                                     :favorite-type="FAVORITE_TYPE.MENU"
                                     scale="0.875"
                                     class="favorite-button"
                    />
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
                        >
                            {{ $t("COMMON.GNB.WORKSPACE.CREATE_WORKSPACE") }}
                        </p-button>
                        <p-button style-type="tertiary"
                                  size="sm"
                                  class="manage-button tool"
                                  icon-left="ic_settings"
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
    max-width: 16.25rem;
    width: 16.25rem;
    padding: 0.625rem 1rem 0.625rem 1.25rem;
    box-shadow: 0.1875rem 0 0.1875rem 0 rgba(81, 83, 100, 0.15);

    &.admin-mode {
        box-shadow: 0.1875rem 0 0.25rem 0 rgba(255, 255, 255, 0.3);

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

    .title-wrapper {
        @apply inline-block;

        .admin-header {
            @apply flex items-center;
            gap: 0.75rem;

            .admin-icon {
                width: 2rem;
                height: 2rem;
            }

            .admin-title {
                @apply text-label-xl text-violet-100 w-full;

                .omitable-text {
                    @screen tablet {
                        @apply hidden;
                    }

                    @screen mobile {
                        @apply inline-block;
                    }
                }
            }

            @screen tablet {
                gap: 0.5rem;
            }
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
            border-bottom: 3px solid #dddddf;
            .workspace-wrapper {
                @apply flex items-center;
                gap: 0.75rem;
            }
        }

        .menu-item-wrapper {
            @apply flex justify-between;

            .label {
                @apply flex items-center gap-1;
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

        /* custom design-system component - p-context-menu */
        :deep(.p-context-menu) {
            min-width: 20rem !important;
            margin-left: -2rem;
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
            max-width: 9.1875rem;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            vertical-align: bottom;
            padding-left: 0.75rem;

            @screen tablet {
                @apply hidden;
            }

            @screen mobile {
                @apply inline-block;
            }
        }
        .tablet-selected {
            @apply hidden text-label-lg text-gray-800;
            padding-left: 0.75rem;

            @screen tablet {
                @apply inline-block;
            }

            @screen mobile {
                @apply hidden;
            }
        }
    }
}
</style>
