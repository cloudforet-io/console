<template>
    <p-data-loader :data="allSelectableItems"
                   :loading="loading"
                   class="gnb-search-dropdown"
    >
        <template #loader>
            <div class="skeleton-wrapper">
                <p-skeleton width="36%" height="1rem" class="mb-2" />
                <p-skeleton width="100%" height="2rem" />
            </div>
        </template>
        <g-n-b-search-suggestion-list :items="suggestionItems"
                                      :input-text="inputText"
                                      :is-focused="isFocused"
                                      :focus-start-position="focusStartPosition"
                                      @update:isFocused="$emit('update:isFocused', $event)"
                                      @move-focus-end="$emit('move-focus-end')"
                                      @close="$emit('close')"
        />
        <template #no-data>
            <div v-if="inputText" class="no-data">
                <img src="@/assets/images/illust_ghost.svg" class="no-data-img">
                <p class="no-data-text">
                    Search for navigation menus or cloud services.
                </p>
            </div>
            <div v-else class="no-data">
                <img src="@/assets/images/illust_microscope.svg" class="no-data-img">
                <p class="no-data-text">
                    No result found for "<em>search keyword</em>" <br>Try again with different term.
                </p>
            </div>
        </template>
    </p-data-loader>
</template>

<script lang="ts">
import {
    computed,
    defineComponent, PropType,
    reactive, toRefs,
} from '@vue/composition-api';
import GNBSearchSuggestionList from '@/common/modules/navigations/gnb/modules/gnb-search/modules/GNBSearchSuggestionList.vue';
import { PDataLoader, PDivider, PSkeleton } from '@spaceone/design-system';
import {
    FocusStartPosition,
    SuggestionItem,
} from '@/common/modules/navigations/gnb/modules/gnb-search/config';

interface Props {
    inputText: string;
    loading: boolean;
    menuItems: SuggestionItem[];
    cloudServiceItems: SuggestionItem[];
    isFocused: boolean;
    focusStartPosition: FocusStartPosition;
}

export default defineComponent<Props>({
    name: 'GNBSearchDropdown',
    components: {
        GNBSearchSuggestionList,
        PDivider,
        PDataLoader,
        PSkeleton,
    },
    props: {
        inputText: {
            type: String,
            default: '',
        },
        loading: {
            type: Boolean,
            default: false,
        },
        menuItems: {
            type: Array as PropType<SuggestionItem[]>,
            default: () => [],
        },
        cloudServiceItems: {
            type: Array as PropType<SuggestionItem[]>,
            default: () => [],
        },
        isFocused: {
            type: Boolean,
            default: false,
        },
        focusStartPosition: {
            type: String as PropType<FocusStartPosition>,
            default: 'START',
        },
    },
    setup(props) {
        const state = reactive({
            suggestionItems: computed<SuggestionItem[]>(() => [
                { name: 'title', label: 'RECENT SEARCHES MENU', type: 'header' },
                ...props.menuItems,
                { type: 'divider' },
                { name: 'title', label: 'RECENT SEARCHES CLOUD SERVICE', type: 'header' },
                ...props.cloudServiceItems,
            ] as SuggestionItem[]),
            allSelectableItems: computed<any[]>(() => props.menuItems.concat(props.cloudServiceItems)),
        });

        return {
            ...toRefs(state),
        };
    },
});
</script>

<style lang="postcss" scoped>
.gnb-search-dropdown {
    @apply bg-white;
    width: 27.5rem;
    padding: 0 0.75rem;
    min-height: 14.875rem;
    .skeleton-wrapper {
        @apply flex flex-col w-full self-start;
    }
    .no-data {
        padding: 2.5rem 0;
        .no-data-img {
            @apply ml-auto mr-auto;
        }
        .no-data-text {
            margin-top: 1.5rem;
            font-size: 0.875rem;
            em {
                @apply font-bold;
            }
        }
    }
}
</style>
