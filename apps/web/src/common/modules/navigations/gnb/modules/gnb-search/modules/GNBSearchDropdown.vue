<script lang="ts" setup>
import { PDataLoader, PEmpty } from '@spaceone/design-system';
import {
    computed,
    reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';

import { useProxyValue } from '@/common/composables/proxy-state';
import type { SuggestionItem, SuggestionType } from '@/common/modules/navigations/gnb/modules/gnb-search/config';
import { SUGGESTION_TYPE } from '@/common/modules/navigations/gnb/modules/gnb-search/config';
import type {
    DropdownItem, FocusingDirection,
} from '@/common/modules/navigations/gnb/modules/gnb-search/type';
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
const emit = defineEmits<{(e: 'close'): void;
    (e: 'focusingDirection', value: FocusingDirection): void;
    (e: 'select', index: number, value?: SuggestionType): void;
    (e: 'move-focus-end'): void;
}>();
const { t } = useI18n();

const state = reactive({
    menuTotalCount: computed<undefined|number>(() => props.items?.find((d) => d.itemType === SUGGESTION_TYPE.MENU)?.totalCount),
    cloudServiceTotalCount: computed<undefined|number>(() => props.items?.find((d) => d.itemType === SUGGESTION_TYPE.CLOUD_SERVICE)?.totalCount),
    menuSuggestionItems: computed<SuggestionItem[]|null>(() => {
        const menuItems = props.items?.find((d) => d.itemType === SUGGESTION_TYPE.MENU);
        if (!menuItems?.suggestionItems) return null;

        let results: SuggestionItem[] = [];
        if (menuItems.suggestionItems.length) {
            results.push({ name: 'title', label: props.isRecent ? t('COMMON.GNB.SEARCH.RECENT_MENU') : t('COMMON.GNB.SEARCH.MENU'), type: 'header' });
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
            results.push({ name: 'title', label: props.isRecent ? t('COMMON.GNB.SEARCH.RECENT_CLOUD_SERVICE') : t('COMMON.GNB.SEARCH.CLOUD_SERVICE'), type: 'header' });
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

/* Event */
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
const handleClose = () => {
    emit('close');
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
    <div class="gnb-search-dropdown">
        <slot name="search-input" />
        <p-data-loader :data="state.allItems"
                       :loading="loading"
        >
            <g-n-b-suggestion-list v-show="state.menuSuggestionItems && state.menuSuggestionItems.length > 0"
                                   :items="state.menuSuggestionItems || []"
                                   :input-text="inputText"
                                   :is-focused="state.focusingType === SUGGESTION_TYPE.MENU ? isFocused : false"
                                   :focusing-direction="focusingDirection"
                                   @move-focus-end="handleFocusEnd(SUGGESTION_TYPE.MENU, $event)"
                                   @close="handleClose"
                                   @select="handleSelect"
            />
            <div v-if="inputText && state.menuTotalCount > searchLimit"
                 class="too-many-results-wrapper"
            >
                <div class="dim-wrapper" />
                <p>{{ t('COMMON.GNB.SEARCH.TOO_MANY_RESULTS') }} <br> {{ t('COMMON.GNB.SEARCH.TRY_SEARCH_AGAIN') }}</p>
            </div>
            <g-n-b-suggestion-list v-show="state.cloudServiceSuggestionItems && state.cloudServiceSuggestionItems.length > 0"
                                   :items="state.cloudServiceSuggestionItems || []"
                                   :input-text="inputText"
                                   :is-focused="state.ocusingType === SUGGESTION_TYPE.CLOUD_SERVICE ? isFocused : false"
                                   :focusing-direction="focusingDirection"
                                   @move-focus-end="handleFocusEnd(SUGGESTION_TYPE.CLOUD_SERVICE, $event)"
                                   @close="handleClose"
                                   @select="handleSelect"
            />
            <div v-if="inputText && state.cloudServiceTotalCount > searchLimit"
                 class="too-many-results-wrapper"
            >
                <div class="dim-wrapper" />
                <p>{{ t('COMMON.GNB.SEARCH.TOO_MANY_RESULTS') }} <br> {{ t('COMMON.GNB.SEARCH.TRY_SEARCH_AGAIN') }}</p>
            </div>
            <template #no-data>
                <p-empty
                    v-if="isRecent"
                    show-image
                    image-size="md"
                >
                    <template #image>
                        <img src="@/assets/images/illust_microscope.svg"
                             alt="empty-image"
                        >
                    </template>
                    {{ t('COMMON.GNB.SEARCH.HELP_TEXT') }}
                </p-empty>
                <p-empty
                    v-if="inputText"
                    show-image
                >
                    <template #image>
                        <img src="@/assets/images/illust_ghost.svg"
                             alt="empty-image"
                        >
                    </template>
                    <p class="no-data-text">
                        <i18n-t keypath="COMMON.GNB.SEARCH.NO_RESULT_1">
                            <template #inputText>
                                <em>{{ inputText }}</em>
                            </template>
                        </i18n-t>
                        <br>{{ t('COMMON.GNB.SEARCH.NO_RESULT_2') }}
                    </p>
                </p-empty>
            </template>
        </p-data-loader>
    </div>
</template>

<style lang="postcss" scoped>
.gnb-search-dropdown {
    @apply absolute bg-white rounded-xs border border-gray-200;
    display: flex;
    flex-direction: column;
    width: 27.5rem;
    padding-top: 1rem;
    top: 100%;
    right: 0;
    margin-top: 0.25rem;
    box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.08);

    /* custom design-system component - p-data-loader */
    :deep(.p-data-loader) {
        flex-grow: 1;
        .data-loader-container {
            max-height: calc(100vh - $gnb-height - 5rem);
            min-height: 14.875rem;
            overflow-y: auto;
            padding-bottom: 1rem;
        }
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
}

@screen laptop {
    .gnb-search-dropdown {
        margin-top: -0.5rem;
        margin-right: -0.5rem;
    }
}

@screen mobile {
    .gnb-search-dropdown {
        @apply flex flex-col;
        position: fixed;
        top: $gnb-height;
        width: 100vw;
        height: calc(100vh - $gnb-height - 0.5rem);
        margin-top: -0.375rem;

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
