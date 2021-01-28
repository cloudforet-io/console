<template>
    <div class="p-dynamic-layout-html">
        <p-panel-top v-if="layoutName">
            {{ layoutName }}
        </p-panel-top>
        <div class="inner">
            <iframe ref="iframeRef" :title="name"
                    scrolling="no"
                    :srcdoc="iframeData"
                    @load="onLoadIFrame"
            />
        </div>
    </div>
</template>

<script lang="ts">
import {
    ComponentRenderProxy,
    computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';
import { get } from 'lodash';
import { HtmlDynamicLayoutProps, HtmlFetchOptions } from '@/organisms/dynamic-layout/templates/html/type';
import PPanelTop from '@/molecules/panel/panel-top/PPanelTop.vue';
import DOMPurify from 'dompurify';
import { iframeStyle } from './style';


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
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            layoutName: computed(() => (props.options.translation_id ? vm.$t(props.options.translation_id) : props.name)),
            rootData: computed<any[]>(() => {
                if (props.options.root_path) {
                    return get(props.data, props.options.root_path, '');
                }
                if (typeof props.data !== 'string') return '';
                return props.data;
            }),
            fetchOptionsParam: computed<HtmlFetchOptions>(() => ({})),
            iframeData: computed(() => DOMPurify.sanitize(state.rootData)),
        });


        const resizeIframe = (e) => {
            e.target.style.height = `${e.target.contentDocument.documentElement.scrollHeight}px`;
        };
        const onLoadIFrame = (e) => {
            const el = document.createElement('style');
            el.textContent = iframeStyle;
            e.target.contentDocument.head.appendChild(el);
            resizeIframe(e);
        };
        emit('init', state.fetchOptionsParam);

        return {
            ...toRefs(state),
            onLoadIFrame,
        };
    },
};
</script>

<style lang="postcss">
.p-dynamic-layout-html {
    .inner {
        width: 100%;
        min-height: 15rem;
        overflow-y: auto;
    }
    iframe {
        width: 100%;
        padding: 0 0.5rem;
    }
}
</style>
