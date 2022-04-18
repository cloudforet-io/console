<template>
    <div class="gnb-favorite-item-list">
        <div v-for="item in favoriteItems" :key="`favorite-${item.itemId}`" class="item">
            <div class="text">
                <template v-if="item.favoriteType === 'CLOUD_SERVICE'">
                    <p-lazy-img :src="item.icon || ''"
                                width="1rem" height="1rem"
                                class="ic-lazy-img"
                    />
                    {{ item.name }}
                </template>
                <template v-else>
                    <p-i :name="item.favoriteType === 'PROJECT' ? 'ic_tree_project' : 'ic_tree_project-group'"
                         width="1rem" height="1rem"
                         class="icon"
                    />
                    {{ item.label }}
                </template>
            </div>
            <favorite-button :item-id="item.itemId"
                             :favorite-type="item.favoriteType"
                             :favorite-items="favoriteItems"
                             scale="0.65"
            />
        </div>
    </div>
</template>

<script lang="ts">
import {
    PI, PLazyImg,
} from '@spaceone/design-system';
import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';


export default {
    name: 'GNBFavoriteItemList',
    components: {
        FavoriteButton,
        PI,
        PLazyImg,
    },
    props: {
        favoriteItems: {
            type: Array,
            default: () => ([]),
        },
    },
};
</script>
<style lang="postcss" scoped>
.gnb-favorite-item-list {
    .item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.875rem;
        line-height: 1.5;
        padding: 0.25rem;
        &:hover {
            @apply bg-secondary-2;
            cursor: pointer;
        }

        .text {
            @apply truncate;
            width: 90%;
        }
        .icon {
            &:hover {
                cursor: pointer;
            }
        }
    }
}
</style>
