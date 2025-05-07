<script setup lang="ts">
import { useElementSize, useWindowSize } from '@vueuse/core';
import type Vue from 'vue';
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router/composables';

import { debounce } from 'lodash';

import {
    PTab, screens, PLazyImg, PI,
} from '@cloudforet/mirinae';
import type { ValueItem } from '@cloudforet/mirinae/types/controls/search/query-search/type';

import { useReferenceRouter } from '@/router/composables/use-reference-router';

import { useAuthorizationStore } from '@/store/authorization/authorization-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import { MENU_ID } from '@/lib/menu/config';

import { useRecentStore } from '@/common/modules/navigations/stores/recent-store';
import { SEARCH_TAB } from '@/common/modules/navigations/top-bar/modules/top-bar-search/config';
import {
    topBarSearchReferenceRouter,
} from '@/common/modules/navigations/top-bar/modules/top-bar-search/helper';
import SearchTabContent
    from '@/common/modules/navigations/top-bar/modules/top-bar-search/modules/top-bar-search-dropdown/modules/SearchTabContent.vue';
import TopBarSearchListItem
    from '@/common/modules/navigations/top-bar/modules/top-bar-search/modules/top-bar-search-dropdown/modules/TopBarSearchListItem.vue';
import TopBarSearchServiceTab
    from '@/common/modules/navigations/top-bar/modules/top-bar-search/modules/top-bar-search-dropdown/modules/TopBarSearchServiceTab.vue';
import { useTopBarSearchStore } from '@/common/modules/navigations/top-bar/modules/top-bar-search/store';
import type { SearchTab } from '@/common/modules/navigations/top-bar/modules/top-bar-search/type';
import { RECENT_TYPE } from '@/common/modules/navigations/type';

interface Props {
    isFocused: boolean;
    focusingDirection: string;
}

const allReferenceStore = useAllReferenceStore();

const props = withDefaults(defineProps<Props>(), {
    isFocused: false,
    focusingDirection: '',
});
const emit = defineEmits<{(event: 'move-focus-end'): void;
}>();
const router = useRouter();

const SEARCH_LIMIT = 15;
const BOTTOM_MARGIN = 5.5 * 16;

const topBarSearchStore = useTopBarSearchStore();
const recentStore = useRecentStore();
const windowSize = useWindowSize();
const authorizationStore = useAuthorizationStore();

const { getReferenceLocation } = useReferenceRouter();

const dropdownRef = ref<null | HTMLElement>(null);
const dropdownSize = useElementSize(dropdownRef);
const tabRef = ref<null | Vue>(null);


const getTabHeaderHeight = () => {
    const tabHeaderHeight = tabRef.value?.$el.firstElementChild?.clientHeight;
    if (tabHeaderHeight) return tabHeaderHeight + 4;
    return 0;
};

const storeState = reactive({
    activeTab: computed(() => topBarSearchStore.state.activeTab),
    cloudServiceTypeMap: computed(() => allReferenceStore.getters.cloudServiceType),
});

const state = reactive({
    defaultServiceTabs: [
        { label: 'Service Account', name: SEARCH_TAB.SERVICE_ACCOUNT, id: MENU_ID.SERVICE_ACCOUNT },
        { label: 'Project', name: SEARCH_TAB.PROJECT, id: MENU_ID.PROJECT },
        { label: 'Dashboard', name: SEARCH_TAB.DASHBOARD, id: MENU_ID.DASHBOARDS },
        { label: 'Cloud Service', name: SEARCH_TAB.CLOUD_SERVICE, id: MENU_ID.CLOUD_SERVICE },
    ],
    tabs: computed(() => {
        const accessMenuList: ValueItem[] = [];
        state.defaultServiceTabs.forEach((i) => {
            if (authorizationStore.getters.pageAccessPermissionMap[i.id]) {
                accessMenuList.push({ label: i.label, name: i.name });
            }
        });
        return [
            { label: 'Service', name: SEARCH_TAB.SERVICE },
            ...accessMenuList,
        ];
    }),
    contentsHeight: 0,
    searchInputHeight: computed(() => (state.isTabletSize ? 60 : 0)),
    isTabletSize: computed(() => windowSize.width.value < screens.tablet.max),
    isHeightOverflown: computed(() => (state.contentsHeight + getTabHeaderHeight() + state.searchInputHeight) >= (windowSize.height.value - (BOTTOM_MARGIN))),
    dropdownHeight: computed(() => (state.isHeightOverflown ? dropdownSize.height.value : undefined)),
    tabHeight: computed(() => ((state.isHeightOverflown) ? state.dropdownHeight - (state.searchInputHeight) : undefined)),
    tabContextHeight: computed(() => {
        if (state.isHeightOverflown) {
            return state.tabHeight - getTabHeaderHeight();
        }
        return undefined;
    }),
});

