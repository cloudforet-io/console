<script setup lang="ts">

import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    PI, PIconButton, PLazyImg, PTooltip,
} from '@cloudforet/mirinae';

import type { PublicDashboardModel } from '@/api-clients/dashboard/public-dashboard/schema/model';
import { useAllReferenceDataModel } from '@/query/resource-query/reference-data-model';

import { useReferenceRouter } from '@/router/composables/use-reference-router';

import { SEARCH_TAB } from '@/common/modules/navigations/top-bar/modules/top-bar-search/config';
import { topBarSearchReferenceRouter } from '@/common/modules/navigations/top-bar/modules/top-bar-search/helper';
import { useTopBarSearchStore } from '@/common/modules/navigations/top-bar/modules/top-bar-search/store';
import type { SearchTab } from '@/common/modules/navigations/top-bar/modules/top-bar-search/type';
import type { RecentItem } from '@/common/modules/navigations/type';
import { useRecentDelete } from '@/common/modules/user-config/recent/use-recent-delete';
import { useCloudServiceTypeMap } from '@/common/modules/user-config/shared/_internal/use-cloud-service-type-map';
import { useDashboardMap } from '@/common/modules/user-config/shared/_internal/use-dashboard-map';

interface Props {
    recentItem?: RecentItem;
}

const props = withDefaults(defineProps<Props>(), {
    recentItem: undefined,
});
const topBarSearchStore = useTopBarSearchStore();
const router = useRouter();

const { getReferenceLocation } = useReferenceRouter();
const referenceMap = useAllReferenceDataModel();
const serviceAccountMap = referenceMap.serviceAccount;
const projectMap = referenceMap.project;


/* Recent */
const { mutateAsync: deleteRecent } = useRecentDelete();
const { map: cloudServiceTypeMap } = useCloudServiceTypeMap();
const { map: dashboardMap } = useDashboardMap();

const storeState = reactive({
    currentWorkspaceId: computed(() => topBarSearchStore.storeState.currentWorkspaceId),
    activeTab: computed(() => topBarSearchStore.state.activeTab),
});

const splitCloudServiceInfo = (id:string): {provider:string; group:string; name: string} => {
    const sliceList = id.split('.');
    return {
        provider: sliceList[0],
        group: sliceList[1],
        name: sliceList[2],
    };
};

const state = reactive({
    resourceId: computed(() => props.recentItem?.data?.id),
    recentId: computed(() => props.recentItem?.name),
    cachedLabel: computed(() => props.recentItem?.data?.label),
    convertResourceId: computed(() => {
        if (storeState.activeTab !== SEARCH_TAB.CLOUD_SERVICE) {
            return state.resourceId;
        }
        const { provider, group, name } = splitCloudServiceInfo(state.resourceId);
        const cloudServiceTypeList = Array.from(cloudServiceTypeMap.value.values());
        const cloudServiceType = cloudServiceTypeList.find((item) => item?.provider === provider && item?.group === group && item.name === name);
        return cloudServiceType?.cloud_service_type_id;
    }),
    isDeleted: computed(() => {
        if (storeState.activeTab === SEARCH_TAB.SERVICE_ACCOUNT) {
            return !serviceAccountMap[state.resourceId];
        } if (storeState.activeTab === SEARCH_TAB.PROJECT) {
            return !projectMap[state.resourceId];
        } if (storeState.activeTab === SEARCH_TAB.DASHBOARD) {
            return !dashboardMap.value.get(state.resourceId);
        } if (storeState.activeTab === SEARCH_TAB.CLOUD_SERVICE) {
            return !props.recentItem?.data?.resource_id;
        }
        return false;
    }),
    iconName: computed(() => {
        switch (storeState.activeTab) {
        case SEARCH_TAB.SERVICE_ACCOUNT:
            return 'ic_service_service-account';
        case SEARCH_TAB.PROJECT:
            return 'ic_document-filled';
        case SEARCH_TAB.DASHBOARD:
            return 'ic_service_dashboard';
        case SEARCH_TAB.CLOUD_SERVICE:
            return 'ic_service_cloud-service';
        default:
            return '';
        }
    }),
    cloudServiceIconName: computed(() => props.recentItem?.tags?.icon),
    description: computed(() => {
        if (storeState.activeTab === SEARCH_TAB.DASHBOARD) {
            const dashboard = dashboardMap.value.get(state.convertResourceId) as PublicDashboardModel | undefined;
            if (dashboard?.resource_group === 'PROJECT') {
                const projectId = dashboard?.project_id;
                return `Single Project (${projectMap[projectId]?.label || projectId})`;
            }
            return 'Workspace';
        } if (storeState.activeTab === SEARCH_TAB.CLOUD_SERVICE) {
            return props.recentItem?.data?.description;
        }
        return '';
    }),
    tooltipText: computed(() => {
        const mainLabel = state.isDeleted ? `[Deleted] ${state.cachedLabel}` : getLabelByResourceId(state.convertResourceId, storeState.activeTab);
        return `${mainLabel}${state.description ? ` ∙ ${state.description}` : ''}`;
    }),
});

