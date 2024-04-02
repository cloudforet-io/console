<script setup lang="ts">
import { useRouter } from 'vue-router/composables';

import { PBoard, PI } from '@spaceone/design-system';
import { BOARD_STYLE_TYPE } from '@spaceone/design-system/src/data-display/board/type';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import type { ReferenceData } from '@/lib/helper/config-data-helper';


import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { gray } from '@/styles/colors';

import { HOME_DASHBOARD_ROUTE } from '@/services/home-dashboard/routes/route-constant';
import { BOARD_TYPE } from '@/services/landing/constants/landing-constants';
import type { WorkspaceBoardSet, BoardType } from '@/services/landing/type/type';

interface Props {
    boardSets: ReferenceData[] | WorkspaceBoardSet[]
    boardType?: BoardType,
}

const props = withDefaults(defineProps<Props>(), {
    boardSets: () => ([]),
    boardType: undefined,
});

const userWorkspaceStore = useUserWorkspaceStore();

const router = useRouter();

const handleClickBoardItem = (item: WorkspaceBoardSet) => {
    userWorkspaceStore.setCurrentWorkspace(item.workspace_id);
    router.replace({ name: HOME_DASHBOARD_ROUTE._NAME, params: { workspaceId: item.workspace_id } });
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
                <workspace-logo-icon :text="board?.label || ''"
                                     :theme="board?.tags?.theme"
                                     :size="props.boardType === BOARD_TYPE.ALL_WORKSPACE ? 'sm' : 'md'"
                />
                <div class="text-wrapper">
                    <p>{{ board?.label }}</p>
                    <p class="role-type">
                        role_type
                    </p>
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
        gap: 0.75rem;
        .text-wrapper {
            @apply flex flex-col text-label-md;
            gap: 0.125rem;
            .role-type {
                @apply text-gray-700;
            }
        }
        .toolset-wrapper {
            @apply flex items-center;
            margin-left: auto;
            gap: 0.25rem;
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
    }
}
</style>
