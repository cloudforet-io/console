<script lang="ts" setup>
import { PI } from '@spaceone/design-system';
import type { WatchStopHandle } from 'vue';
import {
    computed, reactive, watch,
} from 'vue';
import { useStore } from 'vuex';

import type { FavoriteConfig } from '@/store/modules/favorite/type';
import { FAVORITE_TYPE_TO_STATE_NAME } from '@/store/modules/favorite/type';


interface Props {
    itemId: string
    favoriteType: string
    scale?: string
    readOnly?: boolean
    visibleActiveCaseOnly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    scale: '1',
    readOnly: false,
    visibleActiveCaseOnly: false,
});
const store = useStore();

const state = reactive({
    isLoading: computed(() => store.state.favorite.isLoading[props.favoriteType]),
    hasLoaded: computed(() => Array.isArray(state.favoriteItems)),
    favoriteItems: computed<FavoriteConfig[]|null>(() => {
        const stateName = FAVORITE_TYPE_TO_STATE_NAME[props.favoriteType];
        if (!stateName) return [];
        return store.state.favorite[stateName];
    }),
    favoriteItemMap: computed<Record<string, FavoriteConfig>>(() => {
        const result: Record<string, FavoriteConfig> = {};
        if (Array.isArray(state.favoriteItems)) {
            state.favoriteItems.forEach((d) => {
                result[d.itemId] = d;
            });
        }
        return result;
    }),
    active: computed(() => !!state.favoriteItemMap[props.itemId]),
});

const handleClickFavoriteButton = async (event: MouseEvent) => {
    event.stopPropagation();
    if (props.readOnly) return;
    if (state.favoriteItemMap[props.itemId]) {
        await store.dispatch('favorite/removeItem', {
            itemId: props.itemId,
            itemType: props.favoriteType,
        });
    } else {
        await store.dispatch('favorite/addItem', {
            itemId: props.itemId,
            itemType: props.favoriteType,
        });
    }
};

let stopWatch: WatchStopHandle;
// eslint-disable-next-line prefer-const
stopWatch = watch([() => state.hasLoaded, () => state.isLoading], async ([hasLoaded, isLoading]) => {
    if (hasLoaded) {
        if (stopWatch) stopWatch();
        return;
    }

    if (!isLoading) {
        await store.dispatch('favorite/load', props.favoriteType);
    }
}, { immediate: true });

</script>

<template>
    <p-i
        v-show="(visibleActiveCaseOnly || readOnly) ? state.active : true"
        :name="state.active ? 'ic_favorite-filled': 'ic_favorite'"
        width="1rem"
        height="1rem"
        :scale="scale"
        color="inherit"
        class="favorite-btn"
        :class="{'active': state.active, 'read-only': readOnly}"
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
