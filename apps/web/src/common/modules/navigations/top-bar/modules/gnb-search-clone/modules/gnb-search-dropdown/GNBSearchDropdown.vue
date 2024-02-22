<script setup lang="ts">
import { useElementSize, useWindowSize } from '@vueuse/core';
import type Vue from 'vue';
import { computed, reactive, ref } from 'vue';

import { PTab } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { RecentConfig } from '@/store/modules/recent/type';
import { RECENT_TYPE } from '@/store/modules/recent/type';

import ErrorHandler from '@/common/composables/error/errorHandler';
import type { SuggestionType } from '@/common/modules/navigations/top-bar/modules/gnb-search-clone/config';
import GNBSearchServiceTab
    from '@/common/modules/navigations/top-bar/modules/gnb-search-clone/modules/gnb-search-dropdown/modules/GNBSearchServiceTab.vue';
import SearchTabContent
    from '@/common/modules/navigations/top-bar/modules/gnb-search-clone/modules/gnb-search-dropdown/modules/SearchTabContent.vue';
import TopBarSearchServiceAccountTab
    from '@/common/modules/navigations/top-bar/modules/gnb-search-clone/modules/gnb-search-dropdown/modules/TopBarSearchServiceAccountTab.vue';
import { useTopBarSearchStore } from '@/common/modules/navigations/top-bar/modules/gnb-search-clone/store';


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
const RECENT_LIMIT = 5;
const SEARCH_LIMIT = 15;
const BOTTOM_MARGIN = 4.5 * 16;

const topBarSearchStore = useTopBarSearchStore();
const windowSize = useWindowSize();

const dropdownRef = ref<null | HTMLElement>(null);
const searchInputRef = ref<null | HTMLElement>(null);
const tabRef = ref<null | Vue>(null);
const dropdownSize = useElementSize(dropdownRef);
const searchInputSize = useElementSize(searchInputRef);


const state = reactive({
    loading: true,
    activeTab: computed(() => topBarSearchStore.state.activateTab),
    tabs: [
        { label: 'Service', name: 'service' },
        { label: 'Service Account', name: 'service-account' },
        { label: 'Project', name: 'project' },
        { label: 'Dashboard', name: 'dashboard' },
        { label: 'Cloud Service', name: 'cloud-service' },
        { label: 'User', name: 'user' },
    ],
    isHeightOverflown: computed(() => dropdownSize.height.value >= (windowSize.height.value - (BOTTOM_MARGIN))),
    dropdownHeight: computed(() => (state.isHeightOverflown ? dropdownSize.height.value : undefined)),
    tabHeight: computed(() => (state.isHeightOverflown ? state.dropdownHeight - (searchInputSize.height.value) : undefined)),
    tabHeaderHeight: computed(() => {
        if (tabRef.value) {
            const tabHeaderHeight = tabRef.value.$el.firstElementChild?.clientHeight;
            if (tabHeaderHeight) return (tabHeaderHeight + 4) ?? 0;
        }
        return 0;
    }),
    tabContextHeight: computed(() => {
        if (state.isHeightOverflown) {
            return state.tabHeight - state.tabHeaderHeight;
        }
        return undefined;
    }),
});

const dataState = reactive({
    recentMenuList: [] as RecentConfig[]|null,
    searchMenuList: [],
});


// const createSearchRecent = async (type: SuggestionType, id: string) => {
//     try {
//         await SpaceConnector.client.addOns.recent.search.create({
//             type,
//             id,
//         });
//     } catch (e) {
//         ErrorHandler.handleError(e);
//     }
// };

const fetchSearchRecent = async (type: SuggestionType) => {
    try {
        state.loading = true;
        const { results } = await SpaceConnector.client.addOns.recent.search.list({
            type,
            limit: RECENT_LIMIT,
        });
        dataState.recentMenuList = results.map((d) => ({
            itemType: d.data.type,
            itemId: d.data.id,
            updatedAt: d.updated_at,
        }));
    } catch (e) {
        ErrorHandler.handleError(e);
        dataState.recentMenuList = [];
    } finally {
        state.loading = false;
    }
};

const handleMoveFocusEnd = () => {
    emit('move-focus-end');
};

const handleUpdateActiveTab = (tab: string) => {
    topBarSearchStore.$patch((_state) => {
        _state.state.activateTab = tab;
    });
};

(async () => {
    await fetchSearchRecent(RECENT_TYPE.MENU);
})();

</script>

<template>
    <div ref="dropdownRef"
         class="gnb-search-dropdown"
         :style="{ height: state.dropdownHeight + 'px'}"
    >
        <div ref="searchInputRef">
            <slot name="search-input" />
        </div>
        <p-tab ref="tabRef"
               :active-tab="state.activeTab"
               :tabs="state.tabs"
               :style="{ height: state.tabHeight + 'px'}"
               @update:activeTab="handleUpdateActiveTab"
        >
            <template #service>
                <g-n-b-search-service-tab
                    :search-limit="SEARCH_LIMIT"
                    :loading="state.loading"
                    :focusing-direction="props.focusingDirection"
                    :is-focused="props.isFocused"
                    :style="{ height: state.tabContextHeight + 'px'}"
                    @move-focus-end="handleMoveFocusEnd"
                />
            </template>
            <template #service-account>
                <top-bar-search-service-account-tab
                    :search-limit="SEARCH_LIMIT"
                    :loading="state.loading"
                    :focusing-direction="props.focusingDirection"
                    :is-focused="props.isFocused"
                    :style="{ height: state.tabContextHeight + 'px'}"
                    @move-focus-end="handleMoveFocusEnd"
                />
            </template>
            <template #project>
                <search-tab-content
                    :search-limit="SEARCH_LIMIT"
                    :loading="state.loading"
                    :focusing-direction="props.focusingDirection"
                    :is-focused="props.isFocused"
                    :style="{ height: state.tabContextHeight + 'px'}"
                    @move-focus-end="handleMoveFocusEnd"
                >
                    <template #item-format="item">
                        <div>{{ item?.label }}</div>
                    </template>
                </search-tab-content>
            </template>
        </p-tab>
    </div>
</template>

<style lang="postcss" scoped>
.gnb-search-dropdown {
    @apply fixed rounded-xs;
    display: flex;
    flex-direction: column;
    max-width: 47.5rem;
    width: 100%;
    max-height: calc(100vh - 4.5rem);
    top: 3.125rem;
    left: 0;
    right: 0;
    margin: 0 auto;
    box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.08);
    z-index: 1000;

    /* custom design-system component - p-data-loader */
    :deep(.p-tab) {
        .tab-pane {
            height: 100%;
            padding-bottom: 0;
        }
    }
}

@screen mobile {
    .gnb-search-dropdown {
        @apply flex flex-col;
        position: fixed;
        top: $top-bar-height;
        width: 100vw;
        height: calc(100vh - $top-bar-height - 0.5rem);
        margin-top: -0.5rem;

        /* custom design-system component - p-data-loader */
        :deep(.p-data-loader) {
            @apply flex-grow;
            .data-loader-container {
                @apply flex items-center;
                .data-wrapper {
                    width: 100%;
                }
            }
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
