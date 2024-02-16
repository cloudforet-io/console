<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import { PDivider, PDataLoader } from '@spaceone/design-system';

import { i18n as _i18n } from '@/translations';

import { useProxyValue } from '@/common/composables/proxy-state';
import GNBSearchEmpty
    from '@/common/modules/navigations/gnb/modules/gnb-search-clone/modules/gnb-search-dropdown/modules/GNBSearchEmpty.vue';
import GNBSearchWorkspaceFilter
    from '@/common/modules/navigations/gnb/modules/gnb-search-clone/modules/gnb-search-dropdown/modules/GNBSearchWorkspaceFilter.vue';
import {
    SUGGESTION_TYPE,
} from '@/common/modules/navigations/gnb/modules/gnb-search/config';
import type {
    SuggestionItem,
    SuggestionType,
} from '@/common/modules/navigations/gnb/modules/gnb-search/config';
import type { DropdownItem, FocusingDirection } from '@/common/modules/navigations/gnb/modules/gnb-search/type';
import GNBSuggestionList from '@/common/modules/navigations/gnb/modules/GNBSuggestionList.vue';


interface Props {
    inputText: string;
    loading: boolean;
    items: DropdownItem[];
    isFocused: boolean;
    focusingDirection: FocusingDirection;
    isRecent: boolean;
    searchLimit: number;
}

const props = withDefaults(defineProps<Props>(), {
    inputText: '',
    loading: true,
    items: () => [],
    isFocused: false,
    focusingDirection: undefined,
    isRecent: false,
    searchLimit: 15,
});

const emit = defineEmits<{(event: 'select', index: number, type?: SuggestionType): void;
    (event: 'move-focus-end'): void;
}>();

const state = reactive({
    menuTotalCount: computed<undefined|number>(() => props.items?.find((d) => d.itemType === SUGGESTION_TYPE.MENU)?.totalCount),
    cloudServiceTotalCount: computed<undefined|number>(() => props.items?.find((d) => d.itemType === SUGGESTION_TYPE.CLOUD_SERVICE)?.totalCount),
    menuSuggestionItems: computed<SuggestionItem[]|null>(() => {
        const menuItems = props.items?.find((d) => d.itemType === SUGGESTION_TYPE.MENU);
        if (!menuItems?.suggestionItems) return null;

        let results: SuggestionItem[] = [];
        if (menuItems.suggestionItems.length) {
            results.push({ name: 'title', label: props.isRecent ? _i18n.t('COMMON.GNB.SEARCH.RECENT_MENU') : _i18n.t('COMMON.GNB.SEARCH.MENU'), type: 'header' });
            results = results.concat(menuItems.suggestionItems);
        }
        return results;
    }),
    cloudServiceSuggestionItems: computed<SuggestionItem[]|null>(() => {
        const cloudServiceItems = props.items?.find((d) => d.itemType === SUGGESTION_TYPE.CLOUD_SERVICE);
        if (!cloudServiceItems?.suggestionItems) return null;

        let results: SuggestionItem[] = [];
        if (cloudServiceItems.suggestionItems.length) {
            if (state.menuSuggestionItems?.length) results.push({ type: 'divider' });
            results.push({ name: 'title', label: props.isRecent ? _i18n.t('COMMON.GNB.SEARCH.RECENT_CLOUD_SERVICE') : _i18n.t('COMMON.GNB.SEARCH.CLOUD_SERVICE'), type: 'header' });
            results = results.concat(cloudServiceItems.suggestionItems);
        }
        return results;
    }),
    allItems: computed(() => {
        if (state.cloudServiceSuggestionItems && state.menuSuggestionItems) return [...state.cloudServiceSuggestionItems, ...state.menuSuggestionItems];
        return null;
    }),
    // focus
    proxyFocusingDirection: useProxyValue('focusingDirection', props, emit),
    focusingType: SUGGESTION_TYPE.MENU as SuggestionType,
});

