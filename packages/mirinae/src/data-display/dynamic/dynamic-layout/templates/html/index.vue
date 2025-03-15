<template>
    <div class="p-dynamic-layout-html">
        <p-heading v-if="layoutName"
                   class="pt-8 px-4 pb-4"
                   heading-type="sub"
        >
            {{ layoutName }}
        </p-heading>
        <div class="inner">
            <iframe ref="iframeRef"
                    :title="name"
                    scrolling="no"
                    :srcdoc="iframeData"
                    @load="onLoadIFrame"
            />
        </div>
    </div>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import {
    computed, defineComponent, getCurrentInstance, reactive, toRefs,
} from 'vue';
import type { Vue } from 'vue/types/vue';

import DOMPurify from 'dompurify';

import type { DynamicLayoutFetchOptions, DynamicLayoutTypeOptions } from '@/data-display/dynamic/dynamic-layout/type';
import type { HtmlOptions } from '@/data-display/dynamic/dynamic-layout/type/layout-schema';
import { getValueByPath } from '@/data-display/dynamic/helper';
import PHeading from '@/data-display/heading/PHeading.vue';

import { iframeStyle } from './style';


DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    // set all elements owning target to target=_blank
    if ('target' in node as never) {
        node.setAttribute('target', '_blank');
        node.setAttribute('rel', 'noopener');
    }
});
export default defineComponent({
    name: 'PDynamicLayoutHtml',
    components: { PHeading },
    props: {
        name: {
            type: String,
            required: true,
        },
        options: {
            type: Object as PropType<HtmlOptions>,
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
                    return getValueByPath(props.data, props.options.root_path) ?? '';
                }
                if (typeof props.data !== 'string') return '';
                return props.data;
            }),
            iframeData: computed(() => DOMPurify.sanitize(state.rootData, { ALLOWED_TAGS: ['a', 'br'], ALLOWED_ATTR: ['target', 'href'] })),
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

        return {
            ...toRefs(state),
            onLoadIFrame,
        };
    },
});
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
