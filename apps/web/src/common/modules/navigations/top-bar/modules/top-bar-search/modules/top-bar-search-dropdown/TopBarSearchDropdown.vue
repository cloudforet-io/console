<script setup lang="ts">
import { useElementSize, useWindowSize } from '@vueuse/core';
import type Vue from 'vue';
import { computed, reactive, ref } from 'vue';

import { PTab, screens } from '@spaceone/design-system';

import SearchTabContent
    from '@/common/modules/navigations/top-bar/modules/top-bar-search/modules/top-bar-search-dropdown/modules/SearchTabContent.vue';
import TopBarSearchServiceTab
    from '@/common/modules/navigations/top-bar/modules/top-bar-search/modules/top-bar-search-dropdown/modules/TopBarSearchServiceTab.vue';
import { useTopBarSearchStore } from '@/common/modules/navigations/top-bar/modules/top-bar-search/store';


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

const state = reactive({
    activeTab: computed(() => topBarSearchStore.state.activateTab),
    tabs: [
        { label: 'Service', name: 'service' },
        { label: 'Service Account', name: 'service-account' },
        { label: 'Project', name: 'project' },
        { label: 'Dashboard', name: 'dashboard' },
        { label: 'Cloud Service', name: 'cloud-service' },
        { label: 'User', name: 'user' },
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


const handleMoveFocusEnd = () => {
    emit('move-focus-end');
};

const handleUpdateActiveTab = (tab: string) => {
    topBarSearchStore.$patch((_state) => {
        _state.state.activateTab = tab;
    });
};

const handleUpdateContentsSize = (height: number) => {
    state.contentsHeight = height;
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
               :active-tab="state.activeTab"
               :tabs="state.tabs"
               :style="{ height: state.tabHeight ? state.tabHeight + 'px': undefined}"
               @update:activeTab="handleUpdateActiveTab"
        >
            <template #service>
                <top-bar-search-service-tab
                    :search-limit="SEARCH_LIMIT"
                    :focusing-direction="props.focusingDirection"
                    :is-focused="props.isFocused"
                    :style="{ height: state.tabContextHeight ? state.tabContextHeight + 'px': undefined}"
                    @move-focus-end="handleMoveFocusEnd"
                />
            </template>
            <template #service-account>
                <search-tab-content
                    :search-limit="SEARCH_LIMIT"
                    :focusing-direction="props.focusingDirection"
                    :is-focused="props.isFocused"
                    :style="{ height: state.tabContextHeight ? state.tabContextHeight + 'px': undefined}"
                    @move-focus-end="handleMoveFocusEnd"
                    @update:contents-size="handleUpdateContentsSize"
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

    /* custom design-system component - p-data-loader */
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
