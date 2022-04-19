<template>
    <div class="gnb-search-dropdown">
        <slot name="search-input" />
        <p-data-loader :data="allSelectableItems"
                       :loading="loading"
        >
            <g-n-b-suggestion-list :items="suggestionItems"
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
                    <img src="@/assets/images/illust_microscope.svg" class="img-help">
                    <p class="no-data-text">
                        {{ $t('COMMON.GNB.SEARCH.HELP_TEXT') }}
                    </p>
                </div>
                <div v-else class="no-data">
                    <img src="@/assets/images/illust_ghost.svg" class="img-no-data">
                    <p class="no-data-text">
                        <i18n path="COMMON.GNB.SEARCH.NO_RESULT_1">
                            <template #inputText>
                                <em>{{ inputText }}</em>
                            </template>
                        </i18n>
                        <br>{{ $t('COMMON.GNB.SEARCH.NO_RESULT_2') }}
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
import GNBSuggestionList from '@/common/modules/navigations/gnb/modules/GNBSuggestionList.vue';
import { PDataLoader, PDivider } from '@spaceone/design-system';
import {
    FocusStartPosition,
    SuggestionItem, SUGGESTION_TYPE,
} from '@/common/modules/navigations/gnb/modules/gnb-search/config';
import { i18n } from '@/translations';

interface Props {
    inputText: string;
    loading: boolean;
    menuItems: SuggestionItem[];
    cloudServiceTypeItems: SuggestionItem[];
    isFocused: boolean;
    focusStartPosition: FocusStartPosition;
    isRecent: boolean;
}

export default defineComponent<Props>({
    name: 'GNBSearchDropdown',
    components: {
        GNBSuggestionList,
        PDivider,
        PDataLoader,
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
        cloudServiceTypeItems: {
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
                    results.push({ name: 'title', label: props.isRecent ? i18n.t('COMMON.GNB.SEARCH.RECENT_MENU') : i18n.t('COMMON.GNB.SEARCH.MENU'), type: 'header' });
                    results.push(...props.menuItems);
                }
                if (props.cloudServiceTypeItems.length) {
                    if (results.length !== 0) results.push({ type: 'divider' });
                    results.push({ name: 'title', label: props.isRecent ? i18n.t('COMMON.GNB.SEARCH.RECENT_CLOUD_SERVICE') : i18n.t('COMMON.GNB.SEARCH.CLOUD_SERVICE'), type: 'header' });
                    results.push(...props.cloudServiceTypeItems);
                }
                return results;
            }),
            allSelectableItems: computed<any[]>(() => props.menuItems.concat(props.cloudServiceTypeItems)),
        });

        const emitSelect = (index: number, listType: SUGGESTION_TYPE) => {
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
    @apply absolute bg-white rounded-xs border border-gray-200;
    display: flex;
    flex-direction: column;
    width: 27.5rem;
    padding: 1rem 0;
    top: 100%;
    right: 0;
    margin-top: 0.25rem;
    box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.08);

    .p-data-loader {
        flex-grow: 1;
        height: 100%;
    }

    .no-data {
        margin: 2.5rem 0;

        > img {
            @apply ml-auto mr-auto;

            &.img-help {
                width: 7.75rem;
                opacity: 0.7;
            }

            &.img-no-data {
                width: 6.44rem;
                opacity: 0.5;
            }
        }

        .no-data-text {
            @apply text-gray-400;
            margin-top: 1.5rem;
            font-size: 0.875rem;
            line-height: 1.5;
            em {
                @apply font-bold text-gray-500;
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
                    .data-wrapper {
                        width: 100%;
                    }
                }
            }
        }
    }
}
</style>
