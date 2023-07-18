<script lang="ts" setup>
import { PI, PIconButton } from '@spaceone/design-system';
import {
    computed, reactive,
} from 'vue';
import { useI18n } from 'vue-i18n';

import type { FavoriteItem, FavoriteType } from '@/store/modules/favorite/type';
import { FAVORITE_TYPE } from '@/store/modules/favorite/type';

import { referenceRouter } from '@/lib/reference/referenceRouter';

const LIMIT_COUNT = 5;
interface Props {
    items: FavoriteItem[]
    loading?: boolean
    beforeRoute?: (item: FavoriteItem, e: MouseEvent) => Promise<void>|void
}

const props = defineProps<Props>();
const emit = defineEmits<{(e: 'delete', value: FavoriteItem): void}>();
const { t } = useI18n();

const state = reactive({
    displayItems: computed<FavoriteItem[]>(() => {
        if (state.isExpanded) return props.items;
        return props.items.slice(0, LIMIT_COUNT);
    }),
    hoveredItem: null as null|FavoriteItem,
    isExpanded: false,
});

const getResourceType = (type: FavoriteType) => {
    if (type === FAVORITE_TYPE.CLOUD_SERVICE) return 'inventory.CloudService';
    if (type === FAVORITE_TYPE.PROJECT) return 'identity.Project';
    if (type === FAVORITE_TYPE.PROJECT_GROUP) return 'identity.ProjectGroup';
    return '';
};

const handleClickDelete = (item: FavoriteItem) => {
    emit('delete', item);
};

const handleClickToggle = () => {
    state.isExpanded = !state.isExpanded;
};

const handleClickItem = async (item, e) => {
    if (props.beforeRoute) {
        const res = props.beforeRoute(item, e);
        if (res) await res;
    }
};

</script>

<template>
    <div class="favorite-list"
         @mouseleave="state.hoveredItem = null"
    >
        <template v-if="loading" />
        <i18n-t v-else-if="items.length === 0"
                class="empty"
                keypath="COMMON.COMPONENTS.FAVORITES.FAVORITE_LIST.NO_ITEM"
                tag="p"
        >
            <template #icon>
                <p-i name="ic_favorite-filled"
                     width="0.875rem"
                     height="0.875rem"
                     color="inherit"
                     class="favorite-btn"
                />
            </template>
        </i18n-t>
        <template v-else>
            <div v-for="item in state.displayItems"
                 :key="item.itemId"
                 class="item"
                 :class="{hovered: state.hoveredItem ? state.hoveredItem.itemId === item.itemId : false}"
                 @click="handleClickItem(item, $event)"
                 @mouseenter="state.hoveredItem = item"
                 @mouseleave="state.hoveredItem = null"
            >
                <router-link :to="referenceRouter(
                                 item.itemId, {
                                     resource_type: getResourceType(item.itemType),
                                 })"
                             class="item-link"
                >
                    <span class="icon"><slot name="icon"
                                             :item="item"
                    /></span>
                    <span class="name">{{ item.label }}</span>
                </router-link>
                <p-icon-button v-if="state.hoveredItem && state.hoveredItem.itemId === item.itemId"
                               name="ic_close"
                               size="sm"
                               class="delete-btn"
                               @click.prevent.stop="handleClickDelete(item)"
                />
            </div>
            <summary v-if="items.length > LIMIT_COUNT"
                     class="toggle-btn"
                     @click.stop="handleClickToggle"
            >
                {{ state.isExpanded ? t('COMMON.COMPONENTS.FAVORITES.FAVORITE_LIST.TOGGLE_LESS') : t('COMMON.COMPONENTS.FAVORITES.FAVORITE_LIST.TOGGLE_MORE') }}
                <p-i :name="state.isExpanded ? 'ic_chevron-up' : 'ic_chevron-down'"
                     height="1rem"
                     width="1rem"
                     color="inherit transparent"
                />
            </summary>
        </template>
    </div>
</template>

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
    @apply mt-3 text-blue-700;
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
