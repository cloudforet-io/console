<template>
    <div class="gnb-favorite">
        <p-data-loader :data="[...projects, ...cloudServiceTypes]"
                       :loading="loading"
        >
            <div v-if="projects.length" class="content-wrapper">
                <div class="title-wrapper">
                    <span class="text">PROJECT</span>
                    <p-anchor v-if="projects.length > 5"
                              size="sm"
                              text="Show all"
                              highlight
                              icon-name="ic_arrow_right"
                              @click="handleClickShowAll"
                    />
                </div>
                <g-n-b-favorite-item-list :favorite-items="projects" />
            </div>
            <p-divider v-if="projects.length" />
            <div v-if="cloudServiceTypes.length" class="content-wrapper">
                <div class="title-wrapper">
                    <span class="text">CLOUD SERVICE</span>
                    <p-anchor v-if="cloudServiceTypes.length > 5"
                              size="sm"
                              text="Show all"
                              highlight
                              icon-name="ic_arrow_right"
                              @click="handleClickShowAll"
                    />
                </div>
                <g-n-b-favorite-item-list :favorite-items="cloudServiceTypes" />
            </div>
            <template #no-data>
                <div class="no-data">
                    <img class="img" src="@/assets/images/illust_star.svg">
                    <p class="text">
                        Add frequently visited pages to your favorites
                        Favorite buttons can be found in following menus
                    </p>
                    <div class="button-wrapper">
                        <p-button style-type="gray-border"
                                  size="sm"
                                  @click="handleClickMenuButton('project')"
                        >
                            Project
                        </p-button>
                        <p-button style-type="gray-border"
                                  size="sm"
                                  @click="handleClickMenuButton('cloudService')"
                        >
                            Cloud Service
                        </p-button>
                    </div>
                </div>
            </template>
        </p-data-loader>
    </div>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from '@vue/composition-api';

import {
    PButton, PDataLoader, PDivider, PAnchor,
} from '@spaceone/design-system';

import { FavoriteItem } from '@/store/modules/favorite/type';
import { PROJECT_ROUTE } from '@/services/project/route-config';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';
import { store } from '@/store';
import { SpaceRouter } from '@/router';
import GNBFavoriteItemList
    from '@/common/modules/navigations/gnb/modules/gnb-recent-favorite/modules/GNBFavoriteItemList.vue';


export default {
    name: 'GNBFavorite',
    components: {
        GNBFavoriteItemList,
        PButton,
        PDataLoader,
        PDivider,
        PAnchor,
    },
    props: {},
    setup() {
        const state = reactive({
            loading: false,
            projects: computed<FavoriteItem[]>(() => ([
                ...store.getters['favorite/projectGroupItems'],
                ...store.getters['favorite/projectItems'],
            ])),
            cloudServiceTypes: computed<FavoriteItem[]>(() => store.getters['favorite/cloudServiceTypeItems']),
            showAll: false,
        });

        /* Event */
        const handleClickShowAll = () => {
            state.showAll = true;
        };
        const handleClickMenuButton = (menu) => {
            if (menu === 'project') {
                SpaceRouter.router.replace({
                    name: PROJECT_ROUTE._NAME,
                });
            } else if (menu === 'cloudService') {
                SpaceRouter.router.replace({
                    name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE._NAME,
                });
            }
        };

        /* Init */
        (async () => {
            await Promise.allSettled([
                store.dispatch('reference/project/load'),
                store.dispatch('reference/projectGroup/load'),
                store.dispatch('reference/cloudServiceType/load'),
                store.dispatch('favorite/load', 'identity.Project'),
                store.dispatch('favorite/load', 'identity.ProjectGroup'),
                store.dispatch('favorite/load', 'inventory.CloudServiceType'),
            ]);
        })();

        return {
            ...toRefs(state),
            handleClickShowAll,
            handleClickMenuButton,
        };
    },
};
</script>
<style lang="postcss" scoped>
.gnb-favorite {
    padding: 1rem 1.25rem;
    .content-wrapper {
        .title-wrapper {
            @apply text-gray-500;
            display: flex;
            justify-content: space-between;
            font-size: 0.75rem;
            padding-bottom: 0.5rem;
            .text {
                font-weight: 700;
            }
        }
    }
    .p-divider {
        margin: 1.25rem 0;
    }
    .no-data {
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
