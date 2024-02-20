<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { useRouter } from 'vue-router/composables';

import { PDivider, getTextHighlightRegex } from '@spaceone/design-system';
import { debounce } from 'lodash';

import { store } from '@/store';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import type { SuggestionMenu } from '@/lib/helper/menu-suggestion-helper';
import { getAllSuggestionMenuList } from '@/lib/helper/menu-suggestion-helper';
import type { MenuInfo } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import { useProxyValue } from '@/common/composables/proxy-state';
import type { SuggestionItem, SuggestionType } from '@/common/modules/navigations/top-bar/modules/gnb-search-clone/config';
import { createSearchRecent } from '@/common/modules/navigations/top-bar/modules/gnb-search-clone/helper';
import GNBSearchWorkspaceFilter
    from '@/common/modules/navigations/top-bar/modules/gnb-search-clone/modules/gnb-search-dropdown/modules/GNBSearchWorkspaceFilter.vue';
import { useTopBarSearchStore } from '@/common/modules/navigations/top-bar/modules/gnb-search-clone/store';
import type { FocusingDirection } from '@/common/modules/navigations/top-bar/modules/gnb-search-clone/type';
import {
    SUGGESTION_TYPE,
} from '@/common/modules/navigations/gnb/modules/gnb-search/config';
import GNBSuggestionList from '@/common/modules/navigations/gnb/modules/GNBSuggestionList.vue';


interface Props {
    loading: boolean;
    isRecent: boolean;
    searchLimit: number;
    isFocused: boolean;
    focusingDirection: string;
}

const props = withDefaults(defineProps<Props>(), {
    loading: true,
    isRecent: false,
    searchLimit: 15,
    isFocused: false,
    focusingDirection: 'DOWNWARD',
});

const userWorkspaceStore = useUserWorkspaceStore();
const topBarSearchStore = useTopBarSearchStore();
const router = useRouter();
const emit = defineEmits<{(event: 'move-focus-end'): void;
}>();

const state = reactive({
    currentWorkspaceId: computed(() => userWorkspaceStore.getters.currentWorkspaceId),
    inputText: computed(() => topBarSearchStore.getters.inputText),
    trimmedInputText: computed(() => topBarSearchStore.getters.trimmedInputText),
    allMenuList: computed<SuggestionMenu[]>(() => getAllSuggestionMenuList(store.getters['display/allMenuList'])),
    serviceMenuList: [] as SuggestionMenu[],
    serviceMenuCount: computed(() => state.serviceMenuList.length),
    defaultServiceMenuList: computed(() => state.allMenuList.filter((menu) => !menu.parents)),
    defaultServiceMenuItems: computed(() => {
        let results: SuggestionItem[] = [];
        if (state.defaultServiceMenuList.length) {
            results.push({ name: 'title', label: 'Site Navigation', type: 'header' });
            results = results.concat(state.defaultServiceMenuList);
        }
        return results;
    }),
    // focus
    proxyFocusingDirection: useProxyValue('focusingDirection', props, emit),
    focusingType: SUGGESTION_TYPE.MENU as SuggestionType,
});

const filterMenuItemsBySearchTerm = (menu: SuggestionMenu[], searchTerm?: string): SuggestionMenu[] => {
    const regex = getTextHighlightRegex(searchTerm);
    const results = menu.map((d) => ({
        id: d.id,
        label: d.label,
        parents: d.parents ? d.parents : undefined,
        icon: d.parents?.[0]?.icon ?? d.icon,
    })).filter((d) => {
        if (regex.test(d.label as string)) return true;
        return d.parents && d.parents.some((p) => regex.test(p.label as string));
    });
    return results.slice(0, props.searchLimit);
};

const handleFocusEnd = (type: SuggestionType, direction: FocusingDirection) => {
    if (type === SUGGESTION_TYPE.MENU && direction === 'DOWNWARD') {
        state.proxyFocusingDirection = direction;
    }
    emit('move-focus-end');
};

const handleSelect = (item) => {
    const menuId = item.id;
    const menuInfo: MenuInfo = MENU_INFO_MAP[menuId];
    if (menuInfo && router.currentRoute.name !== menuId) {
        router.push({ name: menuInfo.routeName }).catch(() => {});
        if (!state.showRecent) createSearchRecent(SUGGESTION_TYPE.MENU, menuId, state.currentWorkspaceId);
    }
    topBarSearchStore.setIsActivated(false);
};

