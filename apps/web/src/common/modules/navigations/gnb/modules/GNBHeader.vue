<script setup lang="ts">
import { computed, reactive } from 'vue';
import type { Location } from 'vue-router';
import { useRouter } from 'vue-router/composables';

import {
    PDivider, PSelectDropdown, PTooltip,
} from '@spaceone/design-system';
import type { SelectDropdownMenuItem } from '@spaceone/design-system/src/inputs/dropdown/select-dropdown/type';
import { clone } from 'lodash';

import type { WorkspaceModel } from '@/schema/identity/workspace/model';
import { store } from '@/store';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import type { MenuId } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import { violet } from '@/styles/colors';

interface Props {
    isAdminMode: boolean;
    to: Location;
}

const props = withDefaults(defineProps<Props>(), {
    isAdminMode: false,
});
const userWorkspaceStore = useUserWorkspaceStore();
const workspaceStoreState = userWorkspaceStore.$state;
const router = useRouter();

const state = reactive({
    symbolImage: computed<string|undefined>(() => store.getters['domain/domainSymbolImage']),
    workspaceList: computed<WorkspaceModel[]>(() => [...workspaceStoreState.getters.workspaceList]),
    selectedWorkspace: computed<WorkspaceModel|undefined>(() => workspaceStoreState.getters.currentWorkspace),
    workspaceMenuList: computed<SelectDropdownMenuItem[]>(() => {
        const workspaceList = state.workspaceList.map((_workspace) => {
            if (state.selectedWorkspace.workspace_id === _workspace.workspace_id) {
                return {
                    name: _workspace.workspace_id,
                    label: _workspace.name,
                    icon: 'ic_check',
                    iconColor: violet[500],
                };
            }
            return {
                name: _workspace.workspace_id,
                label: _workspace.name,
            };
        });
        console.debug('workspaceMenuList', workspaceList);
        return [
            ...workspaceList,
        ];
    }),
    searchText: '',
});

const selectWorkspace = (workspaceId: string): void => {
    const reversedMatched = clone(router.currentRoute.matched).reverse();
    const closestRoute = reversedMatched.find((d) => d.meta?.menuId !== undefined);
    const closestMenuId: MenuId = closestRoute?.meta?.menuId || MENU_ID.HOME_DASHBOARD;
    if (workspaceId) {
        if (workspaceId === state.selectedWorkspace?.workspace_id) return;
        userWorkspaceStore.setCurrentWorkspace(workspaceId);
        router.push({ name: MENU_INFO_MAP[closestMenuId].routeName, params: { workspaceId } });
    }
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
            <span v-if="props.isAdminMode"
                  class="admin-title"
            >
                Admin
            </span>
            <div v-else
                 class="logo-wrapper"
            >
                <img v-if="state.symbolImage"
                     class="logo-character"
                     :src="state.symbolImage"
                >
                <img v-else
                     class="logo-character"
                     src="/images/logos/spaceone-default-logo.svg"
                >
            </div>
        </component>
        <p-divider v-if="!props.isAdminMode"
                   class="logo-divider"
                   vertical
        />
        <p-select-dropdown v-if="!props.isAdminMode"
                           class="workspace-dropdown"
                           style-type="transparent"
                           is-filterable
                           :search-text.sync="state.searchText"
                           :menu="state.workspaceMenuList"
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

        .admin-title {
            @apply text-label-xl text-violet-100 w-full;
        }
        .logo-wrapper {
            width: 2rem;
            height: 2rem;
            .logo-character {
                display: inline-block;
                width: 2rem;
                height: 2rem;
            }
        }
    }

    .logo-divider {
        margin: 0 0.75rem;
        height: 2rem;
    }
    .workspace-dropdown {
        @apply inline-flex;

        @screen tablet {
            width: 2.875rem;
        }

        /* custom design-system component - p-context-menu */
        :deep(.p-context-menu) {
            min-width: 12rem !important;
        }

        .selected-workspace {
            @apply text-label-lg text-gray-800 inline-block font-bold;
            max-width: 8.4375rem;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            vertical-align: bottom;

            @screen tablet {
                @apply hidden;
            }

            @screen mobile {
                @apply inline-block;
            }
        }
        .tablet-selected {
            @apply hidden text-label-lg text-gray-800;

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
