<template>
    <div class="favorite-list"
         @mouseleave="hoveredItem = null"
    >
        <template v-if="loading" />
        <span v-else-if="items.length === 0"
              class="no-data"
        >
            <p-i class="menu-icon"
                 name="ic_star-filled"
                 height="1rem"
                 width="1rem"
                 :color="yellow[500]"
            />
            {{ $t('COMMON.STARRED_NO_DATA') }}
        </span>
        <template v-else>
            <div v-for="item in displayItems"
                 :key="item.itemId"
                 class="item"
                 :class="{hovered: hoveredItem ? hoveredItem?.itemId === item.itemId : false}"
                 @click="handleClickItem(item, $event)"
                 @mouseenter="hoveredItem = item"
                 @mouseleave="hoveredItem = null"
            >
                <router-link :to="referenceRouter(
                                 item.itemId, {
                                     resource_type: getResourceType(item.itemType),
                                     workspace_id: currentWorkspaceId,
                                 })"
                             class="item-link"
                >
                    <span class="icon"><slot name="icon"
                                             :item="item"
                    /></span>
                    <span class="name">{{ item.label }}</span>
                </router-link>
                <favorite-button v-if="hoveredItem && hoveredItem?.itemId === item.itemId"
                                 :item-id="item.itemId"
                                 :favorite-type="item.itemType"
                                 scale="0.8"
                                 class="favorite-button"
                />
            </div>
            <summary v-if="items.length > LIMIT_COUNT"
                     class="toggle-btn"
                     @click.stop="handleClickToggle"
            >
                {{ isExpanded ? $t('COMMON.COMPONENTS.FAVORITES.FAVORITE_LIST.TOGGLE_LESS') : $t('COMMON.COMPONENTS.FAVORITES.FAVORITE_LIST.TOGGLE_MORE') }}
                <p-i :name="isExpanded ? 'ic_chevron-up' : 'ic_chevron-down'"
                     height="1rem"
                     width="1rem"
                     color="inherit transparent"
                />
            </summary>
        </template>
    </div>
</template>

<script lang="ts">
import {
    computed, getCurrentInstance, reactive, toRefs,
} from 'vue';
import type { Vue } from 'vue/types/vue';

import { PI } from '@spaceone/design-system';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import { referenceRouter } from '@/lib/reference/referenceRouter';

import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import type { FavoriteItem, FavoriteType } from '@/common/modules/favorites/favorite-button/type';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';

import { yellow } from '@/styles/colors';

const LIMIT_COUNT = 5;
export default {
    name: 'FavoriteList',
    components: { FavoriteButton, PI },
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
    setup(props) {
        const vm = getCurrentInstance()?.proxy as Vue;
        const userWorkspaceStore = useUserWorkspaceStore();
        const state = reactive({
            currentWorkspaceId: computed(() => userWorkspaceStore.getters.currentWorkspaceId),
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
            vm.$emit('delete', item);
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

        return {
            ...toRefs(state),
            handleClickDelete,
            handleClickToggle,
            handleClickItem,
            getResourceType,
            referenceRouter,
            LIMIT_COUNT,
            yellow,
        };
    },
};
</script>

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
        @apply flex items-center text-gray-500;
        padding-right: 0.5rem;
        padding-left: 0.5rem;
        gap: 0.125rem;
    }
}
</style>
