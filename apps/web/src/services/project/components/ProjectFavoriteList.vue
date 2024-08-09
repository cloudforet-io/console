<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import { PI } from '@cloudforet/mirinae';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import { referenceRouter } from '@/lib/reference/referenceRouter';

import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import type { FavoriteItem, FavoriteType } from '@/common/modules/favorites/favorite-button/type';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';

import { PROJECT_ROUTE } from '@/services/project/routes/route-constant';

const LIMIT_COUNT = 5;

interface Props {
    items: FavoriteItem[];
    loading?: boolean;
    beforeRoute?: (item: FavoriteItem, e: MouseEvent) => Promise<void>|void;
}

const props = withDefaults(defineProps<Props>(), {
    loading: false,
    beforeRoute: undefined,
});

const route = useRoute();

const userWorkspaceStore = useUserWorkspaceStore();

const storeState = reactive({
    currentWorkspaceId: computed<string|undefined>(() => userWorkspaceStore.getters.currentWorkspaceId),
});
const state = reactive({
    displayItems: computed<FavoriteItem[]>(() => {
        if (state.isExpanded) return props.items;
        return props.items.slice(0, LIMIT_COUNT);
    }),
    hoveredItem: null as null|FavoriteItem,
    isExpanded: false,
    selectedItem: computed(() => (route.name === PROJECT_ROUTE._NAME ? route.params.projectGroupId : route.params.id)),
});

const getResourceType = (type: FavoriteType) => {
    if (type === FAVORITE_TYPE.PROJECT) return 'identity.Project';
    if (type === FAVORITE_TYPE.PROJECT_GROUP) return 'identity.ProjectGroup';
    return '';
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
        <template v-if="props.loading" />
        <span v-else-if="props.items.length === 0"
              class="no-data"
        >
            {{ $t('COMMON.STARRED_NO_DATA') }}
        </span>
        <template v-else>
            <div v-for="item in state.displayItems"
                 :key="item.itemId"
                 class="item"
                 :class="{
                     hovered: state.hoveredItem ? state.hoveredItem?.itemId === item.itemId : false,
                     clicked: state.selectedItem === item.itemId,
                 }"
                 @click="handleClickItem(item, $event)"
                 @mouseenter="state.hoveredItem = item"
                 @mouseleave="state.hoveredItem = null"
            >
                <router-link :to="referenceRouter(
                                 item.itemId, {
                                     resource_type: getResourceType(item.itemType),
                                     workspace_id: storeState.currentWorkspaceId,
                                 })"
                             class="item-link"
                >
                    <span class="icon"><slot name="icon"
                                             :item="item"
                    /></span>
                    <span class="name">{{ item.label }}</span>
                </router-link>
                <favorite-button v-if="state.hoveredItem && state.hoveredItem?.itemId === item.itemId"
                                 :item-id="item.itemId"
                                 :favorite-type="item.itemType"
                                 scale="0.8"
                                 class="favorite-button"
                />
            </div>
            <summary v-if="props.items.length > LIMIT_COUNT"
                     class="toggle-btn"
                     @click.stop="handleClickToggle"
            >
                {{ state.isExpanded ? $t('COMMON.COMPONENTS.FAVORITES.FAVORITE_LIST.TOGGLE_LESS') : $t('COMMON.COMPONENTS.FAVORITES.FAVORITE_LIST.TOGGLE_MORE') }}
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
    .item {
        @apply flex items-center rounded;
        height: 2rem;
        padding-left: 0.5rem;
        cursor: pointer;
        &.hovered {
            @apply bg-secondary2 text-secondary;
        }
        &.clicked {
            @apply bg-blue-200;
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
    .no-data {
        @apply flex items-start text-gray-500;
        padding-right: 0.5rem;
        padding-left: 0.5rem;
        gap: 0.125rem;
    }
}
</style>
