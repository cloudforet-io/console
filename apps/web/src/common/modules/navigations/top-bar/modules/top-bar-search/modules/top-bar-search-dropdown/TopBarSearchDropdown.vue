<script setup lang="ts">
import { useElementSize, useWindowSize } from '@vueuse/core';
import type Vue from 'vue';
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router/composables';
import type { Location } from 'vue-router/types/router';

import {
    PTab, PTextHighlighting, PI, PLink, screens,
} from '@spaceone/design-system';
import { clone } from 'lodash';

import type { MenuId } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';
import SearchTabContent
    from '@/common/modules/navigations/top-bar/modules/top-bar-search/modules/top-bar-search-dropdown/modules/SearchTabContent.vue';
import TopBarSearchServiceTab
    from '@/common/modules/navigations/top-bar/modules/top-bar-search/modules/top-bar-search-dropdown/modules/TopBarSearchServiceTab.vue';
import type { SearchTab } from '@/common/modules/navigations/top-bar/modules/top-bar-search/store';
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
const router = useRouter();


const getTabHeaderHeight = () => {
    const tabHeaderHeight = tabRef.value?.$el.firstElementChild?.clientHeight;
    if (tabHeaderHeight) return (tabHeaderHeight + 4) ?? 0;
    return 0;
};

const storeState = reactive({
    workspaceMap: computed(() => topBarSearchStore.storeState.workspaceMap),
    currentWorkspaceId: computed(() => topBarSearchStore.storeState.currentWorkspaceId),
});

const state = reactive({
    activeTab: computed(() => topBarSearchStore.state.activateTab),
    tabs: [
        { label: 'Service', name: 'service' },
        { label: 'Service Account', name: 'serviceAccount' },
        { label: 'Project', name: 'project' },
        { label: 'Dashboard', name: 'dashboard' },
        { label: 'Cloud Service', name: 'cloudService' },
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

const handleUpdateActiveTab = (tab: SearchTab) => {
    topBarSearchStore.$patch((_state) => {
        _state.state.activateTab = tab;
    });
};

const handleUpdateContentsSize = (height: number) => {
    state.contentsHeight = height;
};

const handleClickLink = (workspaceId:string) => {
    topBarSearchStore.setIsActivated(false);
    router.push(getTargetWorkspaceRoute(workspaceId));
};

const getTargetWorkspaceRoute = (workspaceId: string): Location => {
    const reversedMatched = clone(router.currentRoute.matched).reverse();
    const closestRoute = reversedMatched.find((d) => d.meta?.menuId !== undefined);
    const targetMenuId: MenuId = closestRoute?.meta?.menuId || MENU_ID.HOME_DASHBOARD;
    return { name: MENU_INFO_MAP[targetMenuId].routeName, params: { workspaceId } };
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
            <template #serviceAccount>
                <search-tab-content
                    :search-limit="SEARCH_LIMIT"
                    :focusing-direction="props.focusingDirection"
                    :is-focused="props.isFocused"
                    :style="{ height: state.tabContextHeight ? state.tabContextHeight + 'px': undefined}"
                    @move-focus-end="handleMoveFocusEnd"
                    @update:contents-size="handleUpdateContentsSize"
                >
                    <template #item-format="{item}">
                        <div class="service-account-item">
                            <div class="icon-background">
                                <p-i name="ic_service_service-account"
                                     width="1.25rem"
                                     height="1.25rem"
                                />
                            </div>
                            <div class="main-box">
                                <p-text-highlighting class="text-item"
                                                     :term="topBarSearchStore.getters.trimmedInputText"
                                                     :text="item?.name"
                                />
                                <div v-if="item?.workspace_id !== storeState.currentWorkspaceId"
                                     class="context-lower"
                                >
                                    <div class="left-part">
                                        <workspace-logo-icon :text="storeState.workspaceMap[item?.workspace_id]?.label"
                                                             :theme="storeState.workspaceMap[item?.workspace_id]?.data?.tags?.theme"
                                                             size="xxs"
                                        />
                                        <p-link new-tab
                                                action-icon="internal-link"
                                        >
                                            <span class="label"
                                                  @click="handleClickLink(item?.workspace_id)"
                                            >{{ storeState.workspaceMap[item?.workspace_id]?.label }}</span>
                                        </p-link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </search-tab-content>
            </template>
            <template #project>
                <search-tab-content
                    :search-limit="SEARCH_LIMIT"
                    :focusing-direction="props.focusingDirection"
                    :is-focused="props.isFocused"
                    :style="{ height: state.tabContextHeight ? state.tabContextHeight + 'px': undefined}"
                    @move-focus-end="handleMoveFocusEnd"
                    @update:contents-size="handleUpdateContentsSize"
                >
                    <template #item-format="{item}">
                        <div>{{ item?.name }}</div>
                    </template>
                </search-tab-content>
            </template>
            <template #dashboard>
                <search-tab-content
                    :search-limit="SEARCH_LIMIT"
                    :focusing-direction="props.focusingDirection"
                    :is-focused="props.isFocused"
                    :style="{ height: state.tabContextHeight ? state.tabContextHeight + 'px': undefined}"
                    @move-focus-end="handleMoveFocusEnd"
                    @update:contents-size="handleUpdateContentsSize"
                >
                    <template #item-format="{item}">
                        <div>{{ item?.name }}</div>
                    </template>
                </search-tab-content>
            </template>
            <template #cloudService>
                <search-tab-content
                    :search-limit="SEARCH_LIMIT"
                    :focusing-direction="props.focusingDirection"
                    :is-focused="props.isFocused"
                    :style="{ height: state.tabContextHeight ? state.tabContextHeight + 'px': undefined}"
                    @move-focus-end="handleMoveFocusEnd"
                    @update:contents-size="handleUpdateContentsSize"
                >
                    <template #item-format="{item}">
                        <div>{{ item?.name }}</div>
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

    .service-account-item {
        display: flex;
        align-items: center;
        height: 2rem;
        .icon-background {
            @apply flex items-center justify-center bg-gray-100 rounded-md;
            margin-right: 0.375rem;
        }

        .main-box {
            @apply flex flex-col;
                line-height: 1.125rem;

            .context-lower {
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
