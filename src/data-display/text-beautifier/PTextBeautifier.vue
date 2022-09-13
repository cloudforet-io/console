<template>
    <component :is="tag" class="p-text-beautifier">
        <template v-if="matchList.length > 0">
            {{ matchList[0].index > 0 ? stringValue.substring(0, matchList[0].index) : '' }}
            <template v-for="({ lastIndex, text, url}, matchIndex) in matchList">
                <a :key="matchIndex" :href="url" target="_blank">
                    {{ text }}
                </a>
                {{ stringValue.substring(lastIndex, matchList[matchIndex + 1] ? matchList[matchIndex + 1].index : undefined) }}
            </template>
        </template>
        <template v-else>
            {{ stringValue }}
        </template>
    </component>
</template>

<script lang="ts">
import {
    computed,
    defineComponent, reactive, toRefs,
} from 'vue';

import linkifyIt from 'linkify-it';

interface TextBeautifierProps {
    value: any
}

const linkify = linkifyIt();

export default defineComponent<TextBeautifierProps>({
    name: 'PTextBeautifier',
    props: {
        value: {
            type: [String, Number, Boolean, Array, Object],
            default: '',
        },
        tag: {
            type: String,
            default: 'span',
        },
    },
    setup(props) {
        const state = reactive({
            stringValue: computed(() => {
                if (typeof props.value === 'string') return props.value;
                return props.value?.toString() ?? '';
            }),
            matchList: computed(() => linkify.match(props.value) ?? []),
        });

        return {
            ...toRefs(state),
        };
    },
});
</script>

<style lang="postcss">
.p-text-beautifier {
    line-height: inherit;
    > a {
        @apply text-blue-700;

        @media (hover: hover) {
            &:hover {
                @apply text-blue-800 underline;
            }
        }
    }
}
</style>
