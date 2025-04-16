<script setup lang="ts">

import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    PI, PIconButton, PLazyImg, PTooltip,
} from '@cloudforet/mirinae';

import { useReferenceRouter } from '@/router/composables/use-reference-router';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import { useRecentStore } from '@/common/modules/navigations/stores/recent-store';
import { SEARCH_TAB } from '@/common/modules/navigations/top-bar/modules/top-bar-search/config';
import { topBarSearchReferenceRouter } from '@/common/modules/navigations/top-bar/modules/top-bar-search/helper';
import { useTopBarSearchStore } from '@/common/modules/navigations/top-bar/modules/top-bar-search/store';
import type { SearchTab } from '@/common/modules/navigations/top-bar/modules/top-bar-search/type';
import type { RecentItem } from '@/common/modules/navigations/type';

interface Props {
    recentItem?: RecentItem;
}

const props = withDefaults(defineProps<Props>(), {
    recentItem: undefined,
});
const topBarSearchStore = useTopBarSearchStore();
const allReferenceStore = useAllReferenceStore();
const recentStore = useRecentStore();
const router = useRouter();

const { getReferenceLocation } = useReferenceRouter();

const storeState = reactive({
    workspaceMap: computed(() => topBarSearchStore.storeState.workspaceMap),
    currentWorkspaceId: computed(() => topBarSearchStore.storeState.currentWorkspaceId),
    activeTab: computed(() => topBarSearchStore.state.activeTab),
    serviceAccountMap: computed(() => allReferenceStore.getters.serviceAccount),
    projectMap: computed(() => allReferenceStore.getters.project),
    cloudServiceTypeMap: computed(() => allReferenceStore.getters.cloudServiceType),
    publicDashboardMap: computed(() => allReferenceStore.getters.publicDashboard),
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
        return Object.values(storeState.cloudServiceTypeMap).filter((item) => item?.data?.provider === provider && item?.data?.group === group && item.name === name)[0]?.key;
    }),
    isDeleted: computed(() => {
        if (storeState.activeTab === SEARCH_TAB.SERVICE_ACCOUNT) {
            return !storeState.serviceAccountMap[state.resourceId];
        } if (storeState.activeTab === SEARCH_TAB.PROJECT) {
            return !storeState.projectMap[state.resourceId];
        } if (storeState.activeTab === SEARCH_TAB.DASHBOARD) {
            return !storeState.publicDashboardMap[state.resourceId];
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
            if (storeState.publicDashboardMap[state.convertResourceId]?.data?.resourceGroup === 'PROJECT') {
                const projectId = storeState.publicDashboardMap[state.convertResourceId]?.data?.projectId;
                return `Single Project (${storeState.projectMap[projectId]?.label})`;
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
        const provider = storeState.serviceAccountMap[resourceId]?.provider;
        let accountId;
        if (provider === 'aws') {
            accountId = storeState.serviceAccountMap[resourceId]?.data?.account_id;
        } else if (provider === 'google_cloud') {
            accountId = storeState.serviceAccountMap[resourceId]?.data?.project_id;
        } else if (provider === 'azure') {
            accountId = storeState.serviceAccountMap[resourceId]?.data?.subscription_id;
        }
        return `${storeState.serviceAccountMap[resourceId]?.label} (${accountId ?? resourceId})`;
    } if (activeTab === SEARCH_TAB.PROJECT) {
        return storeState.projectMap[resourceId]?.label;
    } if (activeTab === SEARCH_TAB.DASHBOARD) {
        return storeState.publicDashboardMap[resourceId]?.label;
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

const handleDeleteRecent = () => {
    recentStore.deleteRecent({ name: state.recentId });
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
