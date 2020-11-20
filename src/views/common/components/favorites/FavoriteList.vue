<template>
    <div class="project-favorites" @mouseleave="hoveredItem = null">
        <template v-if="loading" />
        <div v-else-if="items.length === 0" class="empty">
            {{ $t('COMMON.COMPONENTS.FAVORITES.FAVORITE_LIST.NO_ITEM') }}
        </div>
        <template v-else>
            <a v-for="item in displayItems" :key="item.id" class="item"
               :class="{hovered: hoveredItem ? hoveredItem.id === item.id : false}"
               :href="referenceRouter(
                   item.id, {
                       resource_type: item.resourceType,
                   })"
               @click="onClickItem(item, $event)"
               @mouseenter="hoveredItem = item"
               @mouseleave="hoveredItem = null"
            >
                <span class="icon"><slot name="icon" :item="item" /></span>
                <span class="name">{{ item.name }}</span>
                <p-icon-button v-if="hoveredItem && hoveredItem.id === item.id" name="ic_delete"
                               width="1rem" height="1rem"
                               class="delete-btn"
                               @click.prevent.stop="onClickDelete(item)"
                />
            </a>
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
import { FavoriteItem } from '@/store/modules/favorite/type';
import PI from '@/components/atoms/icons/PI.vue';
import PIconButton from '@/components/molecules/buttons/icon-button/PIconButton.vue';
import { FavoriteListProps } from '@/views/common/components/favorites/type';
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
.project-favorites {
    @apply px-3;
}
.empty {
    @apply pt-2 text-gray-300;
    font-size: 1rem;
    line-height: 1.2;
}
.item {
    @apply pl-1 flex items-center;
    height: 2rem;
    border-radius: 2px;
    cursor: pointer;
    &.hovered {
        @apply bg-secondary2 text-secondary;
    }
    .icon {
        @apply flex-shrink-0 flex overflow-hidden;
        width: 1rem;
        height: 1rem;
        border-radius: 3px;
    }
    .name {
        @apply ml-1 flex-grow truncate;
        line-height: 1.5;
        font-size: 0.75rem;
    }
    .delete-btn {
        @apply float-right mr-1;
        max-width: 1.5rem;
        max-height: 1.5rem;
        min-width: 1.5rem;
        min-height: 1.5rem;
    }
}
.toggle-btn {
    @apply mt-3 text-blue-600;
    cursor: pointer;
    right: 1rem;
    bottom: 1rem;
    z-index: 1;
    font-size: 0.75rem;
}
</style>
