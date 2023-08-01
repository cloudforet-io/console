<script lang="ts" setup>
import { getTextHighlightRegex } from '@spaceone/design-system';
import {
    computed, reactive,
} from 'vue';


const STYLE_TYPE = ['primary', 'secondary'] as const;
type StyleType = typeof STYLE_TYPE[number];

interface Props {
    text: string;
    term: string;
    styleType: StyleType;
}

const props = withDefaults(defineProps<Props>(), {
    text: '',
    term: '',
    styleType: 'primary' as StyleType,
});

const state = reactive({
    regex: computed(() => getTextHighlightRegex(props.term)),
});

const getFirstMatchedString = (str: string): string => {
    const matched = state.regex.exec(str);
    if (matched?.index === 0) {
        return matched[0];
    }
    return '';
};

const getTextList = (str = ''): {text: string; matched: boolean}[] => {
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


</script>

<template>
    <span class="text-highlighting"
          :class="styleType"
    >
        <span v-for="({text: eachText, matched}, i) in getTextList(text)"
              :key="`label-${eachText}-${i}`"
        >
            <span :class="{'matched-character': matched}">{{ eachText }}</span>
        </span>
    </span>
</template>

<style lang="postcss" scoped>
.text-highlighting {
    color: inherit;
    font-weight: inherit;
    font-size: inherit;
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
