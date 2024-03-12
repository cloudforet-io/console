<script setup lang="ts">
import { useElementSize, useWindowSize } from '@vueuse/core';
import type Vue from 'vue';
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    PTab, screens, PLazyImg,
} from '@spaceone/design-system';

import { store } from '@/store';

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

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';


interface Props {
    isFocused: boolean;
    focusingDirection: string;
}

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
const windowSize = useWindowSize();

const dropdownRef = ref<null | HTMLElement>(null);
const dropdownSize = useElementSize(dropdownRef);
const tabRef = ref<null | Vue>(null);


const getTabHeaderHeight = () => {
    const tabHeaderHeight = tabRef.value?.$el.firstElementChild?.clientHeight;
    if (tabHeaderHeight) return (tabHeaderHeight + 4) ?? 0;
    return 0;
};

const storeState = reactive({
    activeTab: computed(() => topBarSearchStore.state.activeTab),
    cloudServiceTypeMap: computed(() => store.state.reference.cloudServiceType.items),
});

const state = reactive({
    tabs: [
        { label: 'Service', name: SEARCH_TAB.SERVICE },
        { label: 'Service Account', name: SEARCH_TAB.SERVICE_ACCOUNT },
        { label: 'Project', name: SEARCH_TAB.PROJECT },
        { label: 'Dashboard', name: SEARCH_TAB.DASHBOARD },
        { label: 'Cloud Service', name: SEARCH_TAB.CLOUD_SERVICE },
    ],
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

const handleUpdateContentsSize = (height: number) => {
    state.contentsHeight = height;
};

const handleSelect = (menuType: 'search'|'recent', item) => {
    if (topBarSearchStore.state.activeTab === SEARCH_TAB.CLOUD_SERVICE) {
        if (menuType === 'search') {
            router.push({
                name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
                params: {
                    name: item?.tags?.name, workspaceId: item?.workspace_id, group: item?.tags?.group, provider: item?.tags?.provider,
                },
            });
        } else router.push(topBarSearchReferenceRouter(topBarSearchStore.state.activeTab, item.resource_id, item.workspace_id, storeState.cloudServiceTypeMap[item.resource_id]));
    } else if (topBarSearchStore.state.activeTab !== SEARCH_TAB.SERVICE) router.push(topBarSearchReferenceRouter(topBarSearchStore.state.activeTab, item.resource_id, item.workspace_id));

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
               @update:activeTab="handleUpdateActiveTab"
        >
            <template #service>
                <top-bar-search-service-tab
                    :search-limit="SEARCH_LIMIT"
                    :focusing-direction="props.focusingDirection"
                    :is-focused="props.isFocused"
                    :active-tab="storeState.activeTab"
                    :style="{ height: state.tabContextHeight ? state.tabContextHeight + 'px': undefined}"
                    @move-focus-end="handleMoveFocusEnd"
                    @select="handleSelect"
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
                    <template #item-format="{item}">
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
                    <template #item-format="{item}">
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
                    <template #item-format="{item}">
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
                    <template #item-format="{item}">
                        <top-bar-search-list-item key="cloudService"
                                                  :label="item?.name"
                                                  :workspace-id="item?.workspace_id"
                                                  :description="item?.description"
                        >
                            <template #icon>
                                <p-lazy-img :src="item?.tags?.icon"
                                            width="1.25rem"
                                            height="1.25rem"
                                            style="margin-right: 0.375rem;"
                                />
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
