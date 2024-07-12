<script setup lang="ts">
import { computed, reactive } from 'vue';

import { sortBy } from 'lodash';

import {
    PFieldTitle, PButton,
} from '@cloudforet/mirinae';

import type { WorkspaceModel } from '@/schema/identity/workspace/model';

import type { FavoriteItem } from '@/common/modules/favorites/favorite-button/type';

import LandingWorkspaceBoard from '@/services/landing/components/LandingWorkspaceBoard.vue';
import { BOARD_TYPE } from '@/services/landing/constants/landing-constants';
import type { WorkspaceBoardSet } from '@/services/landing/type/type';

const PAGE_SIZE = 16;

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

const emit = defineEmits<{(e: 'create'): void}>();

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
                      @click="emit('create')"
            >
                {{ $t('LADING.CREATE') }}
            </p-button>
        </div>
        <landing-workspace-board :board-sets="state.workspaceBoardSets"
                                 :board-type="BOARD_TYPE.ALL_WORKSPACE"
        />
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
    .show-more-button {
        width: 6.5rem;
        margin: auto;
    }
}
</style>
