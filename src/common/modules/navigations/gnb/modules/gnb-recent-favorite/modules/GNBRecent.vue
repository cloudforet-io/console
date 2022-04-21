<template>
    <div class="gnb-recent">
        <p-data-loader :data="items"
                       :loading="loading"
        >
            <g-n-b-suggestion-list v-if="loading || items.length"
                                   :items="items"
                                   use-favorite
                                   @update:isFocused="$emit('update:isFocused', $event)"
                                   @move-focus-end="$emit('move-focus-end')"
                                   @close="$emit('close')"
                                   @select="handleSelect"
            />
            <template #no-data>
                <div class="no-data">
                    <img class="img" src="@/assets/images/illust_spaceship_3.svg">
                    <p class="text">
                        {{ $t('COMMON.GNB.RECENT.RECENT_HELP_TEXT') }}
                    </p>
                </div>
            </template>
        </p-data-loader>
    </div>
</template>

<script lang="ts">
import { sortBy } from 'lodash';

import { computed, reactive, toRefs } from '@vue/composition-api';

import { PDataLoader } from '@spaceone/design-system';

import GNBSuggestionList from '@/common/modules/navigations/gnb/modules/GNBSuggestionList.vue';

import { SUGGESTION_TYPE, SuggestionItem } from '@/common/modules/navigations/gnb/modules/gnb-search/config';
import { menuRouterMap } from '@/lib/router/menu-router-map';
import { referenceRouter } from '@/lib/reference/referenceRouter';
import { RECENT_TYPE, RecentConfig, RecentItem } from '@/store/modules/recent/type';
import {
    convertCloudServiceConfigToReferenceData,
    convertMenuConfigToReferenceData,
    convertProjectConfigToReferenceData,
    convertProjectGroupConfigToReferenceData,
} from '@/lib/helper/config-data-helper';
import { Menu } from '@/store/modules/display/type';
import { CloudServiceTypeReferenceMap } from '@/store/modules/reference/cloud-service-type/type';
import { ProjectReferenceMap } from '@/store/modules/reference/project/type';
import { ProjectGroupReferenceMap } from '@/store/modules/reference/project-group/type';
import { SpaceRouter } from '@/router';
import { store } from '@/store';


const RECENT_LIMIT = 15;

export default {
    name: 'GNBRecent',
    components: {
        GNBSuggestionList,
        PDataLoader,
    },
    props: {},
    setup(props, { emit }) {
        const storeState = reactive({
            menuItems: computed<Menu[]>(() => store.state.display.menuList),
            projects: computed<ProjectReferenceMap>(() => store.state.reference.project.items),
            projectGroups: computed<ProjectGroupReferenceMap>(() => store.state.reference.projectGroup.items),
            cloudServiceTypes: computed<CloudServiceTypeReferenceMap>(() => store.state.reference.cloudServiceType.items),
            recents: computed<RecentConfig[]>(() => store.state.recent.allItems),
        });
        const state = reactive({
            loading: true,
            items: computed<SuggestionItem[]>(() => sortBy(
                state.recentMenuItems
                    .concat(state.recentCloudServiceItems)
                    .concat(state.recentProjectItems)
                    .concat(state.recentProjectGroupItems),
                recent => recent.updatedAt,
            ).reverse()),
            recentMenuItems: computed<RecentItem[]>(() => convertMenuConfigToReferenceData(
                storeState.recents.filter(d => d.itemType === RECENT_TYPE.MENU),
                storeState.menuItems,
            )),
            recentCloudServiceItems: computed<RecentItem[]>(() => convertCloudServiceConfigToReferenceData(
                storeState.recents.filter(d => d.itemType === RECENT_TYPE.CLOUD_SERVICE),
                storeState.cloudServiceTypes,
            )),
            recentProjectItems: computed<RecentItem[]>(() => convertProjectConfigToReferenceData(
                storeState.recents.filter(d => d.itemType === RECENT_TYPE.PROJECT),
                storeState.projects,
            )),
            recentProjectGroupItems: computed<RecentItem[]>(() => convertProjectGroupConfigToReferenceData(
                storeState.recents.filter(d => d.itemType === RECENT_TYPE.PROJECT_GROUP),
                storeState.projectGroups,
            )),
        });

        const handleSelect = (item: SuggestionItem) => {
            const itemName = item.name as string;
            if (item.itemType === SUGGESTION_TYPE.MENU) {
                const menuRoute = menuRouterMap[itemName];
                if (!menuRoute || SpaceRouter.router.currentRoute.name === menuRoute.name) return;
                SpaceRouter.router.push({ name: menuRoute.name }).catch(() => {});
            } else if (item.itemType === SUGGESTION_TYPE.PROJECT) {
                SpaceRouter.router.push(referenceRouter(itemName, { resource_type: 'identity.Project' })).catch(() => {});
            } else if (item.itemType === SUGGESTION_TYPE.PROJECT_GROUP) {
                SpaceRouter.router.push(referenceRouter(itemName, { resource_type: 'identity.ProjectGroup' })).catch(() => {});
            } else if (item.itemType === SUGGESTION_TYPE.CLOUD_SERVICE) {
                SpaceRouter.router.push(referenceRouter(itemName, { resource_type: 'inventory.CloudServiceType' })).catch(() => {});
            }
            emit('close');
        };

        /* Init */
        (async () => {
            state.loading = true;
            await Promise.allSettled([
                store.dispatch('reference/project/load'),
                store.dispatch('reference/projectGroup/load'),
                store.dispatch('reference/cloudServiceType/load'),
                store.dispatch('recent/load', { limit: RECENT_LIMIT }),
            ]);
            state.loading = false;
        })();

        return {
            ...toRefs(state),
            handleSelect,
        };
    },
};
</script>
<style lang="postcss" scoped>
.gnb-recent {
    padding: 1rem 0;
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
        }
    }
}
</style>
