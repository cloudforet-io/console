<template>
    <div class="p-dynamic-layout-markdown">
        <p-heading v-if="layoutName"
                   class="pt-8 px-4 pb-4"
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
    computed, defineComponent, getCurrentInstance,
    reactive, toRefs,
} from 'vue';
import type { PropType } from 'vue';
import type Vue from 'vue';

import type { DynamicLayoutFetchOptions, DynamicLayoutTypeOptions } from '@/data-display/dynamic/dynamic-layout/type';
import type { MarkdownOptions } from '@/data-display/dynamic/dynamic-layout/type/layout-schema';
import { getValueByPath } from '@/data-display/dynamic/helper';
import PHeading from '@/data-display/heading/PHeading.vue';
import PMarkdown from '@/data-display/markdown/PMarkdown.vue';


export default defineComponent({
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
            type: Object as PropType<MarkdownOptions>,
            default: () => ({}),
        },
        data: {
            type: [Object, Array, String],
            default: undefined,
        },
        fetchOptions: {
            type: Object as PropType<DynamicLayoutFetchOptions>,
            default: undefined,
        },
        typeOptions: {
            type: Object as PropType<DynamicLayoutTypeOptions>,
            default: undefined,
        },
    },
    setup(props) {
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
});
</script>
