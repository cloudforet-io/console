<template>
    <p-i v-show="readOnly ? active : true"
         :name="active ? 'ic_favorite--added': 'ic_favorite'"
         width="1rem" height="1rem"
         :scale="scale"
         color="inherit"
         class="favorite-btn"
         :class="{active, 'read-only': readOnly}"
         @click.prevent="handleClickFavoriteButton"
    />
</template>

<script lang="ts">
import {
    computed, reactive, toRefs,
} from '@vue/composition-api';

import { PI } from '@spaceone/design-system';
import { FavoriteButtonProps } from '@/common/modules/favorites/favorite-button/type';
import { store } from '@/store';
import { FavoriteConfig } from '@/store/modules/favorite/type';

export default {
    name: 'FavoriteButton',
    components: { PI },
    props: {
        favoriteItems: {
            type: Array,
            default: () => ([]),
        },
        itemId: {
            type: String,
            required: true,
        },
        favoriteType: {
            type: String,
            required: true,
        },
        scale: {
            type: String,
            default: '1',
        },
        readOnly: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: FavoriteButtonProps) {
        const state = reactive({
            favoriteItemMap: computed<Record<string, FavoriteConfig>>(() => {
                const result: Record<string, FavoriteConfig> = {};
                props.favoriteItems.forEach((d) => {
                    result[d.itemId] = d;
                });
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
                    favoriteType: props.favoriteType,
                });
            } else {
                await store.dispatch('favorite/addItem', {
                    itemId: props.itemId,
                    favoriteType: props.favoriteType,
                });
            }
        };
        return {
            ...toRefs(state),
            handleClickFavoriteButton,
        };
    },
};
</script>

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