const handleMoveFocusEnd = () => {
    emit('move-focus-end');
};

const handleUpdateActiveTab = (tab: SearchTab) => {
    topBarSearchStore.$patch((_state) => {
        _state.state.activeTab = tab;
    });
};

const handleUpdateContentsSize = debounce((height: number) => {
    if (state.contentsHeight !== height) state.contentsHeight = height;
}, 100);

const handleSelect = (item) => {
    if (topBarSearchStore.state.activeTab === SEARCH_TAB.CLOUD_SERVICE) {
        router.push(topBarSearchReferenceRouter(topBarSearchStore.state.activeTab, item.resource_id, item.workspace_id, item?.tags));
        recentStore.createRecent({
            workspaceId: item?.workspace_id,
            type: RECENT_TYPE.CLOUD_SERVICE,
            id: item?.resource_id,
            options: {
                ...item?.tags,
                description: item?.description,
                label: item?.name,
            },
        });
    } else if (topBarSearchStore.state.activeTab !== SEARCH_TAB.SERVICE) {
        if (topBarSearchStore.state.activeTab === SEARCH_TAB.PROJECT) {
            router.push(getReferenceLocation(item.resource_id, { resource_type: 'identity.Project' })).catch(() => {});
        } else {
            router.push(topBarSearchReferenceRouter(topBarSearchStore.state.activeTab, item.resource_id, item.workspace_id));
        }
    }

    topBarSearchStore.setIsActivated(false);
};

</script>

