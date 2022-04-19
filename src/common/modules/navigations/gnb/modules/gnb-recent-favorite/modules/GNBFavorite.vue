<template>
    <div class="gnb-favorite">
        <g-n-b-suggestion-list v-if="loading || items.length"
                               :items="showAll ? showAllItems : items"
                               :loading="loading"
                               @update:isFocused="$emit('update:isFocused', $event)"
                               @move-focus-end="$emit('move-focus-end')"
                               @close="$emit('close')"
                               @select="handleSelect"
        >
            <template #header-title="{ item }">
                <template v-if="!showAll">
                    <div class="context-header">
                        {{ item.label }}
                        <div v-if="getItemLength(item.itemType) > FAVORITE_LIMIT"
                             class="show-all-button"
                             @click="handleClickShowAll(item.itemType)"
                        >
                            <span class="text">Show all</span>
                            <p-i name="ic_arrow_right" width="1rem" height="1rem"
                                 color="inherit"
                            />
                        </div>
                    </div>
                </template>
                <template v-else>
                    <div class="all-items-header">
                        <p-icon-button name="ic_back" size="sm"
                                       @click="handleGoBack"
                        />
                        <span class="title-text">{{ item.label }}</span>
                    </div>
                </template>
            </template>
        </g-n-b-suggestion-list>
        <div v-else class="no-data-wrapper">
            <img class="img" src="@/assets/images/illust_star.svg">
            <p class="text">
                Add frequently visited pages to your favorites
                Favorite buttons can be found in following menus
            </p>
            <div class="button-wrapper">
                <p-button style-type="gray-border"
                          size="sm"
                          @click="handleClickMenuButton(FAVORITE_TYPE.PROJECT)"
                >
                    Project
                </p-button>
                <p-button style-type="gray-border"
                          size="sm"
                          @click="handleClickMenuButton(FAVORITE_TYPE.CLOUD_SERVICE_TYPE)"
                >
                    Cloud Service
                </p-button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from '@vue/composition-api';

import {
    PButton, PI, PIconButton,
} from '@spaceone/design-system';

import GNBSuggestionList from '@/common/modules/navigations/gnb/modules/GNBSuggestionList.vue';

import { PROJECT_ROUTE } from '@/services/project/route-config';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';
import { FAVORITE_TYPE, FavoriteItem } from '@/store/modules/favorite/type';
import { SUGGESTION_TYPE, SuggestionItem } from '@/common/modules/navigations/gnb/modules/gnb-search/config';
import { SpaceRouter } from '@/router';
import { store } from '@/store';


const FAVORITE_LIMIT = 5;

