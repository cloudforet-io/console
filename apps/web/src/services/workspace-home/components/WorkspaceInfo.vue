<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PButton, PHeading, PI, PIconButton,
} from '@spaceone/design-system';

import type { WorkspaceModel } from '@/schema/identity/workspace/model';
import { store } from '@/store';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { gray } from '@/styles/colors';

const userWorkspaceStore = useUserWorkspaceStore();
const userWorkspaceGetters = userWorkspaceStore.getters;

const storeState = reactive({
    isDomainAdmin: computed<boolean>(() => store.getters['user/isDomainAdmin']),
    hasAdminOrWorkspaceOwnerRole: computed<boolean>(() => store.getters['user/hasAdminOrWorkspaceOwnerRole']),
    currentWorkspace: computed<WorkspaceModel|undefined>(() => userWorkspaceGetters.currentWorkspace),
    workspaceList: computed<WorkspaceModel[]>(() => userWorkspaceGetters.workspaceList),
});
const state = reactive({
    selectedWorkspace: computed<WorkspaceModel>(() => storeState.workspaceList.find((workspace) => workspace.workspace_id === storeState.currentWorkspace?.workspace_id) || {} as WorkspaceModel),
});
</script>

<template>
    <div class="workspace-info">
        <p-heading :title="state.selectedWorkspace.name"
                   class="heading-wrapper"
        >
            <template #title-left-extra>
                <workspace-logo-icon :text="state.selectedWorkspace.name"
                                     :theme="state.selectedWorkspace.tags?.theme"
                                     size="sm"
                />
            </template>
            <template #title-right-extra>
                <span class="title-right-button-wrapper">
                    <favorite-button :item-id="state.selectedWorkspace.workspace_id"
                                     :favorite-type="FAVORITE_TYPE.WORKSPACE"
                                     class="favorite-button"
                                     scale="0.8"
                    />
                    <p-icon-button name="ic_edit-text"
                                   width="1.5rem"
                                   height="1.5rem"
                    />
                    <p-icon-button name="ic_delete"
                                   width="1.5rem"
                                   height="1.5rem"
                                   class="delete-button"
                    />
                </span>
            </template>
            <template #extra>
                <div class="extra-wrapper">
                    <p-button v-if="storeState.hasAdminOrWorkspaceOwnerRole"
                              style-type="tertiary"
                              icon-left="ic_service_user"
                    >
                        {{ $t('HOME.INFO_INVITE_USER') }}
                    </p-button>
                    <p-button v-if="storeState.isDomainAdmin"
                              style-type="tertiary"
                              icon-left="ic_service_app"
                    >
                        {{ $t('HOME.INFO_CREATE_APP') }}
                    </p-button>
                </div>
            </template>
        </p-heading>
        <span class="desc">{{ state.selectedWorkspace.tags?.description }}</span>
        <div class="info-cnt-wrapper">
            <div class="info-cnt">
                <p-i name="ic_service_user"
                     width="0.875rem"
                     height="0.875rem"
                     color="inherit"
                />
                <span>{{ $t('HOME.INFO_USERS') }}</span>
            </div>
            <p-i name="ic_dot"
                 width="0.125rem"
                 height="0.125rem"
                 :color="gray[500]"
                 class="dot"
            />
            <div class="info-cnt">
                <p-i name="ic_service_app"
                     width="0.875rem"
                     height="0.875rem"
                     color="inherit"
                />
                <span>{{ $t('HOME.INFO_APPS') }}</span>
            </div>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.workspace-info {
    @apply flex flex-col;
    padding-top: 1.25rem;
    padding-bottom: 3rem;
    gap: 0.25rem;
    .heading-wrapper {
        margin: 0;
        .title-right-button-wrapper {
            @apply flex items-center;
            .favorite-button {
                margin-right: 0.5rem;
            }
        }
        .extra-wrapper {
            @apply flex;
            gap: 0.5rem;
        }
    }
    .desc {
        @apply text-paragraph-md text-gray-600;
    }
    .info-cnt-wrapper {
        @apply flex items-center;
        margin-top: 0.5rem;
        gap: 0.5rem;
        .info-cnt {
            @apply flex items-center text-label-md;
            gap: 0.125rem;
        }
    }
}
</style>
