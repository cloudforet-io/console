<template>
    <span class="p-text-highlighting"
          :class="styleType"
          v-on="$listeners"
    >
        <span v-for="(x, i) in textList"
              :key="`label-${(x.text)}-${i}`"
              :class="{'matched-character': x.matched}"
              class="text"
        >
            <slot v-bind="{ textList, text:x.text, matched:x.matched, index: i, regex }">{{ x.text }}</slot>
        </span>
    </span>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import {
    computed, defineComponent, reactive, toRefs,
} from 'vue';

import type {
    TextHighlightingProps,
    TextHighlightingStyleType,
} from '@/data-display/text-highlighting/type';
import {
    TEXT_HIGHLIGHTING_STYLE_TYPE,
} from '@/data-display/text-highlighting/type';
import { getTextHighlightRegex } from '@/utils/helpers';

interface TextItem {
    text: string;
    matched: boolean;
}

export default defineComponent<TextHighlightingProps>({
    name: 'PTextHighlighting',
    components: {},
    props: {
        text: {
            type: String,
            default: '',
        },
        term: {
            type: String,
            default: '',
        },
        styleType: {
            type: String as PropType<TextHighlightingStyleType>,
            default: TEXT_HIGHLIGHTING_STYLE_TYPE[0],
            validator(styleType: TextHighlightingStyleType) {
                return TEXT_HIGHLIGHTING_STYLE_TYPE.includes(styleType);
            },
        },
    },
    setup(props) {
        const state = reactive({
            regex: computed(() => getTextHighlightRegex(props.term)),
            // eslint-disable-next-line no-use-before-define
            textList: computed<TextItem[]>(() => getTextList(props.text)),
        });

        const getFirstMatchedString = (str: string): string => {
            const matched = state.regex.exec(str);
            if (matched?.index === 0) {
                return matched[0];
            }
            return '';
        };

        const getTextList = (str = ''): TextItem[] => {
            if (!props.term?.trim()) return [{ text: str, matched: false }];

            const regex = state.regex;
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


        return {
            ...toRefs(state),
            getTextList,
        };
    },
});

</script>

<style lang="postcss">
.p-text-highlighting {
    color: inherit;
    font-weight: inherit;
    font-size: inherit;
    > .text {
        word-break: break-all;
    }
    &.primary {
        .matched-character {
            @apply text-blue-700 bg-blue-200;
        }
    }
    &.secondary {
        .matched-character {
            font-weight: bold;
        }
    }
}
</style>