const handleSelect = (item: SuggestionItem, index: number) => {
    let itemIndex = index - 1; // extract header
    if (item.itemType === SUGGESTION_TYPE.CLOUD_SERVICE && state.menuSuggestionItems?.length) itemIndex -= 1; // extract divider
    emit('select', itemIndex, item.itemType);
};
const handleFocusEnd = (type: SuggestionType, direction: FocusingDirection) => {
    if (type === SUGGESTION_TYPE.MENU) {
        if (direction === 'DOWNWARD' && state.cloudServiceSuggestionItems?.length) {
            state.proxyFocusingDirection = direction;
            state.focusingType = SUGGESTION_TYPE.CLOUD_SERVICE;
        } else {
            emit('move-focus-end');
        }
    } else if (type === SUGGESTION_TYPE.CLOUD_SERVICE) {
        if (direction === 'UPWARD' && state.menuSuggestionItems?.length) {
            state.proxyFocusingDirection = direction;
            state.focusingType = SUGGESTION_TYPE.MENU;
        } else {
            emit('move-focus-end');
        }
    }
};

/* Watcher */
watch(() => props.isFocused, (isFocused) => {
    if (isFocused) {
        if (props.focusingDirection === 'DOWNWARD') {
            state.focusingType = props.items[0].itemType;
        } else {
            state.focusingType = props.items[props.items.length - 1].itemType;
        }
    }
});
</script>
<template>
    <div class="g-n-b-search-service-tab">
        <p-data-loader :data="state.allItems"
                       :loading="props.loading"
        >
            <g-n-b-suggestion-list v-show="state.menuSuggestionItems && state.menuSuggestionItems.length > 0"
                                   :items="state.menuSuggestionItems || []"
                                   :input-text="props.inputText"
                                   :is-focused="state.focusingType === SUGGESTION_TYPE.MENU ? props.isFocused : false"
                                   :focusing-direction="props.focusingDirection"
                                   @move-focus-end="handleFocusEnd(SUGGESTION_TYPE.MENU, ...arguments)"
                                   @close="$emit('close')"
                                   @select="handleSelect"
            />
            <div v-if="props.inputText && state.menuTotalCount > props.searchLimit"
                 class="too-many-results-wrapper"
            >
                <div class="dim-wrapper" />
                <p>{{ $t('COMMON.GNB.SEARCH.TOO_MANY_RESULTS') }} <br> {{ $t('COMMON.GNB.SEARCH.TRY_SEARCH_AGAIN') }}</p>
            </div>
            <g-n-b-suggestion-list v-show="state.cloudServiceSuggestionItems && state.cloudServiceSuggestionItems.length > 0"
                                   :items="state.cloudServiceSuggestionItems || []"
                                   :input-text="props.inputText"
                                   :is-focused="state.focusingType === SUGGESTION_TYPE.CLOUD_SERVICE ? isFocused : false"
                                   :focusing-direction="props.focusingDirection"
                                   @move-focus-end="handleFocusEnd(SUGGESTION_TYPE.CLOUD_SERVICE, ...arguments)"
                                   @close="$emit('close')"
                                   @select="handleSelect"
            />
            <div v-if="props.inputText && state.cloudServiceTotalCount > props.searchLimit"
                 class="too-many-results-wrapper"
            >
                <div class="dim-wrapper" />
                <p>{{ $t('COMMON.GNB.SEARCH.TOO_MANY_RESULTS') }} <br> {{ $t('COMMON.GNB.SEARCH.TRY_SEARCH_AGAIN') }}</p>
            </div>
            <template #no-data>
                <g-n-b-search-empty :input-text="props.inputText"
                                    :is-recent="props.isRecent"
                />
            </template>
        </p-data-loader>
        <p-divider vertical />
        <g-n-b-search-workspace-filter class="filter" />
    </div>
</template>

<style scoped lang="postcss">
.g-n-b-search-service-tab {
    @apply flex gap-3 h-full;
    padding: 1rem 0;
    height: 100%;

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
