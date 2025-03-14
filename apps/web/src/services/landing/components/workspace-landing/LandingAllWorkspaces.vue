<script setup lang="ts">
import { computed, reactive } from 'vue';

import { partition, sortBy } from 'lodash';

import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';

import type { FavoriteItem } from '@/common/modules/favorites/favorite-button/type';

import LandingWorkspaceBoard from '@/services/landing/components/workspace-landing/landing-group-workspaces/LandingWorkspaceBoard.vue';
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

const state = reactive({
    isShowAll: false,
    workspaceBoardSets: computed<WorkspaceBoardSet[]>(() => {
        const favoriteOrderList = sortBy(props.workspaceList, (workspaceItem) => {
            const correspondingAItem = props.favoriteList?.find((favoriteItem) => favoriteItem?.itemId === workspaceItem.workspace_id);
            return correspondingAItem ? props.favoriteList?.indexOf(correspondingAItem) : Infinity;
        });
        const [active, dormant] = partition(favoriteOrderList, (item) => !item.is_dormant);

        const orderedList = [...active, ...dormant];
        const slicedList = state.isShowAll ? orderedList : orderedList.slice(0, PAGE_SIZE);
        return slicedList.map((d) => ({
            ...d,
            rounded: true,
        }));
    }),
});
</script>

<template>
    <div class="landing-all-workspaces">
        <landing-workspace-board :board-sets="state.workspaceBoardSets"
                                 :board-type="BOARD_TYPE.ALL_WORKSPACE"
                                 :is-domain-admin="props.isDomainAdmin"
        />
    </div>
</template>

<style scoped lang="postcss">
.landing-all-workspaces {
    @apply flex flex-col;
    gap: 1rem;
}
</style>
