<template>
    <div class="gnb-search-dropdown">
        <slot name="search-input" />
        <p-data-loader :data="allSelectableItems"
                       :loading="loading"
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
                                          @select="handleSelect"
            />
            <template #no-data>
                <div v-if="isRecent" class="no-data">
                    <img src="@/assets/images/illust_microscope.svg" class="no-data-img" style="width: 7.75rem;">
                    <p class="no-data-text">
                        {{ $t('COMMON.GNB.SEARCH.HELP_TEXT') }}
                    </p>
                </div>
                <div v-else class="no-data">
                    <img src="@/assets/images/illust_ghost.svg" class="no-data-img" style="width: 6.44rem;">
                    <p class="no-data-text">
                        {{ $t('COMMON.GNB.SEARCH.NO_RESULT_1') }} "<em>{{ inputText }}</em>" <br>{{ $t('COMMON.GNB.SEARCH.NO_RESULT_2') }}
                    </p>
                </div>
            </template>
        </p-data-loader>
    </div>
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
    SuggestionType,
    SuggestionItem,
} from '@/common/modules/navigations/gnb/modules/gnb-search/config';

interface Props {
    inputText: string;
    loading: boolean;
    menuItems: SuggestionItem[];
    cloudServiceItems: SuggestionItem[];
    isFocused: boolean;
    focusStartPosition: FocusStartPosition;
    isRecent: boolean;
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
        isRecent: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            suggestionItems: computed<SuggestionItem[]>(() => {
                const results: SuggestionItem[] = [];

                if (props.menuItems.length) {
                    results.push({ name: 'title', label: props.isRecent ? 'RECENT SEARCHES MENU' : 'MENU', type: 'header' });
                    results.push(...props.menuItems);
                }
                if (props.cloudServiceItems.length) {
                    if (results.length !== 0) results.push({ type: 'divider' });
                    results.push({ name: 'title', label: props.isRecent ? 'RECENT SEARCHES CLOUD SERVICE' : 'CLOUD SERVICE', type: 'header' });
                    results.push(...props.cloudServiceItems);
                }
                return results;
            }),
            allSelectableItems: computed<any[]>(() => props.menuItems.concat(props.cloudServiceItems)),
        });

        const emitSelect = (index: number, listType: SuggestionType) => {
            emit('select', index, listType);
        };

        const handleSelect = (item, index) => {
            let numberOfBeforeItems = 0;

            if (props.menuItems.length) {
                numberOfBeforeItems += 1; // title of menu
                if (index < props.menuItems.length + numberOfBeforeItems) {
                    const menuIndex = index - numberOfBeforeItems;
                    emitSelect(menuIndex, 'MENU');
                } else {
                    numberOfBeforeItems += 2; // divider + title of cloud service
                    const cloudServiceIndex = index - props.menuItems.length - numberOfBeforeItems;
                    emitSelect(cloudServiceIndex, 'CLOUD_SERVICE');
                }
                return;
            }

            if (index < props.menuItems.length + numberOfBeforeItems) {
                const menuIndex = index - numberOfBeforeItems;
                emitSelect(menuIndex, 'MENU');
            } else {
                numberOfBeforeItems += 1; // title of cloud service
                const cloudServiceIndex = index - props.menuItems.length - numberOfBeforeItems;
                emitSelect(cloudServiceIndex, 'CLOUD_SERVICE');
            }
        };

        return {
            ...toRefs(state),
            handleSelect,
        };
    },
});
</script>

<style lang="postcss" scoped>
.gnb-search-dropdown {
    @apply absolute bg-white rounded-xs;
    width: 27.5rem;
    min-height: 14.875rem;
    padding: 1rem 0;
    top: 100%;
    right: 0;
    margin-top: 0.25rem;
    box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.08);

    .skeleton-wrapper {
        @apply flex flex-col w-full self-start;
        padding: 0 0.75rem;
    }

    .no-data {
        margin: 2.5rem 0;

        .no-data-img {
            @apply ml-auto mr-auto;
        }

        .no-data-text {
            margin-top: 1.5rem;
            font-size: 0.875rem;
            line-height: 1.5;
            em {
                @apply font-bold;
            }
        }
    }
}

@screen laptop {
    .gnb-search-dropdown {
        margin-top: -0.5rem;
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

        &::v-deep {
            .p-data-loader {
                @apply flex-grow;
                .data-loader-container {
                    @apply flex items-center;
                }
            }
        }
    }
}
</style>
