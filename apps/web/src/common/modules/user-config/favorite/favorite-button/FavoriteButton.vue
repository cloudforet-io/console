<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';

import { PI } from '@cloudforet/mirinae';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import type { ReferenceData } from '@/lib/helper/config-data-helper';


import { useFavoriteCreateMutation } from '@/common/modules/user-config/favorite/core/use-favorite-create-mutation';
import { useFavoriteDeleteMutation } from '@/common/modules/user-config/favorite/core/use-favorite-delete-mutation';
import { useFavoriteList } from '@/common/modules/user-config/favorite/core/use-favorite-list';
import { useWorkspaceFavoriteList } from '@/common/modules/user-config/favorite/core/use-workspace-favorite-list';
import type { FavoriteType, FavoriteConfig } from '@/common/modules/user-config/favorite/favorite-button/type';
import { FAVORITE_TYPE } from '@/common/modules/user-config/favorite/favorite-button/type';
import { useConvertReferencedConfigData } from '@/common/modules/user-config/shared/use-convert-referenced-config-data';



interface Props {
    itemId: string;
    favoriteType: FavoriteType;
    scale?: string;
    readOnly?: boolean;
    visibleActiveCaseOnly?: boolean;
}
interface Emits {
    (e: 'click-favorite'): void;
}

const props = withDefaults(defineProps<Props>(), {
    scale: '1',
    readOnly: false,
    visibleActiveCaseOnly: false,
});
const emit = defineEmits<Emits>();

const userWorkspaceStore = useUserWorkspaceStore();
const workspaceStoreGetters = userWorkspaceStore.getters;
const appContextStore = useAppContextStore();

/* Favorite */
const favoriteData = useFavoriteList();
const { loading: isLoadingWorkspaceFavoriteData, ...workspaceFavoriteData } = useWorkspaceFavoriteList();
const { loading: isLoadingConvertedFavoriteData, ...convertedFavoriteData } = useConvertReferencedConfigData({
    allConfigList: favoriteData.favoriteMenuList,
    projectConfigList: favoriteData.projectItems,
    projectGroupConfigList: favoriteData.projectGroupItems,
    metricConfigList: favoriteData.metricItems,
    metricExampleConfigList: favoriteData.metricExampleItems,
    serviceConfigList: favoriteData.serviceItems,
    dashboardConfigList: favoriteData.dashboardItems,
    costQuerySetConfigList: favoriteData.costAnalysisItems,
    cloudServiceConfigList: favoriteData.cloudServiceTypeItems,
    workspaceConfigList: workspaceFavoriteData.workspaceItems,
});

const { mutateAsync: createFavorite, isPending: isCreatingFavorite } = useFavoriteCreateMutation();
const { mutateAsync: deleteFavorite, isPending: isDeletingFavorite } = useFavoriteDeleteMutation();




const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    currentWorkspaceId: computed(() => workspaceStoreGetters.currentWorkspaceId as string),
});
const state = reactive({
    active: computed(() => {
        const targetList = props.favoriteType === FAVORITE_TYPE.WORKSPACE ? workspaceFavoriteData.workspaceItems.value : favoriteData.favoriteMenuList.value;
        const favoriteItem = targetList.findIndex((d) => (d.itemId === props?.itemId
            && (d.itemType === props.favoriteType)));
        return favoriteItem > -1;
    }),
});

const preLoading = computed(() => isLoadingWorkspaceFavoriteData.value || isLoadingConvertedFavoriteData.value);
const triggerLoading = computed(() => isCreatingFavorite.value || isDeletingFavorite.value);

const handleClickFavoriteButton = async (event: MouseEvent) => {
    if (storeState.isAdminMode) return;
    event.stopPropagation();

    if (preLoading.value || triggerLoading.value) return;
    if (props.readOnly) return;
    if (state.active) {
        await deleteFavorite({
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
        await createFavorite(referenceData || params);
    }
    emit('click-favorite');
};
const convertFavoriteToReferenceData = (favoriteConfig: FavoriteConfig): ReferenceData|undefined => {
    const { itemType } = favoriteConfig;
    if (itemType === FAVORITE_TYPE.DASHBOARD) {
        return convertedFavoriteData.convertedDashboard.value.find((d) => d.itemId === props?.itemId);
    }
    if (itemType === FAVORITE_TYPE.PROJECT) {
        return convertedFavoriteData.convertedProject.value.find((d) => d.itemId === props?.itemId);
    }
    if (itemType === FAVORITE_TYPE.PROJECT_GROUP) {
        return convertedFavoriteData.convertedProjectGroup.value.find((d) => d.itemId === props?.itemId);
    }
    if (itemType === FAVORITE_TYPE.CLOUD_SERVICE || itemType === FAVORITE_TYPE.SECURITY) {
        return convertedFavoriteData.convertedCloudServiceType.value.find((d) => d.itemId === props?.itemId);
    }
    if (itemType === FAVORITE_TYPE.METRIC) {
        return convertedFavoriteData.convertedMetric.value.find((d) => d.itemId === props?.itemId);
    }
    if (itemType === FAVORITE_TYPE.METRIC_EXAMPLE) {
        return convertedFavoriteData.convertedMetricExample.value.find((d) => d.itemId === props?.itemId);
    }
    if (itemType === FAVORITE_TYPE.COST_ANALYSIS) {
        return convertedFavoriteData.convertedCostQuerySet.value.find((d) => d.itemId === props?.itemId);
    }
    if (itemType === FAVORITE_TYPE.WORKSPACE) {
        return convertedFavoriteData.convertedWorkspace.value.find((d) => d.itemId === props?.itemId);
    }
    if (itemType === FAVORITE_TYPE.SERVICE) {
        return convertedFavoriteData.convertedService.value.find((d) => d.itemId === props?.itemId);
    }
    return convertedFavoriteData.convertedMenu.value.find((d) => d.itemId === props?.itemId);
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
