<template>
    <div class="p-mark-down" v-html="md" />
</template>

<script lang="ts">
import {
    computed, reactive, watch,
} from '@vue/composition-api';
import nunjucks from 'nunjucks';
import { get } from 'lodash';
import DOMPurify from 'dompurify';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const marked = require('marked');

marked.setOptions({
    gfm: true,
    breaks: true,
    pedantic: false,
    highlight(code, language) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires,global-require
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
        const getI18nMd = (md: any) => get(md, props.language, md[DEFAULT_LANGUAGE] || Object.values(md)[0] || '');
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
.p-mark-down {
    @apply w-full border-black text-gray-900 ;
    table {
        td,th {
            @apply px-4 py-2;
        }
        thead {
            tr {
                th, td {
                    @apply border-black border-t border-b font-bold;
                }
            }
        }
        tbody {
            tr {
                td,th {
                    @apply border-gray-300 border-b;
                }
            }
        }
    }
    a {
        @apply text-blue-600;
        &:hover { @apply underline; }
    }
    code {
        @apply bg-gray-200 rounded-sm px-1;
        font-family: courier, monospace;
    }
    pre {
        code {
            all: inherit;
        }
    }
    ul {
        @apply list-disc block;
        margin-block-start: 0.5rem;
        margin-block-end: 0.5rem;
        margin-inline-start: 0;
        margin-inline-end: 0;
        padding-inline-start: 2rem;

        ul {
            list-style: circle;
        }
    }
    ol {
        @apply block list-decimal ;
        margin-block-start: 0.5rem;
        margin-block-end: 0.5rem;
        margin-inline-start: 0;
        margin-inline-end: 0;
        padding-inline-start: 2rem;
    }
    h1, h2, h3, h4 {
        @apply font-bold ;
    }
    h1 {
        @apply text-3xl mb-4 mt-8;
    }
    h2 {
        @apply text-2xl mb-3 mt-8;
    }
    h3 {
        @apply text-xl mb-2 mt-8;
    }
    h4 {
        @apply text-base mb-2 mt-5;
    }
    h5, h6 {
        @apply text-base mb-2 mt-5 ;
    }
    p, ul > li, ol > li {
        @apply text-sm leading-tight ;
    }
}

</style>
