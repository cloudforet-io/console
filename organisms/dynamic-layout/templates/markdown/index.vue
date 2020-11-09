<template>
    <div class="p-dynamic-layout-markdown">
        <p-panel-top v-if="layoutName">
            {{ layoutName }}
        </p-panel-top>
        <p-markdown :markdown="options.markdown || ''"
                    :data="rootData"
                    :language="language"
        />
    </div>
</template>

<script lang="ts">
import {
    ComponentRenderProxy,
    computed, getCurrentInstance,
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
    setup(props: MarkdownDynamicLayoutProps, { emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            layoutName: computed(() => (props.options.translation_id ? vm.$t(props.options.translation_id) : props.name)),
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
