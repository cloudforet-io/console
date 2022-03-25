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
            <div :key="index" class="context-header">
                {{ item.label }}
            </div>
        </template>
        <template #item--format="{ item }">
            <p-lazy-img v-if="item.icon || item.defaultIcon"
                        :src="item.icon || ''"
                        :error-icon="item.defaultIcon"
                        width="1rem" height="1rem"
            />
            <span>
                <template v-if="item.parents">
                    <template v-for="parent in item.parents">
                        <span v-for="(text, i) in parent.label.split(searchRegex)"
                              :key="`parent-label-${text}-${i}`"
                        >
                            <span v-if="i !== 0"
                                  class="matched-character"
                            >{{ getMatchText(parent.label) }}</span><span>{{ text }}</span>
                        </span>
                        <p-i :key="item.name + parent.name + 'arrow'" name="ic_breadcrumb_arrow" />
                    </template>
                </template>
                <span v-for="(text, i) in item.label.split(searchRegex)"
                      :key="`label-${text}-${i}`"
                >
                    <span v-if="i !== 0"
                          class="matched-character"
                    >{{ getMatchText(item.label) }}</span><span>{{ text }}</span>
                </span>
            </span>
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
import {
    focusStartPositions,
    FocusStartPosition,
    SuggestionItem,
} from '@/common/modules/navigations/gnb/modules/gnb-search/config';


interface Props {
    items: SuggestionItem[];
    cloudServiceSuggestionItems: SuggestionItem[];
    inputText: string;
    isFocused: boolean;
    focusStartPosition: FocusStartPosition;
}

export default defineComponent<Props>({
    name: 'GNBSearchSuggestionList',
    components: {
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

        const getMatchText = (text: string): string => {
            const res = state.searchRegex.exec(text);
            if (res) return res[0];
            return '';
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
            getMatchText,
            handleSelect,
        };
    },
});
</script>

<style lang="postcss" scoped>
.gnb-search-suggestion-list {
    @apply bg-white border-none;

    &::v-deep {
        .context-header {
            margin-top: 0;
            margin-bottom: 0.25rem;
            padding-left: 1.25rem;
            padding-right: 1.25rem;
        }

        .context-item {
            line-height: 1.75;
            padding: 0.25rem 1.25rem;
        }

        .context-divider {
            margin: 0.875rem 0 1rem;
        }
    }

    .matched-character {
        @apply text-blue-700 bg-blue-200;
    }
}
</style>
