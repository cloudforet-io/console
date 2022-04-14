<template>
    <div class="gnb-favorite">
        <p-data-loader :data="items"
                       :loading="loading"
        >
            <div v-if="projects.length" class="content-wrapper">
                <div class="title-wrapper">
                    <span class="text">PROJECT</span>
                    <p-anchor size="sm"
                              text="Show all"
                              highlight
                              icon-name="ic_arrow_right"
                              @click="handleClickShowAll"
                    />
                </div>
                <div>
                    <p v-for="project in projects" :key="`favorite-${project.resourceId}`">
                        {{ project.name }}
                    </p>
                </div>
            </div>
            <p-divider v-if="projects.length" />
            <div v-if="cloudServiceTypes.length" class="content-wrapper">
                <div class="title-wrapper">
                    <span class="text">CLOUD SERVICE</span>
                    <p-anchor size="sm"
                              text="Show all"
                              highlight
                              icon-name="ic_arrow_right"
                              @click="handleClickShowAll"
                    />
                </div>
                <div>
                    <p v-for="cloudServiceType in cloudServiceTypes" :key="`favorite-${cloudServiceType.resourceId}`">
                        {{ cloudServiceType.name }}
                    </p>
                </div>
            </div>
            <template #no-data>
                <div v-show="!items.length" class="no-data-wrapper">
                    <img class="img" src="@/assets/images/illust_star.svg">
                    <p class="text">
                        Add frequently visited pages to your favorites
                        Favorite buttons can be found in following menus
                    </p>
                    <div class="button-wrapper">
                        <p-button style-type="gray-border"
                                  size="sm"
                        >
                            Project
                        </p-button>
                        <p-button style-type="gray-border"
                                  size="sm"
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
import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';

import { FavoriteItem } from '@/store/modules/favorite/type';
import { store } from '@/store';


const getConvertedMenuItem = (items: FavoriteItem[]): MenuItem[] => items.map(d => ({
    name: d.resourceId,
    label: d.name,
    type: 'item',
}));

export default {
    name: 'GNBFavorite',
    components: {
        PButton,
        PDataLoader,
        PDivider,
        PAnchor,
    },
    props: {},
    setup() {
        const state = reactive({
            loading: false,
            items: computed<MenuItem[]>(() => {
                const results: MenuItem[] = [];

                if (state.projects.length) {
                    results.push({ name: 'title', label: 'PROJECT', type: 'header' });
                    results.push(...getConvertedMenuItem(state.projects));
                }
                if (state.cloudServiceTypes.length) {
                    if (results.length !== 0) results.push({ type: 'divider' });
                    results.push({ name: 'title', label: 'CLOUD SERVICE', type: 'header' });
                    results.push(...getConvertedMenuItem(state.cloudServiceTypes));
                }
                return results;
            }),
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
        };
    },
};
</script>
<style lang="postcss" scoped>
.gnb-favorite {
    .content-wrapper {
        .title-wrapper {
            @apply text-gray-500;
            display: flex;
            justify-content: space-between;
            font-size: 0.75rem;
            .text {
                font-weight: 700;
            }
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
