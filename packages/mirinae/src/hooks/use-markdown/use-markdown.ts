import type { Ref } from 'vue';
import { computed, isRef } from 'vue';

import DOMPurify from 'dompurify';
import hljs from 'highlight.js';
import { marked } from 'marked';

export interface UseMarkdownOptions {
    value: Ref<string>|string; // Markdown content to display. string or Ref<string>
}
export interface UseMarkdownReturn {
    sanitizedHtml: Ref<string>; // Sanitized HTML content
}
export const useMarkdown = ({ value }: UseMarkdownOptions): UseMarkdownReturn => {
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
    const sanitizedHtml = computed(() => {
        let doc = isRef(value) ? value.value ?? '' : value ?? '';
        marked.parse(doc, (error, parseResult) => {
            if (error) console.error('[Mirinae] Markdown parsing error: ', error);
            else {
                doc = parseResult.replace(/<pre>/g, '<pre class="hljs"').replace(/<a /g, '<a target="_blank"');
            }
        });

        return DOMPurify.sanitize(doc, { ADD_ATTR: ['target'] });
    });

    return {
        sanitizedHtml,
    };
};
