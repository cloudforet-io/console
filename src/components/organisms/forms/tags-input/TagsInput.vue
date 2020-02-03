<template>
    <p-box-layout class="p-tags-input" :box-style="boxStyle" @click="onBoxClick">
        <p-tag v-for="(tag, idx) in tagTools.tags" :key="`${idx}-${tag}`"
               class="item" @delete="onDelete(idx)"
        >
            {{ tag }}
        </p-tag>
        <p-text-input ref="input" v-model="value" v-focus="focus"
                      class="item input"
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
    events: ['update:tags', 'change'],
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
            emit('change', tagTools.tags);
            value.value = '';
        };

        const onBoxClick = () => {
            refs.input.focus();
        };

        const onDelete = (idx) => {
            tagTools.deleteTag(idx);
            emit('change', tagTools.tags);
        };

        return {
            value,
            tagTools,
            add,
            onBoxClick,
            onDelete,
        };
    },
};
</script>

<style lang="scss">
.p-tags-input {
    cursor: text;
    vertical-align: middle;
    &.p-box-layout {
        padding-bottom: 0;
    }
    .item {
        display: inline-block;
        margin-bottom: .5rem;
        &.p-tag:last-child {
            margin-right: 0;
        }
        &.p-text-input {
            border: none;
            background-color: transparent;
            padding-left: 0;
            min-height: unset;
            line-height: unset;
        }
    }
}
</style>
