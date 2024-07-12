<script setup lang="ts">
import { useRouter } from 'vue-router/composables';

import { PBoard, PI } from '@cloudforet/mirinae';
import { BOARD_STYLE_TYPE } from '@cloudforet/mirinae/src/data-display/board/type';


import WorkspaceMemberImage from '@/assets/images/role/img_avatar_workspace-member.png';
import WorkspaceOwnerImage from '@/assets/images/role/img_avatar_workspace-owner.png';
import { ROLE_TYPE } from '@/schema/identity/role/constant';
import type { RoleType } from '@/schema/identity/role/type';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';


import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { gray } from '@/styles/colors';

import { BOARD_TYPE } from '@/services/landing/constants/landing-constants';
import { useLandingPageStore } from '@/services/landing/store/landing-page-store';
import type { WorkspaceBoardSet, BoardType } from '@/services/landing/type/type';
import { WORKSPACE_HOME_ROUTE } from '@/services/workspace-home/routes/route-constant';

interface Props {
    boardSets: WorkspaceBoardSet[],
    boardType?: BoardType,
}

const props = withDefaults(defineProps<Props>(), {
    boardSets: () => ([]),
    boardType: undefined,
});

const landingPageStore = useLandingPageStore();
const userWorkspaceStore = useUserWorkspaceStore();

const router = useRouter();
const roleTypeImageFormatter = (roleType: RoleType): string => {
    switch (roleType) {
    case ROLE_TYPE.WORKSPACE_OWNER:
        return WorkspaceOwnerImage;
    case ROLE_TYPE.WORKSPACE_MEMBER:
        return WorkspaceMemberImage;
    default:
        return '';
    }
};

const handleClickBoardItem = (item: WorkspaceBoardSet) => {
    landingPageStore.setLoading(true);
    userWorkspaceStore.setCurrentWorkspace(item.workspace_id);
    router.replace({ name: WORKSPACE_HOME_ROUTE._NAME, params: { workspaceId: item.workspace_id } });
};
</script>

<template>
    <p-board :board-sets="props.boardSets"
             selectable
             :style-type="BOARD_STYLE_TYPE.cards"
             class="landing-workspace-board"
             @item-click="handleClickBoardItem"
    >
        <template #item-content="{board}">
            <div class="workspace-board-item-wrapper">
                <workspace-logo-icon :text="board?.name || ''"
                                     :theme="board?.tags?.theme"
                                     :size="props.boardType === BOARD_TYPE.ALL_WORKSPACE ? 'sm' : 'md'"
                />
                <div class="text-wrapper">
                    <p class="workspace-name">
                        {{ board?.name }}
                    </p>
                    <div v-if="board?.role_type"
                         class="workspace-info"
                    >
                        <img :src="roleTypeImageFormatter(board?.role_type)"
                             alt="role-type-icon"
                             class="role-type-icon"
                        >
                        <p class="role-type">
                            {{ board?.role_name }}
                        </p>
                    </div>
                </div>
                <div class="toolset-wrapper">
                    <favorite-button :item-id="board?.workspace_id"
                                     :favorite-type="FAVORITE_TYPE.WORKSPACE"
                                     scale="0.8"
                                     class="favorite-button"
                    />
                    <p-i name="ic_chevron-right-thin"
                         width="1.5rem"
                         height="1.5rem"
                         :color="gray[900]"
                    />
                </div>
            </div>
        </template>
    </p-board>
</template>

<style scoped lang="postcss">
.landing-workspace-board {
    @apply grid grid-cols-2 gap-2;
    .workspace-board-item-wrapper {
        @apply flex items-center;
        width: 100%;
        max-width: 19.875rem;
        gap: 0.75rem;
        .text-wrapper {
            @apply flex flex-col text-label-md truncate;
            flex: 1;
            gap: 0.125rem;
            .workspace-info {
                @apply flex items-center;
                gap: 0.25rem;
                .role-type-icon {
                    @apply rounded-full;
                    width: 1rem;
                    height: 1rem;
                }
                .role-type {
                    @apply text-label-sm text-gray-700 truncate;
                    width: 100%;
                }
            }
            .workspace-name {
                @apply truncate;
                width: 100%;
            }
        }
        .toolset-wrapper {
            @apply flex items-center;
            margin-left: auto;
            gap: 0.375rem;
            :deep(.favorite-btn) {
                &:not(.active) {
                    @apply hidden;
                }
            }
        }
        &:hover {
            .toolset-wrapper {
                :deep(.favorite-btn) {
                    &:not(.active) {
                        @apply block;
                    }
                }
            }
        }
    }

    /* custom design-system component - p-board-item */
    :deep(.p-board-item) {
        padding: 0.75rem 1rem;
        width: 22rem;
        min-height: 4.25rem;

        @screen mobile {
            width: 19.5rem;
        }
    }

    @screen mobile {
        @apply flex flex-col;
        gap: 0.5rem;
    }
}
</style>
