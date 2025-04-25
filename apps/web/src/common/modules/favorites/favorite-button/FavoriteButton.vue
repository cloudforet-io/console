<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import { PI } from '@cloudforet/mirinae';

import type { CostQuerySetModel } from '@/api-clients/cost-analysis/cost-query-set/schema/model';
import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';
import type { MetricExampleModel } from '@/schema/inventory/metric-example/model';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CloudServiceTypeReferenceMap } from '@/store/reference/cloud-service-type-reference-store';
import type { CostDataSourceReferenceMap } from '@/store/reference/cost-data-source-reference-store';
import type { MetricReferenceMap } from '@/store/reference/metric-reference-store';
import type { ProjectGroupReferenceMap } from '@/store/reference/project-group-reference-store';
import type { ProjectReferenceMap } from '@/store/reference/project-reference-store';
import type { ServiceReferenceMap } from '@/store/reference/service-reference-store';

import type { ReferenceData } from '@/lib/helper/config-data-helper';
import {
    convertCloudServiceConfigToReferenceData,
    convertCostAnalysisConfigToReferenceData,
    convertDashboardConfigToReferenceData,
    convertMenuConfigToReferenceData,
    convertMetricConfigToReferenceData,
    convertMetricExampleConfigToReferenceData,
    convertProjectConfigToReferenceData,
    convertProjectGroupConfigToReferenceData,
    convertWorkspaceConfigToReferenceData,
    convertServiceConfigToReferenceData,
} from '@/lib/helper/config-data-helper';
import { useAllMenuList } from '@/lib/menu/use-all-menu-list';

import { useGlobalDashboardQuery } from '@/common/composables/global-dashboard/use-global-dashboard-query';
import { useFavoriteStore } from '@/common/modules/favorites/favorite-button/store/favorite-store';
import type { FavoriteType, FavoriteConfig } from '@/common/modules/favorites/favorite-button/type';
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

const route = useRoute();
const router = useRouter();

const allReferenceStore = useAllReferenceStore();
const userWorkspaceStore = useUserWorkspaceStore();
const workspaceStoreGetters = userWorkspaceStore.getters;
const appContextStore = useAppContextStore();
const favoriteStore = useFavoriteStore();
const favoriteStoreGetters = favoriteStore.getters;
const gnbStore = useGnbStore();
const gnbStoreGetters = gnbStore.getters;
const { getAllMenuList } = useAllMenuList();


/* Query */
const {
    publicDashboardListQuery,
    privateDashboardListQuery,
} = useGlobalDashboardQuery();

const emit = defineEmits<{(e: 'click-favorite'): void;
}>();

const dashboardList = computed(() => [...(publicDashboardListQuery?.data?.value ?? []), ...(privateDashboardListQuery?.data?.value ?? [])]);
const storeState = reactive({
    favoriteMenuList: computed(() => favoriteStoreGetters.favoriteMenuList),
    favoriteWorkspaceMenuList: computed(() => favoriteStoreGetters.workspaceItems),
    costDataSource: computed<CostDataSourceReferenceMap>(() => allReferenceStore.getters.costDataSource),
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    workspaceList: computed<WorkspaceModel[]>(() => workspaceStoreGetters.workspaceList),
    currentWorkspaceId: computed(() => workspaceStoreGetters.currentWorkspaceId as string),
    projects: computed<ProjectReferenceMap>(() => allReferenceStore.getters.project),
    projectGroups: computed<ProjectGroupReferenceMap>(() => allReferenceStore.getters.projectGroup),
    cloudServiceTypes: computed<CloudServiceTypeReferenceMap>(() => allReferenceStore.getters.cloudServiceType),
    metrics: computed<MetricReferenceMap>(() => allReferenceStore.getters.metric),
    service: computed<ServiceReferenceMap>(() => allReferenceStore.getters.service),
    metricExamples: computed<MetricExampleModel[]>(() => gnbStoreGetters.metricExamples),
    costQuerySets: computed<CostQuerySetModel[]>(() => gnbStoreGetters.costQuerySets),
});
const state = reactive({
    active: computed(() => {
        const targetList = props.favoriteType === FAVORITE_TYPE.WORKSPACE ? storeState.favoriteWorkspaceMenuList : storeState.favoriteMenuList;
        const favoriteItem = targetList.findIndex((d) => (d.itemId === props?.itemId
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
            itemId: props?.itemId,
        });
    } else {
        const params: FavoriteConfig = {
            itemType: props.favoriteType,
            workspaceId: storeState.currentWorkspaceId,
            itemId: props?.itemId,
        };
        const referenceData = convertFavoriteToReferenceData(params);
        await favoriteStore.createFavorite(referenceData || params);
    }
    emit('click-favorite');
};
const convertFavoriteToReferenceData = (favoriteConfig: FavoriteConfig): ReferenceData|undefined => {
    const { itemType } = favoriteConfig;
    if (itemType === FAVORITE_TYPE.DASHBOARD) {
        return convertDashboardConfigToReferenceData([favoriteConfig], dashboardList.value)[0];
    }
    if (itemType === FAVORITE_TYPE.PROJECT) {
        return convertProjectConfigToReferenceData([favoriteConfig], storeState.projects)[0];
    }
    if (itemType === FAVORITE_TYPE.PROJECT_GROUP) {
        return convertProjectGroupConfigToReferenceData([favoriteConfig], storeState.projectGroups)[0];
    }
    if (itemType === FAVORITE_TYPE.CLOUD_SERVICE || itemType === FAVORITE_TYPE.SECURITY) {
        return convertCloudServiceConfigToReferenceData([favoriteConfig], storeState.cloudServiceTypes)[0];
    }
    if (itemType === FAVORITE_TYPE.METRIC) {
        return convertMetricConfigToReferenceData([favoriteConfig], storeState.metrics)[0];
    }
    if (itemType === FAVORITE_TYPE.METRIC_EXAMPLE) {
        return convertMetricExampleConfigToReferenceData([favoriteConfig], storeState.metricExamples)[0];
    }
    if (itemType === FAVORITE_TYPE.COST_ANALYSIS) {
        return convertCostAnalysisConfigToReferenceData([favoriteConfig], storeState.costQuerySets, storeState.costDataSource)[0];
    }
    if (itemType === FAVORITE_TYPE.WORKSPACE) {
        return convertWorkspaceConfigToReferenceData([favoriteConfig], storeState.workspaceList)[0];
    }
    if (itemType === FAVORITE_TYPE.SERVICE) {
        return convertServiceConfigToReferenceData([favoriteConfig], storeState.service)[0];
    }
    const allMenuList = getAllMenuList(route, router);
    return convertMenuConfigToReferenceData([favoriteConfig], allMenuList)[0];
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
            transform: scale(1.1);
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