<template>
    <div ref="dropdownRef"
         class="top-bar-search-dropdown"
    >
        <div ref="searchInputRef">
            <slot name="search-input" />
        </div>
        <p-tab ref="tabRef"
               :active-tab="storeState.activeTab"
               :tabs="state.tabs"
               :style="{ height: state.tabHeight ? state.tabHeight + 'px': undefined}"
               @update:active-tab="handleUpdateActiveTab"
        >
            <template #service>
                <top-bar-search-service-tab
                    :search-limit="SEARCH_LIMIT"
                    :focusing-direction="props.focusingDirection"
                    :is-focused="props.isFocused"
                    :active-tab="storeState.activeTab"
                    :style="{ height: state.tabContextHeight ? state.tabContextHeight + 'px': undefined}"
                    @update:contents-size="handleUpdateContentsSize"
                    @move-focus-end="handleMoveFocusEnd"
                />
            </template>
            <template #serviceAccount>
                <search-tab-content
                    key="serviceAccount"
                    :search-limit="SEARCH_LIMIT"
                    :focusing-direction="props.focusingDirection"
                    :is-focused="props.isFocused"
                    :style="{ height: state.tabContextHeight ? state.tabContextHeight + 'px': undefined}"
                    @move-focus-end="handleMoveFocusEnd"
                    @update:contents-size="handleUpdateContentsSize"
                    @select="handleSelect"
                >
                    <template #search-menu-item="{item}">
                        <top-bar-search-list-item key="serviceAccount"
                                                  :label="item?.name"
                                                  icon-name="ic_service_service-account"
                                                  :workspace-id="item?.workspace_id"
                                                  :description="item?.description"
                        />
                    </template>
                </search-tab-content>
            </template>
            <template #project>
                <search-tab-content
                    key="project"
                    :search-limit="SEARCH_LIMIT"
                    :focusing-direction="props.focusingDirection"
                    :is-focused="props.isFocused"
                    :style="{ height: state.tabContextHeight ? state.tabContextHeight + 'px': undefined}"
                    @move-focus-end="handleMoveFocusEnd"
                    @update:contents-size="handleUpdateContentsSize"
                    @select="handleSelect"
                >
                    <template #search-menu-item="{item}">
                        <top-bar-search-list-item key="project"
                                                  :label="item?.name"
                                                  icon-name="ic_document-filled"
                                                  :workspace-id="item?.workspace_id"
                                                  :description="item?.description"
                        />
                    </template>
                </search-tab-content>
            </template>
            <template #dashboard>
                <search-tab-content
                    key="dashboard"
                    :search-limit="SEARCH_LIMIT"
                    :focusing-direction="props.focusingDirection"
                    :is-focused="props.isFocused"
                    :style="{ height: state.tabContextHeight ? state.tabContextHeight + 'px': undefined}"
                    @move-focus-end="handleMoveFocusEnd"
                    @update:contents-size="handleUpdateContentsSize"
                    @select="handleSelect"
                >
                    <template #search-menu-item="{item}">
                        <top-bar-search-list-item key="dashboard"
                                                  :label="item?.name"
                                                  icon-name="ic_service_dashboard"
                                                  :workspace-id="item?.workspace_id"
                                                  :description="item?.description"
                        />
                    </template>
                </search-tab-content>
            </template>
            <template #cloudService>
                <search-tab-content
                    key="cloudService"
                    :search-limit="SEARCH_LIMIT"
                    :focusing-direction="props.focusingDirection"
                    :is-focused="props.isFocused"
                    :style="{ height: state.tabContextHeight ? state.tabContextHeight + 'px': undefined}"
                    @move-focus-end="handleMoveFocusEnd"
                    @update:contents-size="handleUpdateContentsSize"
                    @select="handleSelect"
                >
                    <template #search-menu-item="{item}">
                        <top-bar-search-list-item key="cloudService"
                                                  :label="item?.name"
                                                  :workspace-id="item?.workspace_id"
                                                  :description="item?.description"
                        >
                            <template #icon>
                                <span style="margin-right: 0.375rem;">
                                    <p-lazy-img v-if="item?.tags?.icon"
                                                :src="item?.tags?.icon"
                                                width="1.25rem"
                                                height="1.25rem"
                                    />
                                    <p-i v-else
                                         name="ic_service_cloud-service"
                                         width="1.25rem"
                                         height="1.25rem"
                                    /></span>
                            </template>
                        </top-bar-search-list-item>
                    </template>
                </search-tab-content>
            </template>
        </p-tab>
    </div>
</template>

<style lang="postcss" scoped>
.top-bar-search-dropdown {
    @apply fixed rounded-xs;
    display: flex;
    flex-direction: column;
    max-width: 47.5rem;
    min-height: 30rem;
    width: 100%;
    height: 100%;
    max-height: calc(100vh - 4.5rem);
    top: 3.125rem;
    left: 0;
    right: 0;
    margin: 0 auto;
    z-index: 1000;

    /* custom design-system component - p-tab */
    :deep(.p-tab) {
        box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.08);
        .tab-pane {
            height: 100%;
            padding-bottom: 0;
        }
    }
}

@screen tablet {
    .top-bar-search-dropdown {
        max-height: unset;
        max-width: unset;
        width: 100vw;
        height: 100vh;

        /* custom design-system component - p-data-loader */
        :deep(.p-tab) {
            border: 0;
            height: 100%;
            border-radius: 0;
        }
    }
}

/* custom design-system component - p-empty */
:deep(.p-empty) {
    margin: 2.5rem 0;

    .no-data-text {
        em {
            @apply font-bold text-gray-500;
        }
    }
}
</style>
