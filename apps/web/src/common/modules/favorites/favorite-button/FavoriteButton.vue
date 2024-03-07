<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';

import { PI } from '@spaceone/design-system';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import { useFavoriteStore } from '@/common/modules/favorites/favorite-button/store/favorite-store';
import type { FavoriteType } from '@/common/modules/favorites/favorite-button/type';

interface Props {
    itemId: string;
    favoriteType: FavoriteType;
    scale?: string;
    readOnly?: boolean;
    visibleActiveCaseOnly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    scale: '1',
    readOnly: false,
    visibleActiveCaseOnly: false,
});

const userWorkspaceStore = useUserWorkspaceStore();
const appContextStore = useAppContextStore();
const favoriteStore = useFavoriteStore();
const favoriteStoreGetters = favoriteStore.getters;

const storeState = reactive({
    favoriteMenuList: computed(() => favoriteStoreGetters.favoriteMenuList),
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    currentWorkspaceId: computed(() => userWorkspaceStore.getters.currentWorkspaceId as string),
});
const state = reactive({
    active: computed(() => {
        const favoriteItem = storeState.favoriteMenuList.findIndex((d) => (d.itemId === props.itemId
            && (d.itemType === props.favoriteType)));
        return favoriteItem > -1;
    }),
});

const handleClickFavoriteButton = async (event: MouseEvent) => {
    if (storeState.isAdminMode) return;
    event.stopPropagation();
    if (props.readOnly) return;
    if (state.active) {
        await favoriteStore.deleteFavorite({
            itemType: props.favoriteType,
            workspaceId: storeState.currentWorkspaceId,
            itemId: props.itemId,
        });
    } else {
        await favoriteStore.createFavorite({
            itemType: props.favoriteType,
            workspaceId: storeState.currentWorkspaceId,
            itemId: props.itemId,
        });
    }
};
</script>

<template>
    <p-i
        v-if="!storeState.isAdminMode"
        v-show="(props.visibleActiveCaseOnly || props.readOnly) ? state.active : true"
        :name="state.active ? 'ic_favorite-filled': 'ic_favorite'"
        width="1rem"
        height="1rem"
        :scale="props.scale"
        color="inherit"
        class="favorite-btn"
        :class="{active: state.active, 'read-only': props.readOnly}"
        @click.prevent="handleClickFavoriteButton"
    />
</template>

<style lang="postcss" scoped>
.favorite-btn {
    @apply text-gray-300;
    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    &:not(.read-only) {
        cursor: pointer;
        &:hover {
            transform: scale(1.5);
            &:not(.active) {
                @apply text-gray-300;
            }
        }
    }
    &.active {
        @apply text-yellow-500;
    }
}
</style>
