<template>
    <div class="favorite-list" @mouseleave="hoveredItem = null">
        <template v-if="loading" />
        <i18n v-else-if="items.length === 0" class="empty" path="COMMON.COMPONENTS.FAVORITES.FAVORITE_LIST.NO_ITEM"
              tag="p"
        >
            <template #icon>
                <p-i name="ic_bookmark"
                     width="0.875rem" height="0.875rem"
                     color="inherit"
                     class="favorite-btn"
                />
            </template>
        </i18n>
        <template v-else>
            <div v-for="item in displayItems" :key="item.id" class="item"
                 :class="{hovered: hoveredItem ? hoveredItem.id === item.id : false}"
                 @click="onClickItem(item, $event)"
                 @mouseenter="hoveredItem = item"
                 @mouseleave="hoveredItem = null"
            >
                <router-link :to="referenceRouter(
                                 item.id, {
                                     resource_type: item.resourceType,
                                 })"
                             class="item-link"
                >
                    <span class="icon"><slot name="icon" :item="item" /></span>
                    <span class="name">{{ item.name }}</span>
                </router-link>
                <p-icon-button v-if="hoveredItem && hoveredItem.id === item.id" name="ic_delete"
                               size="sm"
                               class="delete-btn"
                               @click.prevent.stop="onClickDelete(item)"
                />
            </div>
            <summary v-if="items.length > LIMIT_COUNT" class="toggle-btn" @click.stop="onClickToggle">
                {{ isExpanded ? $t('COMMON.COMPONENTS.FAVORITES.FAVORITE_LIST.TOGGLE_LESS') : $t('COMMON.COMPONENTS.FAVORITES.FAVORITE_LIST.TOGGLE_MORE') }}
                <p-i :name="isExpanded ? 'ic_arrow_top' : 'ic_arrow_bottom'"
                     height="1rem" width="1rem" color="inherit transparent"
                />
            </summary>
        </template>
    </div>
</template>

<script lang="ts">
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';

import { PI, PIconButton } from '@spaceone/design-system';

import { FavoriteItem } from '@/store/modules/favorite/type';
import { FavoriteListProps } from '@/common/modules/favorites/favorite-list/type';
import { referenceRouter } from '@/lib/reference/referenceRouter';

const LIMIT_COUNT = 5;
export default {
    name: 'FavoriteList',
    components: { PI, PIconButton },
    props: {
        items: {
            type: Array,
            required: true,
        },
        loading: {
            type: Boolean,
            default: false,
        },
        beforeRoute: {
            type: Function,
            default: undefined,
        },
    },
    setup(props: FavoriteListProps) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            displayItems: computed(() => {
                if (state.isExpanded) return props.items;
                return props.items.slice(0, LIMIT_COUNT);
            }),
            hoveredItem: null as null|FavoriteItem,
            isExpanded: false,
        });

        const onClickDelete = (item: FavoriteItem) => {
            vm.$emit('delete', item);
        };

        const onClickToggle = () => {
            state.isExpanded = !state.isExpanded;
        };

        const onClickItem = async (item, e) => {
            if (props.beforeRoute) {
                const res = props.beforeRoute(item, e);
                if (res) await res;
            }
        };


        return {
            ...toRefs(state),
            onClickDelete,
            onClickToggle,
            onClickItem,
            referenceRouter,
            LIMIT_COUNT,
        };
    },
};
</script>

<style lang="postcss" scoped>
.favorite-list {
    @apply px-3;
}
.empty {
    @apply pt-2 text-gray-400;
    font-size: 0.875rem;
    line-height: 1.2;
    white-space: break-spaces;
    .favorite-btn {
        @apply text-yellow-400;
        vertical-align: top;
    }
}
.item {
    @apply pl-1 flex items-center rounded;
    height: 2rem;
    cursor: pointer;
    &.hovered {
        @apply bg-secondary2 text-secondary;
    }
    .item-link {
        @apply flex flex-grow items-center;
        line-height: 1.5;
        max-width: calc(100% - 1.75rem);
    }
    .icon {
        @apply flex-shrink-0 flex overflow-hidden rounded-sm;
        width: 1rem;
        height: 1rem;
    }
    .name {
        @apply ml-1 flex-grow truncate;
        font-size: 0.875rem;
    }
    .delete-btn {
        @apply float-right mr-1;
    }
}
.toggle-btn {
    @apply mt-3 text-blue-600;
    cursor: pointer;
    right: 1rem;
    bottom: 1rem;
    z-index: 1;
    font-size: 0.75rem;
    &:hover {
        text-decoration: underline;
    }
}
</style>
