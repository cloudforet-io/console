<template>
    <div v-if="!isLoading" class="s-dynamic-layout-markdown">
        <p-panel-top v-if="showTitle">
            {{ name }}
        </p-panel-top>
        <div class="contents" v-html="md" />
    </div>
</template>

<script lang="ts">
import { computed, onMounted, watch } from '@vue/composition-api';
import PPanelTop from '@/components/molecules/panel/panel-top/PanelTop.vue';
import nunjucks from 'nunjucks';
import hljs from 'highlight.js/lib/core';
import 'highlight.js/scss/dracula.scss';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const marked = require('marked');

export default {
    name: 'SDynamicLayoutItem',
    components: {
        PPanelTop,
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
            type: Object,
            default: null,
        },
        isLoading: {
            type: Boolean,
            required: true,
        },
        showTitle: {
            type: Boolean,
            default: true,
        },
    },
    setup(props) {
        // const regx = new RegExp('<pre(?:.|\\n)*(?<codeblock><code.*>(?<code>(?:.|\\n)*)</code>)(?:.|\\n)*</pre>');

        const md = computed(() => {
            if (props.options.markdown) {
                let doc = props.options.markdown;
                if (props.data) {
                    doc = nunjucks.renderString(doc, props.data);
                }
                const renderMD = marked(doc);
                // console.debug(renderMD);
                // const toHljs = renderMD.replace(regx, (...args) => {
                //     const group = args[args.length - 1];
                //     console.debug(hljs.highlightAuto(group.code));
                //     return `<pre class="hljs">${group.codeblock}</pre>`;
                // });
                // return toHljs;
                console.debug(renderMD);
                const toHljs = renderMD.replace(/<pre>/g, () => '<pre class="hljs">');
                return toHljs;
            }
            return '';
        });
        return {
            md,
        };
    },
};
</script>

<style lang="postcss" >
    .s-dynamic-layout-markdown{
    .contents{
        @apply w-full border-black;
        /*pre{*/
        /*    @apply bg-gray-500 text-white;*/
        /*}*/
        table{
            @apply border border-black;
            thead{
                tr{
                    th {
                        @apply border border-black;
                    }
                    td{
                        @apply border border-black;
                    }
                }
            }
            tbody{
                tr{
                    td{
                        @apply border border-black;
                    }
                    th{
                        @apply border border-black;
                    }
                }

            }

        }

        h1{
            @apply text-4xl font-bold mt-8 mb-1;
            line-height: 100%;
        }
        h2{
            @apply text-3xl font-bold mt-6 mb-1;
            line-height: 100%;
        }
        h3{
            @apply text-2xl font-bold mt-4 mb-1;
            line-height: 100%;
        }
        h4{
            @apply text-xl font-bold mt-2 mb-1;
            line-height: 100%;
        }
        h5{
            @apply text-sm font-bold mb-1;
            line-height: 100%;
        }
        p{
            @apply my-2;
        }
    }
    }


</style>
