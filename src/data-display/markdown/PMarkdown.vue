<template>
    <!-- eslint-disable -->
    <div class="p-markdown" v-html="md" :class="{'remove-spacing': removeSpacing}" />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';

import DOMPurify from 'dompurify';
import { render } from 'ejs';
import hljs from 'highlight.js';
import { get } from 'lodash';
import { marked } from 'marked';

import type { MarkdownProps } from '@/data-display/markdown/type';



marked.setOptions({
    gfm: true,
    breaks: true,
    pedantic: false,
    highlight: (code, language) => {
        const validLanguage = hljs.getLanguage(language) ? language : 'plaintext';
        const result = hljs.highlight(validLanguage, code);
        return result.value;
    },
});
const DEFAULT_LANGUAGE = 'en';

export default defineComponent<MarkdownProps>({
    name: 'PMarkdown',
    props: {
        markdown: {
            type: [String, Object],
            default: '',
        },
        data: {
            type: Object,
            default: undefined,
        },
        language: {
            type: String,
            default: 'en',
        },
        removeSpacing: {
            type: Boolean,
            default: false,
        },
    },
    setup(props) {
        const getI18nMd = (md: any) => get(md, props.language, md[DEFAULT_LANGUAGE] || Object.values(md)[0] || '');
        const md = computed(() => {
            let doc = typeof props.markdown === 'object' ? getI18nMd(props.markdown) : props.markdown || '';
            if (props.data) {
                doc = render(doc, props.data);
            }
            marked.parse(doc, (error, parseResult) => {
                if (error) console.error('[Mirinae] Markdown parsing error: ', error);
                else {
                    doc = parseResult.replace(/<pre>/g, '<pre class="hljs"');
                }
            });

            return DOMPurify.sanitize(doc);
        });
        return {
            md,
        };
    },
});
</script>

<style lang="postcss">
@import 'highlight.js/scss/atom-one-dark.scss';
.p-markdown {
    @apply text-gray-900;
    &:not(.remove-spacing) {
        @apply w-full border-black;
        padding-top: 1.5rem;
        padding-bottom: 1rem;
        padding-left: 1rem;
    }
    &.remove-spacing {
        p:last-child {
            margin-bottom: 0;
        }
    }
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
        @apply text-blue-700;
        font-size: 0.75rem;
        line-height: 150%;
        margin-bottom: 1.5rem;
        &:hover { @apply underline; }
    }
    code {
        @apply bg-gray-200 rounded-xs px-1;
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
    h3, h4 {
        @apply font-bold;
    }
    h1 {
        @apply font-normal;
        font-size: 1.5rem;
        line-height: 150%;
        margin-bottom: 1.5rem;
    }
    h2 {
        @apply font-bold;
        font-size: 1rem;
        margin-bottom: 0.5rem;
        line-height: 150%;
    }
    h3 {
        @apply mb-2 mt-8;
        font-size: 0.875rem;
        line-height: 150%;
    }
    h4, h5, h6 {
        @apply mb-2 mt-5;
        font-size: 0.75rem;
        line-height: 150%;
    }
    p, ul > li, ol > li {
        font-size: 0.75rem;
        line-height: 150%;
        margin-bottom: 1.5rem;
    }
}

</style>
