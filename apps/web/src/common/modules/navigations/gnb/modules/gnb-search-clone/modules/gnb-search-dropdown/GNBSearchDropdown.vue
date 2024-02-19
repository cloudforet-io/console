<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PTab } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { store } from '@/store';

import type { RecentConfig } from '@/store/modules/recent/type';
import { RECENT_TYPE } from '@/store/modules/recent/type';

import type { SuggestionMenu } from '@/lib/helper/menu-suggestion-helper';
import { getAllSuggestionMenuList } from '@/lib/helper/menu-suggestion-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import type { SuggestionType } from '@/common/modules/navigations/gnb/modules/gnb-search-clone/config';
import GNBSearchServiceTab
    from '@/common/modules/navigations/gnb/modules/gnb-search-clone/modules/gnb-search-dropdown/modules/GNBSearchServiceTab.vue';
import { useTopBarSearchStore } from '@/common/modules/navigations/gnb/modules/gnb-search-clone/store';


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

const topBarSearchStore = useTopBarSearchStore();

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
});

const dataState = reactive({
    recentMenuList: [] as RecentConfig[]|null,
    allMenuList: computed<SuggestionMenu[]>(() => getAllSuggestionMenuList(store.getters['display/allMenuList'])),
    isRecent: computed(() => dataState.recentMenuList?.length > 0),
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
    <div class="gnb-search-dropdown">
        <slot name="search-input" />
        <p-tab :active-tab="state.activeTab"
               :tabs="state.tabs"
               @update:activeTab="handleUpdateActiveTab"
        >
            <template #service>
                <g-n-b-search-service-tab
                    :is-recent="dataState.isRecent"
                    :search-limit="SEARCH_LIMIT"
                    :loading="state.loading"
                    :focusing-direction="props.focusingDirection"
                    :is-focused="props.isFocused"
                    @move-focus-end="handleMoveFocusEnd"
                />
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
    top: 3.125rem;
    left: 0;
    right: 0;
    margin: 0 auto;
    box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.08);
    z-index: 1000;

    /* custom design-system component - p-data-loader */
    :deep(.p-tab) {
        flex-grow: 1;
        .data-loader-container {
            max-height: calc(100vh - $top-bar-height - 5rem);
            min-height: 14.875rem;
            overflow-y: auto;
        }

        .tab-pane {
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
