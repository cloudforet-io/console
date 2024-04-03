<script setup lang="ts">
import { useRouter } from 'vue-router/composables';

import { PBoard, PI } from '@spaceone/design-system';
import { BOARD_STYLE_TYPE } from '@spaceone/design-system/src/data-display/board/type';


import { ROLE_TYPE } from '@/schema/identity/role/constant';
import type { RoleType } from '@/schema/identity/role/type';
import { i18n } from '@/translations';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';


import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { gray } from '@/styles/colors';

import { HOME_DASHBOARD_ROUTE } from '@/services/home-dashboard/routes/route-constant';
import { BOARD_TYPE } from '@/services/landing/constants/landing-constants';
import { useLandingPageStore } from '@/services/landing/store/landing-page-store';
import type { WorkspaceBoardSet, BoardType } from '@/services/landing/type/type';

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
const roleFormatter = (roleType: RoleType): string => {
    switch (roleType) {
    case ROLE_TYPE.WORKSPACE_OWNER:
        return i18n.t('LADING.ROLE_TYPE_OWNER') as string;
    case ROLE_TYPE.WORKSPACE_MEMBER:
        return i18n.t('LADING.ROLE_TYPE_MEMBER') as string;
    default:
        return '';
    }
};

const handleClickBoardItem = (item: WorkspaceBoardSet) => {
    landingPageStore.setLoading(true);
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
                <workspace-logo-icon :text="board?.name || ''"
                                     :theme="board?.tags?.theme"
                                     :size="props.boardType === BOARD_TYPE.ALL_WORKSPACE ? 'sm' : 'md'"
                />
                <div class="text-wrapper">
                    <p class="workspace-name">
                        {{ board?.name }}
                    </p>
                    <p class="role-type">
                        {{ roleFormatter(board?.role_type) }}
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
        max-width: 19.875rem;
        gap: 0.75rem;
        .text-wrapper {
            @apply flex flex-col text-label-md truncate;
            flex: 1;
            gap: 0.125rem;
            .workspace-name {
                @apply truncate;
                width: 100%;
            }
            .role-type {
                @apply text-gray-700 truncate;
                width: 100%;
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
