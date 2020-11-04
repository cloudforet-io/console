<template>
    <div class="p-dynamic-layout-html">
        <p-panel-top v-if="name">
            {{ name }}
        </p-panel-top>
        <div v-html="iframeData" />
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs,
} from '@vue/composition-api';
import { get } from 'lodash';
import { HtmlDynamicLayoutProps, HtmlFetchOptions } from '@/components/organisms/dynamic-layout/templates/html/type';
import PPanelTop from '@/components/molecules/panel/panel-top/PPanelTop.vue';

export default {
    name: 'PDynamicLayoutHtml',
    components: { PPanelTop },
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
    setup(props: HtmlDynamicLayoutProps, { emit }) {
        const state = reactive({
            rootData: computed<any[]>(() => {
                if (props.options.root_path) {
                    return get(props.data, props.options.root_path, '');
                }
                if (typeof props.data !== 'string') return '';
                return props.data;
            }),
            fetchOptionsParam: computed<HtmlFetchOptions>(() => ({})),
            iframeData: computed(() => `
                <iframe title="${props.name}"
                        style="width: 100%;"
                        srcdoc="${state.rootData}"
                />
            `),
        });


        emit('init', state.fetchOptionsParam);

        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss">
.p-dynamic-layout-html {

}
</style>
