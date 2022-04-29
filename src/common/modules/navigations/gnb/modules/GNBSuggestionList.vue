<template>
    <p-context-menu ref="contextMenuRef"
                    class="gnb-search-suggestion-list"
                    :menu="items"
                    @keyup:up:end="$emit('move-focus-end')"
                    @keyup:down:end="$emit('move-focus-end')"
                    @keyup:esc="$emit('close')"
                    @focus="$emit('update:isFocused', true)"
                    @blur="$emit('update:isFocused', false)"
                    @select="handleSelect"
    >
        <template #header-title="{ item }">
            <div class="context-header">
                {{ item.label }}
            </div>
        </template>
        <template #item--format="{ item }">
            <div class="suggestion-item">
                <div class="left-part">
                    <p-lazy-img v-if="item.itemType === SUGGESTION_TYPE.CLOUD_SERVICE"
                                :src="item.icon || ''"
                                width="1rem" height="1rem"
                                class="ic-lazy-img"
                    />
                    <p-i v-else
                         :name="item.icon"
                         width="1rem" height="1rem"
                         class="mr-1"
                    />
                    <span>
                        <template v-if="item.parents">
                            <span v-for="(parent, pIdx) in item.parents" :key="`parents-${pIdx}`">
                                <span v-for="({text, matched}, i) in getTextList(parent.label)"
                                      :key="`parent-label-${text}-${i}`"
                                >
                                    <span :class="{'matched-character': matched}">{{ text }}</span>
                                </span>
                                <p-i name="ic_breadcrumb_arrow" width="1rem" height="1rem" />
                            </span>
                        </template>
                        <span v-for="({text, matched}, i) in getTextList(item.label)"
                              :key="`label-${text}-${i}`"
                        >
                            <span :class="{'matched-character': matched}">{{ text }}</span>
                        </span>
                    </span>
                </div>
                <favorite-button v-if="useFavorite"
                                 :item-id="item.name"
                                 :favorite-type="item.itemType"
                                 scale="0.65"
                />
            </div>
        </template>
        <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
            <slot :name="slot" v-bind="scope" />
        </template>
    </p-context-menu>
</template>

<script lang="ts">
import {
    computed,
    defineComponent, PropType,
    reactive, toRefs, watch,
} from '@vue/composition-api';

import { PContextMenu, PI, PLazyImg } from '@spaceone/design-system';
import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';

import {
    focusStartPositions,
    FocusStartPosition,
    SuggestionItem, SUGGESTION_TYPE,
} from '@/common/modules/navigations/gnb/modules/gnb-search/config';


interface Props {
    items: SuggestionItem[];
    inputText: string;
    isFocused: boolean;
    focusStartPosition: FocusStartPosition;
    useFavorite: boolean;
}

export default defineComponent<Props>({
    name: 'GNBSuggestionList',
    components: {
        FavoriteButton,
        PContextMenu,
        PLazyImg,
        PI,
    },
    props: {
        items: {
            type: Array as PropType<SuggestionItem[]>,
            default: () => [],
        },
        inputText: {
            type: String,
            default: '',
        },
        isFocused: {
            type: Boolean,
            default: false,
        },
        focusStartPosition: {
            type: String as PropType<FocusStartPosition>,
            default: 'START',
            validator(position: FocusStartPosition) {
                return focusStartPositions.includes(position);
            },
        },
        useFavorite: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            contextMenuRef: null as null | any,
            searchRegex: computed(() => {
                let regex = '';
                if (props.inputText) {
                    // remove spaces in the search term
                    const text = props.inputText.replace(/\s/g, '');
                    for (let i = 0; i < text.length; i++) {
                        regex += text[i];
                        // add space regex after every single character to find matching keywords ignoring spaces
                        if (i < text.length - 1) regex += '\\s*';
                    }
                }
                return new RegExp(regex, 'i');
            }),
        });

        const getFirstMatchedString = (str: string): string => {
            const matched = state.searchRegex.exec(str);
            if (matched?.index === 0) {
                return matched[0];
            }
            return '';
        };

        const getTextList = (str = ''): {text: string; matched: boolean}[] => {
            if (!props.inputText?.trim()) return [{ text: str, matched: false }];

            const regex = state.searchRegex;
            const unmatchedTexts = str.split(regex);
            const textList: {text: string; matched: boolean}[] = [];

            let remainedStr = str;

            const setMatchedItem = () => {
                const text = getFirstMatchedString(remainedStr);
                if (text) {
                    textList.push({ text, matched: true });
                    remainedStr = remainedStr.slice(text.length);
                }
            };

            setMatchedItem();
            unmatchedTexts.forEach((t) => {
                if (t) {
                    textList.push({ text: t, matched: false });
                    remainedStr = remainedStr.slice(t.length);
                }
                if (remainedStr) {
                    setMatchedItem();
                }
            });

            return textList;
        };

        const handleSelect = (item, index) => {
            emit('select', item, index);
        };

        watch(() => props.isFocused, (isFocused) => {
            if (!state.contextMenuRef) return;
            if (!isFocused) return;
            if (props.focusStartPosition === 'START') {
                state.contextMenuRef.focus(0);
            } else {
                state.contextMenuRef.focus(-1);
            }
        });

        return {
            ...toRefs(state),
            SUGGESTION_TYPE,
            getTextList,
            handleSelect,
        };
    },
});
</script>

<style lang="postcss" scoped>
.gnb-search-suggestion-list {
    @apply bg-white border-none;
    padding-left: 0.75rem;
    padding-right: 0.75rem;
    padding-bottom: 0.125rem;
    max-height: unset;

    &::v-deep {
        .context-header {
            margin-top: 0;
            margin-bottom: 0.25rem;
            padding-left: 0.5rem;
            padding-right: 0.5rem;
        }

        .suggestion-item {
            display: flex;
            justify-content: space-between;
            width: 100%;
            align-items: center;
            .left-part {
                display: flex;
                align-items: center;
            }
        }

        .context-item {
            justify-content: flex-start;
            line-height: 1.75;
            padding: 0.25rem 0.5rem;

            &:focus {
                @apply border border-blue-400 rounded-xs;
                box-shadow: 0 0 0 0.125rem rgba(73, 167, 247, 0.2);
                outline: none;

                &:not(:hover):not(.disabled):not(.empty) {
                    @apply bg-white;
                }
            }

            .ic-lazy-img {
                margin-right: 0.25rem;
            }
        }

        .context-divider {
            margin: 0.875rem -0.75rem 1rem;
        }
    }

    .matched-character {
        @apply text-blue-700 bg-blue-200;
    }
}
</style>
