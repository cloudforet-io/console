<template>
    <p-box-layout class="p-tags-input" :box-style="boxStyle" @click="onBoxClick">
        <p-tag v-for="(tag, idx) in tagTools.tags" :key="`${idx}-${tag}`"
               @delete="tagTools.deleteTag(idx)"
        >
            {{ tag }}
        </p-tag>
        <p-text-input ref="input" v-model="value"
                      v-focus="focus"
                      :placeholder="placeholder"
                      @keyup.enter="add"
                      @blur="proxyFocus = false"
        />
    </p-box-layout>
</template>

<script>
import { ref } from '@vue/composition-api';
import { makeProxy } from '@/lib/compostion-util';
import PTag, { tagList } from '@/components/molecules/tags/Tag.vue';
import PBoxLayout from '@/components/molecules/layouts/box-layout/BoxLayout.vue';
import PTextInput from '@/components/atoms/inputs/TextInput.vue';

export default {
    name: 'PTagsInput',
    events: ['update:tags'],
    directives: {
        focus: {
            inserted(el, binding) {
                if (binding.value) el.focus();
            },
        },
    },
    components: {
        PTag,
        PBoxLayout,
        PTextInput,
    },
    props: {
        boxStyle: {
            type: String,
            default: 'primary4',
        },
        placeholder: {
            type: String,
            default: undefined,
        },
        tags: Array,
        noDuplicate: {
            type: Boolean,
            default: true,
        },
        focus: {
            type: Boolean,
            default: true,
        },
    },
    setup(props, { emit, refs }) {
        const tagTools = tagList(makeProxy('tags', props, emit), props.noDuplicate);
        const value = ref(props.placeholder);

        const add = () => {
            tagTools.addTag(value.value);
            value.value = '';
        };

        const onBoxClick = () => {
            refs.input.focus();
        };

        return {
            value,
            tagTools,
            add,
            onBoxClick,
        };
    },
};
</script>

<style lang="scss">
.p-tags-input {
    cursor: text;
    input[type="text"].p-text-input {
        border: none;
        background-color: transparent;
        padding-left: 0;
        min-height: unset;
        line-height: unset;
    }
}
</style>
