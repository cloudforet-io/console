import type { Ref } from 'vue';
import { computed, isRef } from 'vue';

import DOMPurify from 'dompurify';
import hljs from 'highlight.js';
import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';

export interface UseMarkdownOptions {
    value: Ref<string>|string; // Markdown content to display. string or Ref<string>
    inlineCodeClass?: string; // Class name for inline code
    codeBlockHighlighting?: boolean; // Whether to apply code block highlighting
}
export interface UseMarkdownReturn {
    sanitizedHtml: Ref<string>; // Sanitized HTML content
}
export const useMarkdown = ({
    value, inlineCodeClass, codeBlockHighlighting,
}: UseMarkdownOptions): UseMarkdownReturn => {
    const marked = new Marked(codeBlockHighlighting ? markedHighlight({
        emptyLangClass: 'hljs',
        langPrefix: 'hljs language-',
        highlight(code, lang) {
            const language = hljs.getLanguage(lang) ? lang : 'plaintext';
            return hljs.highlight(code, { language }).value;
        },
    }) : {});
    marked.use({
        gfm: true,
        breaks: true,
        pedantic: false,

    });
    const sanitizedHtml = computed(() => {
        let doc = isRef(value) ? value.value ?? '' : value ?? '';
        try {
            doc = marked.parse(doc) as string;
        } catch (e) {
            console.error('[Mirinae] Markdown parsing error: ', e);
        }
        if (inlineCodeClass) {
            doc = doc.replace(/(<pre>[\s\S]*?<\/pre>)|(<code)/g, (match, codeBlock, inlineCode) => {
                if (inlineCode) {
                    return `<code class="${inlineCodeClass}"`; // Apply class to inline code only
                }
                return codeBlock; // Do not apply class to code block (code block inside pre tag)
            });
        }
        if (codeBlockHighlighting) doc = doc.replace(/<pre>/g, '<pre class="hljs">');
        doc = doc.replace(/<a /g, '<a target="_blank"');

        return DOMPurify.sanitize(doc, { ADD_ATTR: ['target'] });
    });

    return {
        sanitizedHtml,
    };
};
