import { debouncedWatch } from '@vueuse/core';
import type { Ref } from 'vue';
import {
    ref, isRef, watch, isReadonly,
} from 'vue';

import isEqual from 'lodash/isEqual';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ContentsType } from '@/api-clients/_common/schema/type';

import { getFileDownloadUrl } from '@/lib/file-manager';
import type { FileManagerResourceGroupType } from '@/lib/file-manager/type';

const getRef = <T>(v: T|Ref<T>|Readonly<Ref<T>>): Ref<T> => {
    if (isRef<T>(v)) {
        if (isReadonly(v)) {
            const nv = ref<T>(v.value) as Ref<T>;
            watch(v, (value) => { // sync readonly ref
                if (nv.value !== value) nv.value = value;
            });
            return nv;
        }
        return v;
    }
    return ref<T>(v) as Ref<T>;
};
const decodeHtmlEntities = (encodedHtml: string): string => new DOMParser().parseFromString(encodedHtml, 'text/html').documentElement.textContent ?? '';

export const useEditorContentTransformer = (op: {
    contents?: string|Ref<string>|Readonly<Ref<string>>;
    contentsType: ContentsType|Ref<ContentsType>;
    fileIds?: string[]|Ref<string[]>|Readonly<Ref<string[]>>;
    resourceGroup: FileManagerResourceGroupType|Ref<FileManagerResourceGroupType>;
    resourceId?: string|Ref<string|undefined>;
}) => {
    const contents = getRef<string>(op.contents ?? '');
    const fileIds = getRef<string[]>(op.fileIds ?? []);
    const contentsType = isRef(op.contentsType) ? op.contentsType : ref<ContentsType>(op.contentsType);
    const resourceGroup = isRef(op.resourceGroup) ? op.resourceGroup : ref<FileManagerResourceGroupType>(op.resourceGroup);
    const resourceId = getRef<string|undefined>(op.resourceId);

    const baseUri = SpaceConnector.restClient.getUri();

    const replaceImageUrl = (url: string): string => {
        const pattern = new RegExp(`${baseUri}/files/[^/]+/(file-[^?]+)\\?token=.*`);
        const match = url.match(pattern);
        // Extract only the fileId and return it in the format <fileId>.
        return match?.[1] ? `@@${match[1]}@@` : url;
    };

    const transformHtmlContentForUpload = (content: string): string => {
        const imagePattern = /<img\s+[^>]*src="([^"]+)"[^>]*>/g;
        return content.replace(imagePattern, (match, url) => {
            const newUrl = replaceImageUrl(url);
            return match.replace(url, newUrl);
        });
    };
    const transformMarkdownContentForUpload = (content: string): string => {
        const markdownImagePattern = /!\[([^\]]*)\]\(([^)]+)\)/g;
        return content.replace(markdownImagePattern, (match, altText, url) => {
            const newUrl = replaceImageUrl(url);
            return `![${altText}](${newUrl})`;
        });
    };

    const transformEditorContentForUpload = (content: string): string => {
        if (contentsType.value === 'markdown') {
            return transformMarkdownContentForUpload(content);
        }
        return transformHtmlContentForUpload(content);
    };

    const htmlFileImagePattern = /<img\s+[^>]*src="@@(file-.+?)@@"[^>]*>/g;
    const transformHtmlContentForView = (content: string): string => {
        const decodedHtml = decodeHtmlEntities(content);
        return decodedHtml.replace(htmlFileImagePattern, (match, url) => {
            const newUrl = getFileDownloadUrl(replaceImageUrl(url), resourceGroup.value);
            return match.replace(url, newUrl);
        });
    };

    const markdownFileImagePattern = /!\[([^\]]*)\]\(@@(file-.+?)@@\)/g;
    const transformMarkdownContentForView = (content: string): string => {
        const decodedMarkdown = decodeHtmlEntities(content);
        const result = decodedMarkdown.replace(markdownFileImagePattern, (match, altText, fileId) => `![${altText}](${getFileDownloadUrl(fileId, resourceGroup.value)})`);
        return result;
    };

    const transformEditorContentForView = (content: string): string => {
        if (contentsType.value === 'markdown') {
            return transformMarkdownContentForView(content);
        }
        return transformHtmlContentForView(content);
    };

    const getFileIdsFromContents = (content: string): string[] => {
        if (contentsType.value === 'markdown') {
            return Array.from(content.matchAll(markdownFileImagePattern)).map((match) => match[2]);
        }
        return Array.from(content.matchAll(htmlFileImagePattern)).map((match) => match[1]);
    };

    const editorContents = ref<string>(transformEditorContentForView(contents.value));
    const updateEditorContents = (newContents: string) => {
        editorContents.value = newContents;
    };

    // When contents(from server) is changed, update editorContents(view data)
    watch(contents, (c) => {
        const ec = transformEditorContentForView(c);
        if (editorContents.value !== ec) {
            editorContents.value = ec;
        }
    });
    // When editorContents(view data) is changed by input, update contents(for server)
    debouncedWatch(editorContents, (ec) => {
        const c = transformEditorContentForUpload(ec);
        if (contents.value !== c) {
            contents.value = c;
            const newFileIds = getFileIdsFromContents(c);
            if (!isEqual(fileIds.value, newFileIds)) {
                fileIds.value = newFileIds;
            }
        }
    }, { debounce: 300 });

    // When resourceGroup or resourceId is changed, update editorContents(view data)
    watch([resourceGroup, resourceId, contentsType], () => {
        editorContents.value = transformEditorContentForView(contents.value);
    });
    return {
        editorContents,
        contents,
        fileIds,
        transformEditorContentForUpload,
        transformEditorContentForView,
        getFileIdsFromContents,
        updateEditorContents,
    };
};
