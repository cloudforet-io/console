<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';

import { PI } from '@spaceone/design-system';

import type { CostQuerySetModel } from '@/schema/cost-analysis/cost-query-set/model';
import { store } from '@/store';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useDashboardStore } from '@/store/dashboard/dashboard-store';
import type { CloudServiceTypeReferenceMap } from '@/store/modules/reference/cloud-service-type/type';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CostDataSourceReferenceMap } from '@/store/reference/cost-data-source-reference-store';
import type { ProjectGroupReferenceMap } from '@/store/reference/project-group-reference-store';
import type { ProjectReferenceMap } from '@/store/reference/project-reference-store';

import type { ConfigData } from '@/lib/helper/config-data-helper';
import {
    convertCloudServiceConfigToReferenceData,
    convertCostAnalysisConfigToReferenceData,
    convertDashboardConfigToReferenceData, convertMenuConfigToReferenceData,
    convertProjectConfigToReferenceData, convertProjectGroupConfigToReferenceData,
} from '@/lib/helper/config-data-helper';

import { useFavoriteStore } from '@/common/modules/favorites/favorite-button/store/favorite-store';
import type { FavoriteType } from '@/common/modules/favorites/favorite-button/type';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import { useGnbStore } from '@/common/modules/navigations/stores/gnb-store';

interface Props {
    itemId: string;
    favoriteType: FavoriteType;
    scale?: string;
    readOnly?: boolean;
    visibleActiveCaseOnly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    scale: '1',
    readOnly: false,
    visibleActiveCaseOnly: false,
});

const allReferenceStore = useAllReferenceStore();
const userWorkspaceStore = useUserWorkspaceStore();
const appContextStore = useAppContextStore();
const favoriteStore = useFavoriteStore();
const favoriteStoreGetters = favoriteStore.getters;
const dashboardStore = useDashboardStore();
const dashboardGetters = dashboardStore.getters;
const gnbStore = useGnbStore();
const gnbStoreGetters = gnbStore.getters;

const storeState = reactive({
    favoriteMenuList: computed(() => favoriteStoreGetters.favoriteMenuList),
    costDataSource: computed<CostDataSourceReferenceMap>(() => allReferenceStore.getters.costDataSource),
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    currentWorkspaceId: computed(() => userWorkspaceStore.getters.currentWorkspaceId as string),
    projects: computed<ProjectReferenceMap>(() => allReferenceStore.getters.project),
    projectGroups: computed<ProjectGroupReferenceMap>(() => allReferenceStore.getters.projectGroup),
    cloudServiceTypes: computed<CloudServiceTypeReferenceMap>(() => store.getters['reference/cloudServiceTypeItems']),
    costQuerySets: computed<CostQuerySetModel[]>(() => gnbStoreGetters.costQuerySets),
});
const state = reactive({
    active: computed(() => {
        const favoriteItem = storeState.favoriteMenuList.findIndex((d) => (d.itemId === props.itemId
            && (d.itemType === props.favoriteType)));
        return favoriteItem > -1;
    }),
});

const handleClickFavoriteButton = async (event: MouseEvent) => {
    if (storeState.isAdminMode) return;
    event.stopPropagation();
    if (props.readOnly) return;
    if (state.active) {
        await favoriteStore.deleteFavorite({
            itemType: props.favoriteType,
            workspaceId: storeState.currentWorkspaceId,
            itemId: props.itemId,
        });
    } else {
        const params = {
            itemType: props.favoriteType,
            workspaceId: storeState.currentWorkspaceId,
            itemId: props.itemId,
        };
        await favoriteStore.createFavorite(convertFavoriteToReferenceData(params as ConfigData));
    }
};
const convertFavoriteToReferenceData = (favoriteConfig: ConfigData) => {
    const { itemType } = favoriteConfig;
    if (itemType === FAVORITE_TYPE.DASHBOARD) {
        return convertDashboardConfigToReferenceData([favoriteConfig], dashboardGetters.allItems)[0];
    }
    if (itemType === FAVORITE_TYPE.PROJECT) {
        return convertProjectConfigToReferenceData([favoriteConfig], storeState.projects)[0];
    }
    if (itemType === FAVORITE_TYPE.PROJECT_GROUP) {
        return convertProjectGroupConfigToReferenceData([favoriteConfig], storeState.projectGroups)[0];
    }
    if (itemType === FAVORITE_TYPE.CLOUD_SERVICE) {
        return convertCloudServiceConfigToReferenceData([favoriteConfig], storeState.cloudServiceTypes)[0];
    }
    if (itemType === FAVORITE_TYPE.COST_ANALYSIS) {
        return convertCostAnalysisConfigToReferenceData([favoriteConfig], storeState.costQuerySets, storeState.costDataSource)[0];
    }
    return convertMenuConfigToReferenceData([favoriteConfig], store.getters['display/allMenuList'])[0];
};
</script>

<template>
    <p-i
        v-if="!storeState.isAdminMode"
        v-show="(props.visibleActiveCaseOnly || props.readOnly) ? state.active : true"
        :name="state.active ? 'ic_favorite-filled': 'ic_favorite'"
        width="1rem"
        height="1rem"
        :scale="props.scale"
        color="inherit"
        class="favorite-btn"
        :class="{active: state.active, 'read-only': props.readOnly}"
        @click.prevent="handleClickFavoriteButton"
    />
</template>

<style lang="postcss" scoped>
.favorite-btn {
    @apply text-gray-300;
    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    &:not(.read-only) {
        cursor: pointer;
        &:hover {
            transform: scale(1.5);
            &:not(.active) {
                @apply text-gray-300;
            }
        }
    }
    &.active {
        @apply text-yellow-500;
    }
}
</style>