watch(() => state.trimmedInputText, debounce(async (trimmedText) => {
    if (trimmedText) {
        state.serviceMenuList = filterMenuItemsBySearchTerm(state.allMenuList, trimmedText);
    } else {
        state.serviceMenuList = [];
    }
}, 300, {
    leading: true,
}));

// /* Watcher */
// TODO: for focusing
// watch(() => props.isFocused, (isFocused) => {
//     if (isFocused) {
//         if (props.focusingDirection === 'DOWNWARD') {
//             if (state.inputText.length === 0) {
//                 state.focusingType = SUGGESTION_TYPE.MENU;
//         } else {
//             state.focusingType = props.items[props.items.length - 1].itemType;
//         }
//     }
// });
</script>
<template>
    <div class="g-n-b-search-service-tab">
        <div class="service-item-list">
            <g-n-b-suggestion-list v-show="!state.inputText.length"
                                   :items="state.defaultServiceMenuItems || []"
                                   :input-text="state.inputText"
                                   :is-focused="state.focusingType === SUGGESTION_TYPE.MENU ? props.isFocused : false"
                                   :focusing-direction="props.focusingDirection"
                                   @move-focus-end="handleFocusEnd(SUGGESTION_TYPE.MENU, ...arguments)"
                                   @select="handleSelect"
            />
            <g-n-b-suggestion-list v-show="!state.inputText.length"
                                   :items="state.defaultServiceMenuItems || []"
                                   :input-text="state.inputText"
                                   :is-focused="state.focusingType === SUGGESTION_TYPE.MENU ? props.isFocused : false"
                                   :focusing-direction="props.focusingDirection"
                                   @move-focus-end="handleFocusEnd(SUGGESTION_TYPE.MENU, ...arguments)"
                                   @select="handleSelect"
            />
            <g-n-b-suggestion-list v-show="!state.inputText.length"
                                   :items="state.defaultServiceMenuItems || []"
                                   :input-text="state.inputText"
                                   :is-focused="state.focusingType === SUGGESTION_TYPE.MENU ? props.isFocused : false"
                                   :focusing-direction="props.focusingDirection"
                                   @move-focus-end="handleFocusEnd(SUGGESTION_TYPE.MENU, ...arguments)"
                                   @select="handleSelect"
            />
            <g-n-b-suggestion-list v-show="!state.inputText.length"
                                   :items="state.defaultServiceMenuItems || []"
                                   :input-text="state.inputText"
                                   :is-focused="state.focusingType === SUGGESTION_TYPE.MENU ? props.isFocused : false"
                                   :focusing-direction="props.focusingDirection"
                                   @move-focus-end="handleFocusEnd(SUGGESTION_TYPE.MENU, ...arguments)"
                                   @select="handleSelect"
            />
            <!--TODO: Recent List-->
            <div v-if="state.inputText && state.serviceMenuCount > props.searchLimit"
                 class="too-many-results-wrapper"
            >
                <div class="dim-wrapper" />
                <p>{{ $t('COMMON.GNB.SEARCH.TOO_MANY_RESULTS') }} <br> {{ $t('COMMON.GNB.SEARCH.TRY_SEARCH_AGAIN') }}</p>
            </div>
        </div>
        <p-divider vertical />
        <g-n-b-search-workspace-filter class="filter" />
    </div>
</template>

<style scoped lang="postcss">
.g-n-b-search-service-tab {
    @apply flex gap-3 h-full;
    padding: 1rem 0;
    height: 100%;

    .service-item-list {
        height: 100%;
        width: 100%;
        overflow-y: auto;
    }

    .too-many-results-wrapper {
        @apply text-gray-400;
        font-size: 0.75rem;
        line-height: 1.5;
        text-align: center;
        padding: 1rem 0.75rem;

        .dim-wrapper {
            position: relative;
            background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, white 100%);
            height: 2rem;
            pointer-events: none;
            margin-top: -3rem;
            margin-bottom: 1rem;
        }
    }

    .filter {
        width: 13.25rem;
    }
}
</style>