export default {
    name: 'GNBFavorite',
    components: {
        GNBSuggestionList,
        PButton,
        PI,
        PIconButton,
    },
    props: {},
    setup() {
        const state = reactive({
            loading: true,
            items: computed<SuggestionItem[]>(() => {
                const results: SuggestionItem[] = [];
                if (state.menuList.length) {
                    results.push({
                        name: 'title', label: 'MENU', type: 'header', itemType: SUGGESTION_TYPE.MENU,
                    });
                    results.push(...state.menuList.slice(0, FAVORITE_LIMIT) as SuggestionItem[]);
                }
                if (state.projects.length) {
                    if (results.length !== 0) results.push({ type: 'divider' });
                    results.push({
                        name: 'title', label: 'PROJECT', type: 'header', itemType: SUGGESTION_TYPE.PROJECT,
                    });
                    results.push(...state.projects.slice(0, FAVORITE_LIMIT) as SuggestionItem[]);
                }
                if (state.cloudServiceTypes.length) {
                    if (results.length !== 0) results.push({ type: 'divider' });
                    results.push({
                        name: 'title', label: 'CLOUD SERVICE', type: 'header', itemType: SUGGESTION_TYPE.CLOUD_SERVICE,
                    });
                    results.push(...state.cloudServiceTypes.slice(0, FAVORITE_LIMIT) as SuggestionItem[]);
                }
                return results;
            }),
            showAllItems: computed<SuggestionItem[]>(() => {
                let items: SuggestionItem[] = [];
                let label = '';
                if (state.showAllType === SUGGESTION_TYPE.MENU) {
                    items = state.menuList;
                    label = 'All Menu';
                }
                if (state.showAllType === SUGGESTION_TYPE.PROJECT) {
                    items = state.projects;
                    label = 'All Projects';
                }
                if (state.showAllType === SUGGESTION_TYPE.CLOUD_SERVICE) {
                    items = state.cloudServiceTypes;
                    label = 'All Cloud Services';
                }
                return [
                    {
                        name: 'title', type: 'header', label, itemType: state.showAllType,
                    },
                    ...items,
                ];
            }),
            menuList: computed<FavoriteItem[]>(() => store.getters['favorite/menuItems']),
            projects: computed<FavoriteItem[]>(() => ([
                ...store.getters['favorite/projectGroupItems'],
                ...store.getters['favorite/projectItems'],
            ])),
            cloudServiceTypes: computed<FavoriteItem[]>(() => store.getters['favorite/cloudServiceTypeItems']),
            showAll: false,
            showAllType: undefined as undefined|SUGGESTION_TYPE,
        });

        /* Util */
        const getItemLength = (type: SUGGESTION_TYPE): number => {
            if (type === SUGGESTION_TYPE.MENU) return state.menuList.length;
            if (type === SUGGESTION_TYPE.PROJECT) return state.projects.length;
            if (type === SUGGESTION_TYPE.CLOUD_SERVICE) return state.cloudServiceTypes.length;
            return 0;
        };

        /* Event */
        const handleClickShowAll = (type: SUGGESTION_TYPE) => {
            state.showAll = true;
            state.showAllType = type;
        };
        const handleClickMenuButton = (type: SUGGESTION_TYPE) => {
            if (type === SUGGESTION_TYPE.PROJECT) {
                SpaceRouter.router.replace({
                    name: PROJECT_ROUTE._NAME,
                });
            } else if (type === SUGGESTION_TYPE.CLOUD_SERVICE) {
                SpaceRouter.router.replace({
                    name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE._NAME,
                });
            }
        };
        const handleGoBack = () => {
            state.showAll = false;
            state.showAllType = undefined;
        };
        const handleSelect = () => {
            console.log('select!');
        };
        const handleShowAll = (type) => {
            state.showAll = true;
            state.showAllType = type;
        };

        /* Init */
        (async () => {
            state.loading = true;
            await Promise.allSettled([
                store.dispatch('reference/project/load'),
                store.dispatch('reference/projectGroup/load'),
                store.dispatch('reference/cloudServiceType/load'),
                store.dispatch('favorite/load', FAVORITE_TYPE.MENU),
                store.dispatch('favorite/load', FAVORITE_TYPE.PROJECT),
                store.dispatch('favorite/load', FAVORITE_TYPE.PROJECT_GROUP),
                store.dispatch('favorite/load', FAVORITE_TYPE.CLOUD_SERVICE),
            ]);
            state.loading = false;
        })();

        return {
            ...toRefs(state),
            FAVORITE_TYPE,
            FAVORITE_LIMIT,
            handleClickShowAll,
            handleClickMenuButton,
            handleGoBack,
            handleSelect,
            handleShowAll,
            getItemLength,
        };
    },
};
</script>
<style lang="postcss" scoped>
.gnb-favorite {
    padding: 1rem 0;
    .gnb-search-suggestion-list::v-deep {
        .context-header {
            display: flex;
            justify-content: space-between;
            .show-all-button {
                @apply text-blue-700;
                font-size: 0.75rem;
                cursor: pointer;
                .text {
                    font-weight: normal;
                }
                &:hover {
                    .text {
                        text-decoration: underline;
                    }
                }
            }
        }
        .all-items-header {
            display: flex;
            align-items: center;
            font-size: 0.875rem;
            font-weight: 700;
            padding-bottom: 0.5rem;
        }
    }
    .no-data-wrapper {
        text-align: center;
        padding: 3rem 3.25rem;
        .img {
            margin: auto;
        }
        .text {
            @apply text-gray-400;
            font-size: 0.875rem;
            line-height: 1.5;
            padding-top: 1.5rem;
        }
        .button-wrapper {
            padding-top: 1rem;
        }
    }
}
</style>
