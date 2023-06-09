<template>
    <component :is="tag"
               class="p-text-beautifier"
    >
        <template v-if="state.matchList.length > 0">
            {{ state.matchList[0].index > 0 ? state.stringValue.substring(0, state.matchList[0].index) : '' }}
            <template v-for="({ lastIndex, text, url}, matchIndex) in state.matchList"
                      :key="matchIndex"
            >
                <a :href="url"
                   target="_blank"
                >
                    {{ text }}
                </a>
                {{ state.stringValue.substring(lastIndex, state.matchList[matchIndex + 1] ? state.matchList[matchIndex + 1].index : undefined) }}
            </template>
        </template>
        <template v-else>
            {{ state.stringValue }}
        </template>
    </component>
</template>

<script setup lang="ts">
import linkifyIt from 'linkify-it';
import { computed, reactive } from 'vue';

interface TextBeautifierProps {
    value: any,
    tag?: string,
}

const linkify = linkifyIt();

const props = withDefaults(defineProps<TextBeautifierProps>(), {
    value: '',
    tag: 'span',
});

const state = reactive({
    stringValue: computed(() => {
        if (typeof props.value === 'string') return props.value;
        return props.value?.toString() ?? '';
    }),
    matchList: computed(() => linkify.match(props.value) ?? []),
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
