<template>
    <p-box-layout ref="box" class="p-tags-input"
                  :class="{'is-invalid-tags-input':invalid}"
                  :box-style="boxStyle"
                  :style="{maxWidth: maxWidth ? `${maxWidth}px` : undefined}"
                  @click="onBoxClick"
    >
        <p-tag v-for="(tag, idx) in tagTools.tags" :key="`${idx}-${tag}`"
               class="item"
               @delete="onDelete(idx)"
        >
            {{ tag }}
        </p-tag>
        <p-text-input ref="input" v-model="value" v-focus="focus"
                      class="input"
                      :style="{width: autoWidth ? `${inputWidth}px` : undefined}"
                      :placeholder="placeholder"
                      @input="setWidth"
                      @keyup.enter="add"
                      @blur="proxyFocus = false"
        />
        <span v-if="autoWidth"
              ref="fake" class="fake"
        > {{ value || placeholder }}</span>
    </p-box-layout>
</template>

<script lang="ts">
import {
    ref, onMounted, getCurrentInstance, Ref, reactive,
} from '@vue/composition-api';
import { makeProxy } from '@/components/util/composition-helpers';
import PTag from '@/components/molecules/tags/PTag.vue';
import PBoxLayout from '@/components/molecules/layouts/box-layout/PBoxLayout.vue';
import PTextInput from '@/components/atoms/inputs/PTextInput.vue';
import { isEqual } from 'lodash';

const tagList = (proxyTags?: Ref<string[]>|null, checkDuplicate = true, eventBus?: any, eventName?: string, addTagCallBack?: any) => {
    const tags: Ref<any[]> = proxyTags || ref([]);
    if (!tags.value) tags.value = [];

    /**
     * @param idx {Number}
     */
    const deleteTag = (idx: number) => {
        const updatedTags = [...tags.value];
        updatedTags.splice(idx, 1);
        tags.value = updatedTags;
        if (eventBus) { eventBus.$emit(eventName, tags.value); }
        if (addTagCallBack) { addTagCallBack(tags.value); }
    };

    const deleteAllTags = () => {
        tags.value = [];
        if (eventBus) { eventBus.$emit(eventName, tags.value); }
        if (addTagCallBack) { addTagCallBack(tags.value); }
    };

    const validation = value => tags.value.every(tag => !isEqual(tag, value));

    /**
     * @param value {String}
     */
    const addTag = (value) => {
        const val = (typeof value === 'string') ? value.trim() : value;
        if (!val || val === '') return;
        if (checkDuplicate && !validation(val)) return;
        const updatedTags = [...tags.value];
        updatedTags.push(val);
        tags.value = updatedTags;
        if (eventBus) { eventBus.$emit(eventName, tags.value); }
        if (addTagCallBack) { addTagCallBack(tags.value); }
    };

    return reactive({
        tags,
        deleteTag,
        addTag,
        deleteAllTags,
    });
};

export default {
    name: 'PTagsInput',
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
        autoWidth: {
            type: Boolean,
            default: true,
        },
        invalid: {
            type: Boolean,
            default: false,
        },
    },
    // @ts-ignore
    setup(props, { emit, refs }) {
        const tagTools = tagList(makeProxy('tags', props, emit), props.noDuplicate);
        const value = ref(props.placeholder);

        const onBoxClick = () => {
            refs.input.focus();
        };

        const onDelete = (idx) => {
            tagTools.deleteTag(idx);
            emit('change', tagTools.tags);
        };

        const vm: any = getCurrentInstance();

        const box: any = ref(null);
        const fake: any = ref(null);
        const inputWidth = ref(0);
        const maxWidth = ref(0);

        const setWidth = () => {
            if (!props.autoWidth) return;
            vm.$nextTick(() => {
                inputWidth.value = maxWidth.value > fake.value.offsetWidth
                    ? fake.value.offsetWidth : maxWidth.value;
            });
        };

        const add = () => {
            tagTools.addTag(value.value);
            emit('change', tagTools.tags);
            value.value = '';
            setWidth();
        };

        onMounted(() => {
            maxWidth.value = box.value.$el.clientWidth;
            setWidth();
        });

        return {
            value,
            tagTools,
            add,
            onBoxClick,
            onDelete,
            box,
            fake,
            inputWidth,
            maxWidth,
            setWidth,
        };
    },
};
</script>

<style lang="postcss">
.p-tags-input {
    cursor: text;
    vertical-align: middle;
    &.p-box-layout {
        padding-top: 0;
        padding-bottom: 0;
    }
    &.is-invalid-tags-input {
        @apply border-alert;
    }
    .input.p-text-input {
        border: none;
        background-color: transparent;
        min-height: unset;
        line-height: unset;
        padding: 0;
        min-width: 3rem;
        max-width: 100%;
    }
    .fake {
        position: absolute;
        visibility: hidden;
        font-size: 0.875rem;
        border: 1px solid transparent;
        white-space: nowrap;
    }
    .tag-container {
        display: inline-block;
        width: 100%;
    }
    .item {
        display: inline-block;
        margin: 0.25rem;
        white-space: normal;
        &.p-tag:last-child {
            margin-right: 0;
        }
    }
}
</style>
