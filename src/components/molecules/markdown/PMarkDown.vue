<template>
    <div class="p-mark-down" v-html="md" />
</template>

<script lang="ts">
import {
    computed, reactive, watch,
} from '@vue/composition-api';
import nunjucks from 'nunjucks';
import _ from 'lodash';
import DOMPurify from 'dompurify';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const marked = require('marked');

marked.setOptions({
    gfm: true,
    breaks: true,
    pedantic: false,
    highlight(code, language) {
        const hljs = require('highlight.js');
        const validLanguage = hljs.getLanguage(language) ? language : 'plaintext';
        const result = hljs.highlight(validLanguage, code);
        return result.value;
    },
});
const DEFAULT_LANGUAGE = 'en';

export default {
    name: 'PMarkDown',
    props: {
        markdown: {
            type: [String, Object],
            default: '',
        },
        data: {
            type: Object,
            default: null,
        },
        language: {
            type: String,
            default: 'en',
        },
    },
    setup(props) {
        const getI18nMd = (md: any) => _.get(md, props.language, md[DEFAULT_LANGUAGE] || Object.values(md)[0] || '');
        const md = computed(() => {
            let doc = typeof props.markdown === 'object' ? getI18nMd(props.markdown) : props.markdown || '';
            if (props.data) {
                doc = nunjucks.renderString(doc, props.data);
            }
            doc = marked(doc).replace(/<pre>/g, '<pre class="hljs"');
            return DOMPurify.sanitize(doc);
        });
        return {
            md,
        };
    },
};
</script>

<style lang="postcss">
.p-mark-down{
    @apply w-full border-black;
    table{
        td,th{
            @apply px-4 py-2;
        }
        thead{
            tr{
                th, td{
                    @apply border-black border-t border-b font-bold;
                }
            }
        }
        tbody{
            tr{
                td,th{
                    @apply border-gray-300 border-b;
                }

            }

        }
    }
    a {
        @apply text-blue-600 underline;
    }
    code{
        @apply bg-gray-200 rounded-sm px-1;
        font-family: courier, monospace;

    }
    pre{
        code{
            all: inherit;
        }

    }
    ul{
        @apply list-disc block;
        margin-block-start: 1em;
        margin-block-end: 1em;
        margin-inline-start: 0px;
        margin-inline-end: 0px;
        padding-inline-start: 40px;

        ul{
            list-style: circle;
        }
    }
    ol{
        @apply block list-decimal ;
        margin-block-start: 1em;
        margin-block-end: 1em;
        margin-inline-start: 0px;
        margin-inline-end: 0px;
        padding-inline-start: 40px;
    }
    h1, h2, h3, h4, h5, h6{
        @apply font-bold mb-1;
        line-height: 100%;
    }
    h1{
        @apply text-3xl  mt-8 ;
    }
    h2{
        @apply text-2xl  mt-6 ;
    }
    h3{
        @apply text-xl  mt-4 ;
    }
    h4{
        @apply text-sm  mt-2 ;
    }
    h5,h6{
        @apply text-xs ;
    }

    p{
        @apply my-2;
    }
}


</style>