const getLabelByResourceId = (resourceId: string, activeTab: SearchTab) => {
    if (activeTab === SEARCH_TAB.SERVICE_ACCOUNT) {
        const provider = serviceAccountMap[resourceId]?.provider;
        let accountId;
        if (provider === 'aws') {
            accountId = serviceAccountMap[resourceId]?.data?.data?.account_id;
        } else if (provider === 'google_cloud') {
            accountId = serviceAccountMap[resourceId]?.data?.data?.project_id;
        } else if (provider === 'azure') {
            accountId = serviceAccountMap[resourceId]?.data?.data?.subscription_id;
        }
        return `${serviceAccountMap[resourceId]?.label || resourceId} (${accountId ?? resourceId})`;
    } if (activeTab === SEARCH_TAB.PROJECT) {
        return projectMap[resourceId]?.label || resourceId;
    } if (activeTab === SEARCH_TAB.DASHBOARD) {
        return dashboardMap.value.get(resourceId)?.name || resourceId;
    } if (activeTab === SEARCH_TAB.CLOUD_SERVICE) {
        return props.recentItem?.data?.label ?? '';
    }
    return '';
};

const handleClick = () => {
    if (state.isDeleted) return;
    if (!storeState.currentWorkspaceId) return;
    if (topBarSearchStore.state.activeTab === SEARCH_TAB.CLOUD_SERVICE) {
        router.push(topBarSearchReferenceRouter(topBarSearchStore.state.activeTab, state.convertResourceId, storeState.currentWorkspaceId, props.recentItem?.data));
    } else if (topBarSearchStore.state.activeTab !== SEARCH_TAB.SERVICE) {
        if (topBarSearchStore.state.activeTab === SEARCH_TAB.PROJECT) {
            router.push(getReferenceLocation(state.convertResourceId, { resource_type: 'identity.Project' })).catch(() => {});
        } else {
            router.push(topBarSearchReferenceRouter(
                topBarSearchStore.state.activeTab,
                state.convertResourceId,
                storeState.currentWorkspaceId,
            ));
        }
    }
    topBarSearchStore.setIsActivated(false);
};

const handleDeleteRecent = async () => {
    await deleteRecent({ name: state.recentId });
};
</script>

<template>
    <div class="top-bar-search-list-item"
         :class="{ 'is-deleted': state.isDeleted }"
         @click.stop="handleClick"
    >
        <p-lazy-img v-if="storeState.activeTab === SEARCH_TAB.CLOUD_SERVICE && state.cloudServiceIconName"
                    :src="state.convertResourceId ? state.cloudServiceIconName : ''"
                    width="1.25rem"
                    height="1.25rem"
                    style="margin-right: 0.375rem;"
        />
        <div v-else
             class="icon-background"
        >
            <p-i :name="state.iconName"
                 width="1.25rem"
                 height="1.25rem"
            />
        </div>
        <div class="main-box">
            <p-tooltip :contents="state.tooltipText"
                       position="bottom"
            >
                <div class="upper-part">
                    <span>{{ state.isDeleted ? `[Deleted] ${state.cachedLabel}` : getLabelByResourceId(state.convertResourceId, storeState.activeTab) }}</span><span v-if="state.convertResourceId"
                                                                                                                                                                     class="desc"
                    ><span v-if="state.description"><span class="dot">∙</span><span>{{ state.description }}</span>
                    </span></span>
                </div>
            </p-tooltip>
            <p-icon-button v-if="state.isDeleted"
                           class="delete-button"
                           name="ic_delete"
                           size="sm"
                           @click.stop="handleDeleteRecent"
            />
        </div>
    </div>
</template>

<style scoped lang="postcss">
.top-bar-search-list-item {
    display: flex;
    align-items: center;
    height: 2rem;
    cursor: pointer;
    .icon-background {
        @apply flex items-center justify-center bg-gray-100 rounded-md;
        margin-right: 0.375rem;
    }

    .main-box {
        @apply flex justify-between;
        line-height: 1.125rem;
        width: calc(100% - 1.625rem);

        :deep(.has-tooltip) {
            width: calc(100% - 1.5rem);
        }

        .upper-part {
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;

            .desc {
                @apply text-label-sm text-gray-500;
                .dot {
                    margin: 0 2px;
                    font-weight: 700;
                }
            }
        }

        .delete-button {
            visibility: hidden;
        }

        &:hover {
            .delete-button {
                visibility: visible;
            }
        }
    }
}

.is-deleted {
    cursor: not-allowed;
    svg {
        opacity: 40%;
    }

    .upper-part {
        opacity: 40%;
    }
}
</style>
