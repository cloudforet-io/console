<script setup lang="ts">
import Vue, { computed, reactive } from 'vue';
import type { Location } from 'vue-router';
import { useRouter } from 'vue-router/composables';

import {
    PSelectDropdown, PTooltip, PI,
} from '@spaceone/design-system';
import type { SelectDropdownMenuItem } from '@spaceone/design-system/src/inputs/dropdown/select-dropdown/type';
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

import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import WorkspaceLogoIcon from '@/common/modules/navigations/gnb/modules/gnb-header/WorkspaceLogoIcon.vue';

import { violet } from '@/styles/colors';

import { ADMINISTRATION_ROUTE } from '@/services/administration/routes/route-constant';

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
            { type: 'header', name: 'current_workspace_header', label: i18n.t('COMMON.GNB.WORKSPACE.CURRENT_WORKSPACE') } as SelectDropdownMenuItem,
            { type: 'header', name: 'switch_to_header', label: i18n.t('COMMON.GNB.WORKSPACE.SWITCH_TO') } as SelectDropdownMenuItem,
        ];
        state.workspaceList.forEach((_workspace) => {
            if (state.selectedWorkspace?.workspace_id === _workspace.workspace_id) {
                menuList.push({
                    name: _workspace.workspace_id,
                    label: _workspace.name,
                    icon: 'ic_check',
                    iconColor: violet[500],
                    headerName: 'current_workspace_header',
                } as SelectDropdownMenuItem);
            } else {
                menuList.push({
                    name: _workspace.workspace_id,
                    label: _workspace.name,
                    headerName: 'switch_to_header',
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
    if (workspaceId === userWorkspaceStore.getters.currentWorkspaceId) return;

    appContextStore.setGlobalGrantLoading(true);
    if (name === 'all_workspaces') {
        appContextStore.enterAdminMode();
        router.push(getProperRouteLocation({ name: ADMINISTRATION_ROUTE.PREFERENCE.WORKSPACES._NAME }));
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
    const closestMenuId: MenuId = closestRoute?.meta?.menuId || MENU_ID.HOME_DASHBOARD;
    if (workspaceId) {
        if (workspaceId === state.selectedWorkspace?.workspace_id) return;
        userWorkspaceStore.setCurrentWorkspace(workspaceId);
        router.push({ name: MENU_INFO_MAP[closestMenuId].routeName, params: { workspaceId } });
    }
};

const handleClickAllWorkspace = () => {
    router.push({ name: makeAdminRouteName(ADMINISTRATION_ROUTE.PREFERENCE.WORKSPACES._NAME) });
};
</script>

<template>
    <div :class="{'gnb-header': true, 'admin-mode': props.isAdminMode}"
         data-gtm="gtm-gnb-logo"
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
                           is-filterable
                           :search-text.sync="state.searchText"
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
            <template v-if="state.isDomainAdmin"
                      #menu-bottom
            >
                <div class="all-workspace"
                     @click="handleClickAllWorkspace"
                >
                    <p-i name="ic_list-card"
                         height="1rem"
                         width="1rem"
                         class="verified-icon"
                    />
                    <span>{{ $t('COMMON.GNB.WORKSPACE.ALL_WORKSPACES') }}</span>
                </div>
            </template>
            <!--            <template #menu-item&#45;&#45;format="{ item }">-->
            <!--                <span class="menu-wrapper">-->
            <!--                    <span v-if="item.name === state.selectedWorkspace?.workspace_id"-->
            <!--                          class="selected-icon"-->
            <!--                    >-->
            <!--                        <p-i name="ic_check"-->
            <!--                             width="1rem"-->
            <!--                             height="1rem"-->
            <!--                             color="inherit"-->
            <!--                        />-->
            <!--                    </span>-->
            <!--                    <p-text-highlighting class="selected-text"-->
            <!--                                         :text="item.label"-->
            <!--                                         :term="state.searchText"-->
            <!--                                         style-type="secondary"-->
            <!--                    />-->
            <!--                </span>-->
            <!--                &lt;!&ndash;                {{ item.label }}&ndash;&gt;-->
            <!--            </template>-->
        </p-select-dropdown>
    </div>
</template>

<style scoped lang="postcss">
.gnb-header {
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

        /* custom design-system component - p-context-menu */
        :deep(.p-context-menu) {
            min-width: 12rem !important;
            .all-workspace {
                @apply flex items-center absolute bg-white text-label-md border-gray-200 border-t cursor-pointer;
                bottom: 0;
                left: 0;
                width: 100%;
                padding-top: 0.5rem;
                padding-bottom: 0.5rem;
                padding-left: 0.5rem;
                gap: 0.25rem;
            }
        }
        &.is-domain-admin {
            :deep(.p-context-menu) {
                .menu-container {
                    padding-bottom: 2.25rem;
                }
                .bottom-slot-area {
                    padding: 0;
                }
            }
        }

        .selected-workspace {
            @apply text-label-lg text-gray-800 inline-block font-bold;
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
        .menu-wrapper {
            @apply inline-flex items-center gap-1;
            max-height: 2.25rem;
            max-width: 19rem;

            .selected-icon {
                @apply inline-block text-violet-500;
                width: 1rem;
            }

            .selected-text {
                text-overflow: ellipsis;
                overflow: hidden;

                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
            }
        }
    }
}
</style>
