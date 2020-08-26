<template>
    <div class="p-dynamic-layout-markdown">
        <p-panel-top v-if="name">
            {{ name }}
        </p-panel-top>
        <p-markdown :markdown="options.markdown || ''"
                    :data="rootData"
                    :language="language"
        />
    </div>
</template>

<script lang="ts">
import {
    computed,
    reactive, toRefs,
} from '@vue/composition-api';
import PPanelTop from '@/components/molecules/panel/panel-top/PPanelTop.vue';
import PMarkdown from '@/components/molecules/markdown/PMarkdown.vue';
import { get } from 'lodash';
import {
    MarkdownDynamicLayoutProps,
    MarkdownFetchOptions,
} from '@/components/organisms/dynamic-layout/templates/markdown/type';


export default {
    name: 'PDynamicLayoutMarkdown',
    components: {
        PPanelTop, PMarkdown,
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
            type: [Array, Object],
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
    setup(props: MarkdownDynamicLayoutProps, { emit }) {
        const state = reactive({
            rootData: computed<any[]>(() => {
                if (props.options.root_path) {
                    return get(props.data, props.options.root_path);
                }
                return props.data;
            }),
            language: computed(() => props.typeOptions?.language || 'en'),
            fetchOptionsParam: computed<MarkdownFetchOptions>(() => ({})),
        });

        emit('init', state.fetchOptionsParam);


        return {
            ...toRefs(state),
        };
    },
};
</script>
