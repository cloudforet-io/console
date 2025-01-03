import type { ComputedRef, Ref } from 'vue';
import { computed } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

export const useEditorContentTransformer = (op?: {
    value: ComputedRef<string>|Ref<string>;
    contentType?: 'html'|'markdown';
}) => {
    const { value, contentType = 'html' } = op || {};
    const baseUri = SpaceConnector.restClient.getUri();

    const replaceImageUrl = (url: string): string => {
        const pattern = new RegExp(`${baseUri}/files/[^/]+/(file-[^?]+)\\?token=.*`);
        const match = url.match(pattern);
        if (match && match[1]) {
            return `{${match[1]}}`; // Extract only the fileId and return it in the format {fileId}.
        }
        return url;
    };

    const transformHtmlContent = (content: string): string => {
        const imagePattern = /<img\s+[^>]*src="([^"]+)"[^>]*>/g;
        return content.replace(imagePattern, (match, url) => {
            const newUrl = replaceImageUrl(url);
            return match.replace(url, newUrl);
        });
    };
    const transformMarkdownContent = (content: string): string => {
        const markdownImagePattern = /!\[([^\]]*)\]\(([^)]+)\)/g;
        return content.replace(markdownImagePattern, (match, altText, url) => {
            const newUrl = replaceImageUrl(url);
            return `![${altText}](${newUrl})`;
        });
    };

    const transformEditorContent = (content: string, _contentType: 'html'|'markdown'): string => {
        if (_contentType === 'markdown') {
            return transformMarkdownContent(content);
        }
        return transformHtmlContent(content);
    };


    const transformedEditorContent = computed(() => transformEditorContent(value ? value.value : '', contentType));

    return {
        transformedEditorContent,
        transformEditorContent,
    };
};
