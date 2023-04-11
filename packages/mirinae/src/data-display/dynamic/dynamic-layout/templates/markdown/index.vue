<template>
    <div class="p-dynamic-layout-markdown">
        <p-heading v-if="layoutName"
                   heading-type="sub"
        >
            {{ layoutName }}
        </p-heading>
        <p-markdown :markdown="options.markdown || ''"
                    :data="rootData"
                    :language="language"
        />
    </div>
</template>

<script lang="ts">
import {
    computed, getCurrentInstance,
    reactive, toRefs,
} from 'vue';
import type Vue from 'vue';

import type {
    MarkdownDynamicLayoutProps,
} from '@/data-display/dynamic/dynamic-layout/templates/markdown/type';
import { getValueByPath } from '@/data-display/dynamic/helper';
import PHeading from '@/data-display/heading/PHeading.vue';
import PMarkdown from '@/data-display/markdown/PMarkdown.vue';


export default {
    name: 'PDynamicLayoutMarkdown',
    components: {
        PMarkdown,
        PHeading,
    },
    props: {
        name: {
            type: String,
            required: true,
        },
        options: {
            type: Object,
            default: () => ({}),
        },
        data: {
            type: [Object, Array, String],
            default: undefined,
        },
        fetchOptions: {
            type: Object,
            default: undefined,
        },
        typeOptions: {
            type: Object,
            default: undefined,
        },
    },
    setup(props: MarkdownDynamicLayoutProps) {
        const vm = getCurrentInstance()?.proxy as Vue;
        const state = reactive({
            layoutName: computed(() => (props.options.translation_id ? vm.$t(props.options.translation_id) : props.name)),
            rootData: computed<any[]>(() => {
                if (props.options.root_path) {
                    return getValueByPath(props.data, props.options.root_path);
                }
                return props.data;
            }),
            language: computed(() => props.typeOptions?.language || 'en'),
        });

        return {
            ...toRefs(state),
        };
    },
};
</script>
