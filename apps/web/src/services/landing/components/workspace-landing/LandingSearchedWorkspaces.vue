<script setup lang="ts">
import { computed, reactive } from 'vue';

import { partition, sortBy } from 'lodash';

import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';

import { useUserStore } from '@/store/user/user-store';

import { useFavoriteStore } from '@/common/modules/favorites/favorite-button/store/favorite-store';

import LandingWorkspaceBoard from '@/services/landing/components/workspace-landing/landing-group-workspaces/LandingWorkspaceBoard.vue';
import { useUserProfileGetWorkspacesQuery } from '@/services/landing/composables/use-user-profile-get-workspaces-query';
import { BOARD_TYPE } from '@/services/landing/constants/landing-constants';
import type { WorkspaceBoardSet } from '@/services/landing/type/type';

const PAGE_SIZE = 16;

interface Props {
    searchText: string;
}

const props = defineProps<Props>();

const favoriteStore = useFavoriteStore();
const favoriteGetters = favoriteStore.getters;
const userStore = useUserStore();

const state = reactive({
    isShowAll: false,
    workspaceBoardSets: computed<WorkspaceBoardSet[]>(() => {
        const favoriteOrderList = sortBy(searchedWorkspaceList.value, (workspaceItem) => {
            const correspondingAItem = favoriteGetters.workspaceItems?.find((item) => item?.itemId === workspaceItem.workspace_id);
            return correspondingAItem ? favoriteGetters.workspaceItems?.indexOf(correspondingAItem) : Infinity;
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
const isDomainAdmin = computed<boolean>(() => userStore.getters.isDomainAdmin);
const lowercasedSearchText = computed<string>(() => props.searchText.toLowerCase());
const searchedWorkspaceList = computed<WorkspaceModel[]>(() => workspaceList.value?.filter((item) => item.name.toLowerCase()?.includes(lowercasedSearchText.value)) || []);

/* Query */
const { data: workspaceList } = useUserProfileGetWorkspacesQuery();
</script>

<template>
    <div class="landing-searched-workspaces">
        <landing-workspace-board :board-sets="state.workspaceBoardSets"
                                 :board-type="BOARD_TYPE.ALL_WORKSPACE"
                                 :is-domain-admin="isDomainAdmin"
        />
    </div>
</template>

<style scoped lang="postcss">
.landing-searched-workspaces {
    @apply flex flex-col;
    gap: 1rem;
}
</style>
