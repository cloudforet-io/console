<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PFieldTitle, PBoard, PI, PButton,
} from '@spaceone/design-system';
import { BOARD_STYLE_TYPE } from '@spaceone/design-system/src/data-display/board/type';
import type { BoardSet } from '@spaceone/design-system/types/data-display/board/type';
import { sortBy } from 'lodash';

import type { WorkspaceModel } from '@/schema/identity/workspace/model';

import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import type { FavoriteItem } from '@/common/modules/favorites/favorite-button/type';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { gray } from '@/styles/colors';

const PAGE_SIZE = 16;

type WorkspaceBoardSet = BoardSet & WorkspaceModel;

interface Props {
    workspaceList?: WorkspaceModel[];
    favoriteList?: FavoriteItem[];
    isDomainAdmin?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    workspaceList: () => ([]),
    favoriteList: undefined,
    isDomainAdmin: false,
});

const state = reactive({
    isShowAll: false,
    workspaceBoardSets: computed<WorkspaceBoardSet[]>(() => {
        const orderList = sortBy(props.workspaceList, (workspaceItem) => {
            const correspondingAItem = props.favoriteList?.find((favoriteItem) => favoriteItem?.itemId === workspaceItem.workspace_id);
            return correspondingAItem ? props.favoriteList?.indexOf(correspondingAItem) : Infinity;
        });
        const slicedList = state.isShowAll ? orderList : orderList.slice(0, PAGE_SIZE);
        return slicedList.map((d) => ({
            ...d,
            rounded: true,
        }));
    }),
});

const handleClickShowAll = () => {
    state.isShowAll = true;
};
</script>

<template>
    <div class="landing-all-workspaces">
        <div class="title-wrapper">
            <p-field-title :label="$t('LADING.ALL_WORKSPACE')"
                           color="dark"
                           font-weight="bold"
                           size="md"
                           class="title"
            >
                <template #right>
                    <span class="cnt">({{ props.workspaceList.length }})</span>
                </template>
            </p-field-title>
            <p-button v-if="props.isDomainAdmin"
                      style-type="primary"
                      size="md"
                      icon-left="ic_plus_bold"
            >
                {{ $t('LADING.CREATE') }}
            </p-button>
        </div>
        <p-board :board-sets="state.workspaceBoardSets"
                 selectable
                 :style-type="BOARD_STYLE_TYPE.cards"
                 class="workspace-board"
        >
            <template #item-content="{board}">
                <div class="workspace-board-item-wrapper">
                    <workspace-logo-icon :text="board?.name || ''"
                                         :theme="board?.tags?.theme"
                                         size="sm"
                    />
                    <div class="text-wrapper">
                        <p>{{ board?.name }}</p>
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
        <p-button v-if="props.workspaceList.length > PAGE_SIZE && state.workspaceBoardSets.length < props.workspaceList.length"
                  icon-right="ic_chevron-down"
                  style-type="transparent"
                  size="md"
                  class="show-more-button"
                  @click="handleClickShowAll"
        >
            {{ $t('LADING.SHOW_ALL') }}
        </p-button>
    </div>
</template>

<style scoped lang="postcss">
.landing-all-workspaces {
    @apply flex flex-col;
    gap: 1rem;
    .title-wrapper {
        @apply flex items-center justify-between;
        .title {
            .cnt {
                @apply text-label-md;
            }
        }
    }
    .workspace-board {
        @apply grid grid-cols-2 gap-2;
        max-height: 100%;
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
    }
    .show-more-button {
        width: 6.5rem;
        margin: auto;
    }
}
</style>
