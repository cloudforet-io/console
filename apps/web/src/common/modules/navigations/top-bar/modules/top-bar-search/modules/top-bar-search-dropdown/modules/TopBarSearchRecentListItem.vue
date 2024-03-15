<script setup lang="ts">

import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    PI, PLazyImg, PTooltip,
} from '@spaceone/design-system';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import { SEARCH_TAB } from '@/common/modules/navigations/top-bar/modules/top-bar-search/config';
import { topBarSearchReferenceRouter } from '@/common/modules/navigations/top-bar/modules/top-bar-search/helper';
import { useTopBarSearchStore } from '@/common/modules/navigations/top-bar/modules/top-bar-search/store';
import type { SearchTab } from '@/common/modules/navigations/top-bar/modules/top-bar-search/type';


interface Props {
    resourceId: string;
}

const props = withDefaults(defineProps<Props>(), {
    resourceId: '',
});
const topBarSearchStore = useTopBarSearchStore();
const allReferenceStore = useAllReferenceStore();
const router = useRouter();

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
    convertResourceId: computed(() => {
        if (storeState.activeTab !== SEARCH_TAB.CLOUD_SERVICE) {
            return props.resourceId;
        }
        const { provider, group, name } = splitCloudServiceInfo(props.resourceId);
        return Object.values(storeState.cloudServiceTypeMap).filter((item) => item?.data?.provider === provider && item?.data?.group === group && item.name === name)[0]?.key;
    }),
    tooltipText: computed(() => {
        const mainLabel = getLabelByResourceId(state.convertResourceId, storeState.activeTab);
        const isDescriptionExist = state.convertResourceId && (storeState.activeTab === SEARCH_TAB.DASHBOARD);
        const description = getDescriptionByResourceId(state.convertResourceId, storeState.activeTab);
        return `${mainLabel}${isDescriptionExist ? ` ∙ ${description}` : ''}`;
    }),
    iconName: computed(() => {
        switch (storeState.activeTab) {
        case SEARCH_TAB.SERVICE_ACCOUNT:
            return 'ic_service_service-account';
        case SEARCH_TAB.PROJECT:
            return 'ic_document-filled';
        case SEARCH_TAB.DASHBOARD:
            return 'ic_service_dashboard';
        default:
            return '';
        }
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
        return storeState.cloudServiceTypeMap[resourceId]?.label;
    }
    return '';
};

const getDescriptionByResourceId = (resourceId: string, activeTab: SearchTab) => {
    if (activeTab === 'dashboard') {
        if (storeState.publicDashboardMap[resourceId]?.data?.resourceGroup === 'PROJECT') {
            const projectId = storeState.publicDashboardMap[resourceId]?.data?.projectId;
            return `Single Project (${storeState.projectMap[projectId]?.label})`;
        }
        return 'Workspace';
    }
    return '';
};

const handleClick = () => {
    if (!storeState.currentWorkspaceId) return;
    if (topBarSearchStore.state.activeTab === SEARCH_TAB.CLOUD_SERVICE) {
        router.push(topBarSearchReferenceRouter(topBarSearchStore.state.activeTab, state.convertResourceId, storeState.currentWorkspaceId, storeState.cloudServiceTypeMap[state.convertResourceId]));
    } else if (topBarSearchStore.state.activeTab !== SEARCH_TAB.SERVICE) {
        router.push(topBarSearchReferenceRouter(
            topBarSearchStore.state.activeTab,
            state.convertResourceId,
            storeState.currentWorkspaceId,
        ));
    }
    topBarSearchStore.setIsActivated(false);
};
</script>

<template>
    <div class="top-bar-search-list-item"
         @click="handleClick"
    >
        <div v-if="state.iconName"
             class="icon-background"
        >
            <p-i :name="state.iconName"
                 width="1.25rem"
                 height="1.25rem"
            />
        </div>
        <p-lazy-img v-else
                    :src="state.convertResourceId ? storeState.cloudServiceTypeMap[state.convertResourceId]?.icon : ''"
                    width="1.25rem"
                    height="1.25rem"
                    style="margin-right: 0.375rem;"
        />
        <div class="main-box">
            <p-tooltip :contents="state.tooltipText"
                       position="bottom"
            >
                <div class="upper-part">
                    <span>{{ getLabelByResourceId(state.convertResourceId, storeState.activeTab) }}</span><span v-if="state.convertResourceId"
                                                                                                                class="desc"
                    ><span v-if="storeState.activeTab === 'dashboard'"><span class="dot">∙</span><span>{{ getDescriptionByResourceId(state.convertResourceId, storeState.activeTab) }}</span>
                    </span></span>
                </div>
            </p-tooltip>
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
        @apply flex flex-col;
        line-height: 1.125rem;
        width: calc(100% - 1.625rem);

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

        .lower-part {
            @apply flex justify-between;
            .left-part {
                @apply inline-flex items-center gap-1;
                margin-top: 0;
                line-height: 0.875rem;

                .label {
                    @apply text-label-sm text-gray-500;
                }

                /* custom design-system component - p-link */
                :deep(.p-link) {
                    @apply text-gray-500;
                }
            }
        }
    }
}
</style>
