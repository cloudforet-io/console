<script setup lang="ts">

import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    PI, PLazyImg, PTooltip,
} from '@spaceone/design-system';

import { store } from '@/store';

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
    serviceAccountMap: computed(() => store.state.reference.serviceAccount.items),
    projectMap: computed(() => allReferenceStore.getters.project),
    cloudServiceTypeMap: computed(() => store.state.reference.cloudServiceType.items),
    publicDashboardMap: computed(() => allReferenceStore.getters.publicDashboard),
});

const state = reactive({
    tooltipText: computed(() => `${props.resourceId}${props.resourceId ? ` ∙ ${props.resourceId}` : ''}`),
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
        return `${storeState.serviceAccountMap[resourceId]?.key} (${storeState.serviceAccountMap[resourceId]?.label})`;
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
        router.push(topBarSearchReferenceRouter(topBarSearchStore.state.activeTab, props.resourceId, storeState.currentWorkspaceId, storeState.cloudServiceTypeMap[props.resourceId]));
    } else if (topBarSearchStore.state.activeTab !== SEARCH_TAB.SERVICE) router.push(topBarSearchReferenceRouter(topBarSearchStore.state.activeTab, props.resourceId, storeState.currentWorkspaceId));
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
                    :src="props.resourceId ? storeState.cloudServiceTypeMap[props.resourceId]?.icon : ''"
                    width="1.25rem"
                    height="1.25rem"
                    style="margin-right: 0.375rem;"
        />
        <div class="main-box">
            <p-tooltip :contents="state.tooltipText"
                       position="bottom"
            >
                <div class="upper-part">
                    <span>{{ getLabelByResourceId(props.resourceId, storeState.activeTab) }}</span><span v-if="props.resourceId"
                                                                                                         class="desc"
                    ><span v-if="storeState.activeTab === 'dashboard'"><span class="dot">∙</span><span>{{ getDescriptionByResourceId(props.resourceId, storeState.activeTab) }}</span>
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
