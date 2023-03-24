<template>
    <div class="favorites-widget">
        <p class="title">
            <span>{{ $t('COMMON.WIDGETS.FAVORITES_WIDGET.TITLE') }}</span>
            <p-i class="icon"
                 name="ic_favorite"
                 height="1rem"
                 width="1rem"
                 color="inherit"
            />
        </p>
        <div class="list-wrapper">
            <div class="label-wrapper">
                <label v-for="(item, k) in Object.values(items)"
                       :key="k"
                >{{ item.label }}</label>
            </div>
            <div class="item-wrapper">
                <div v-for="(item, k) in Object.values(items)"
                     :key="k"
                     :style="{width}"
                >
                    <div v-if="item.favorites.length === 0"
                         class="no-data"
                    >
                        {{ $t('COMMON.WIDGETS.FAVORITES_WIDGET.NO_DATA') }}
                    </div>
                    <template v-else>
                        <router-link v-for="d in item.favorites"
                                     :key="d.itemId"
                                     :to="referenceRouter(
                                         d.itemId, {
                                             resource_type: getResourceType(d.itemType),
                                         })"
                                     class="item"
                        >
                            {{ d.label }}
                        </router-link>
                    </template>
                </div>
            </div>
        </div>
        <summary v-if="showToggle"
                 class="toggle-btn"
                 @click="handleClickToggle"
        >
            {{ isExpanded ? $t('COMMON.WIDGETS.FAVORITES_WIDGET.TOGGLE_LESS') : $t('COMMON.WIDGETS.FAVORITES_WIDGET.TOGGLE_MORE') }}
            <p-i :name="isExpanded ? 'ic_chevron-up' : 'ic_chevron-down'"
                 height="1rem"
                 width="1rem"
                 color="inherit transparent"
            />
        </summary>
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { PI } from '@spaceone/design-system';

import { store } from '@/store';
import { i18n } from '@/translations';

import type { FavoriteItem, FavoriteType } from '@/store/modules/favorite/type';
import { FAVORITE_TYPE } from '@/store/modules/favorite/type';
import type { CloudServiceTypeReferenceMap } from '@/store/modules/reference/cloud-service-type/type';
import type { ProjectGroupReferenceMap } from '@/store/modules/reference/project-group/type';
import type { ProjectReferenceMap } from '@/store/modules/reference/project/type';

import {
    convertCloudServiceConfigToReferenceData,
    convertProjectConfigToReferenceData, convertProjectGroupConfigToReferenceData,
} from '@/lib/helper/config-data-helper';
import { referenceRouter } from '@/lib/reference/referenceRouter';

type Item = Record<string, {label: TranslateResult; favorites: FavoriteItem[]}>;

const LIMIT_COUNT = 5;
export default {
    name: 'FavoritesWidget',
    components: { PI },
    setup() {
        const state = reactive({
            projects: computed<ProjectReferenceMap>(() => store.getters['reference/projectItems']),
            projectGroups: computed<ProjectGroupReferenceMap>(() => store.getters['reference/projectGroupItems']),
            cloudServiceTypes: computed<CloudServiceTypeReferenceMap>(() => store.getters['reference/cloudServiceTypeItems']),
            favoriteProjects: computed<FavoriteItem[]>(() => {
                const favoriteProjectItems = convertProjectConfigToReferenceData(store.state.favorite.projectItems, state.projects);
                const favoriteProjectGroupItems = convertProjectGroupConfigToReferenceData(store.state.favorite.projectGroupItems, state.projectGroups);
                return [...favoriteProjectGroupItems, ...favoriteProjectItems];
            }),
            favoriteCloudServiceItems: computed<FavoriteItem[]>(() => convertCloudServiceConfigToReferenceData(store.state.favorite.cloudServiceItems, state.cloudServiceTypes)),
            items: computed<Item>(() => ({
                project: {
                    label: i18n.t('COMMON.WIDGETS.FAVORITES_WIDGET.LABEL_PROJECT'),
                    favorites: state.isExpanded ? state.favoriteProjects : state.favoriteProjects.slice(0, LIMIT_COUNT),
                },
                cloudService: {
                    label: i18n.t('COMMON.WIDGETS.FAVORITES_WIDGET.LABEL_CLOUD_SERVICE'),
                    favorites: state.isExpanded ? state.favoriteCloudServiceItems : state.favoriteCloudServiceItems.slice(0, LIMIT_COUNT),
                },
            })),
            width: computed(() => {
                const length = Object.keys(state.items).length;
                return `${length ? 100 / length : 100}%`;
            }),
            isExpanded: false,
            showToggle: computed(() => state.favoriteProjects.length > LIMIT_COUNT || state.favoriteCloudServiceItems.length > LIMIT_COUNT),
        });

        /* Util */
        const getResourceType = (type: FavoriteType) => {
            if (type === FAVORITE_TYPE.CLOUD_SERVICE) return 'inventory.CloudServiceType';
            if (type === FAVORITE_TYPE.PROJECT) return 'identity.Project';
            if (type === FAVORITE_TYPE.PROJECT_GROUP) return 'identity.ProjectGroup';
            return '';
        };

        const handleClickToggle = () => {
            state.isExpanded = !state.isExpanded;
        };

        /* Init */
        (async () => {
            await Promise.allSettled([
                store.dispatch('reference/project/load'),
                store.dispatch('reference/projectGroup/load'),
                store.dispatch('reference/cloudServiceType/load'),
                store.dispatch('favorite/load', FAVORITE_TYPE.PROJECT),
                store.dispatch('favorite/load', FAVORITE_TYPE.PROJECT_GROUP),
                store.dispatch('favorite/load', FAVORITE_TYPE.CLOUD_SERVICE),
            ]);
        })();

        return {
            ...toRefs(state),
            handleClickToggle,
            getResourceType,
            LIMIT_COUNT,
            referenceRouter,
        };
    },
};
</script>

<style lang="postcss" scoped>
.favorites-widget {
    @apply w-full overflow-hidden;
}
.title {
    @apply px-2 mb-2 flex items-center text-gray-800;
    font-size: 1rem;
    font-weight: bold;
    line-height: 1.2;
    .icon {
        @apply text-yellow-500;
        margin-left: 0.375rem;
    }
}
.list-wrapper {
    @apply flex flex-col w-full;
    .label-wrapper {
        @apply flex items-center mb-2;
    }
    .item-wrapper {
        @apply flex;
        .no-data {
            @apply text-gray-400;
            font-size: 0.875rem;
            line-height: 1.5;
            padding: 0 0.5rem;
        }
    }
    label {
        @apply px-2 text-gray-700;
        flex: 1;
        font-size: 0.75rem;
        line-height: 1.2;
        font-weight: bold;
    }
    .item {
        @apply block px-2 text-gray-700 truncate;
        font-size: 0.75rem;
        height: 1.5rem;
        line-height: 1.5rem;
        cursor: pointer;
        &:hover {
            @apply bg-secondary2;
            text-decoration: underline;
        }
    }
}
.toggle-btn {
    @apply ml-2 mt-3 text-blue-700;
    margin-top: 0.625rem;
    text-align: center;
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
